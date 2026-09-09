import { getSettings } from './settings'

export type ZarinpalConfig = {
  merchantId: string
  isSandbox: boolean
  isEnabled: boolean
}

export async function getZarinpalConfig(): Promise<ZarinpalConfig> {
  const settings = await getSettings([
    'zarinpal_merchant_id',
    'zarinpal_sandbox',
    'payment_gateway_enabled'
  ])

  const merchantId = (settings.zarinpal_merchant_id || process.env.ZARINPAL_MERCHANT_ID || '').trim()
  const isSandbox = (settings.zarinpal_sandbox === 'true' || process.env.ZARINPAL_SANDBOX === 'true')
  const isEnabled = (settings.payment_gateway_enabled === 'true' || process.env.PAYMENT_GATEWAY_ENABLED === 'true')

  return {
    merchantId,
    isSandbox,
    isEnabled
  }
}

export type PaymentRequestParams = {
  amount: number // in Rials
  description: string
  orderId: string
  callbackUrl: string
  mobile?: string
  email?: string
}

export type PaymentRequestResult = {
  success: boolean
  authority?: string
  paymentUrl?: string
  error?: string
}

export async function requestZarinpalPayment(params: PaymentRequestParams): Promise<PaymentRequestResult> {
  const config = await getZarinpalConfig()

  if (!config.merchantId) {
    return {
      success: false,
      error: 'مرچنت‌آیدی یا کد زرین‌پال در پنل مدیریت تنظیم نشده است.'
    }
  }

  const endpoint = config.isSandbox
    ? 'https://sandbox.zarinpal.com/pg/v4/payment/request.json'
    : 'https://api.zarinpal.com/pg/v4/payment/request.json'

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  // Support Bearer Token if Access Token is used instead of UUID
  if (config.merchantId.startsWith('ey') || config.merchantId.length > 40) {
    headers['Authorization'] = `Bearer ${config.merchantId}`
  }

  const payload = {
    merchant_id: config.merchantId,
    amount: Math.round(params.amount),
    currency: 'IRR',
    description: params.description || `پرداخت سفارش ${params.orderId.slice(0, 8)}`,
    callback_url: params.callbackUrl,
    metadata: {
      mobile: params.mobile || '',
      email: params.email || '',
      order_id: params.orderId
    }
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (data?.data && (data.data.code === 100 || data.data.code === 101) && data.data.authority) {
      const authority = data.data.authority
      const startPayDomain = config.isSandbox ? 'sandbox.zarinpal.com' : 'www.zarinpal.com'
      const paymentUrl = `https://${startPayDomain}/pg/StartPay/${authority}`

      return {
        success: true,
        authority,
        paymentUrl
      }
    }

    // Handle error codes
    let errorMessage = 'خطا در ارتباط با درگاه پرداخت زرین‌پال'
    if (data?.errors) {
      if (typeof data.errors === 'string') {
        errorMessage = data.errors
      } else if (data.errors.message) {
        errorMessage = data.errors.message
      } else if (Array.isArray(data.errors) && data.errors[0]?.message) {
        errorMessage = data.errors[0].message
      } else if (data.errors.validations) {
        errorMessage = Object.values(data.errors.validations).flat().join(' - ')
      }
    }

    return {
      success: false,
      error: errorMessage
    }
  } catch (err: any) {
    console.error('Zarinpal requestPayment fetch error:', err)
    return {
      success: false,
      error: err.message || 'خطای غیرمنتظره در اتصال به درگاه زرین‌پال'
    }
  }
}

export type PaymentVerifyResult = {
  success: boolean
  code?: number
  refId?: string
  cardPan?: string | null
  cardHash?: string | null
  message?: string
  error?: string
}

export async function verifyZarinpalPayment(amount: number, authority: string): Promise<PaymentVerifyResult> {
  const config = await getZarinpalConfig()

  if (!config.merchantId) {
    return {
      success: false,
      error: 'مرچنت‌آیدی زرین‌پال تنظیم نشده است.'
    }
  }

  const endpoint = config.isSandbox
    ? 'https://sandbox.zarinpal.com/pg/v4/payment/verify.json'
    : 'https://api.zarinpal.com/pg/v4/payment/verify.json'

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  if (config.merchantId.startsWith('ey') || config.merchantId.length > 40) {
    headers['Authorization'] = `Bearer ${config.merchantId}`
  }

  const payload = {
    merchant_id: config.merchantId,
    amount: Math.round(amount),
    authority
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (data?.data && (data.data.code === 100 || data.data.code === 101)) {
      return {
        success: true,
        code: data.data.code,
        refId: String(data.data.ref_id || ''),
        cardPan: data.data.card_pan || null,
        cardHash: data.data.card_hash || null,
        message: data.data.code === 101 ? 'تراکنش قبلاً تایید شده است.' : 'پرداخت با موفقیت تایید شد.'
      }
    }

    // Interpret Zarinpal error code
    const errCode = data?.errors?.code || data?.data?.code
    let errorMsg = 'خطا در تایید تراکنش بانکی.'
    
    switch (errCode) {
      case -9:
        errorMsg = 'خطای اعتبارسنجی اطلاعات ارسالی.'
        break
      case -10:
        errorMsg = 'آی‌پی یا مرچنت‌کد ارسال‌شده صحیح نیست.'
        break
      case -11:
        errorMsg = 'مرچنت‌کد فعال نیست. با پشتیبانی زرین‌پال تماس بگیرید.'
        break
      case -12:
        errorMsg = 'تلاش بیش از حد در یک بازه زمانی کوتاه.'
        break
      case -50:
        errorMsg = 'مبلغ پرداخت شده با مبلغ ارسالی مطابقت ندارد.'
        break
      case -51:
        errorMsg = 'پرداخت ناموفق بود یا توسط کاربر لغو شده است.'
        break
      case -52:
        errorMsg = 'خطای غیرمنتظره در تایید تراکنش.'
        break
      case -53:
        errorMsg = 'اتوریتی متعلق به این مرچنت‌کد نیست.'
        break
      case -54:
        errorMsg = 'اتوریتی نامعتبر است.'
        break
      default:
        if (data?.errors?.message) {
          errorMsg = data.errors.message
        }
    }

    return {
      success: false,
      code: errCode,
      error: errorMsg
    }
  } catch (err: any) {
    console.error('Zarinpal verifyPayment fetch error:', err)
    return {
      success: false,
      error: err.message || 'خطای شبکه در اتصال به سرور زرین‌پال'
    }
  }
}
