'use client'

import { Phone, SendHorizontal, MessageSquare } from 'lucide-react'

interface TeacherContactActionsClientProps {
  teacherId: string
  contactPhone?: string | null
  telegramId?: string | null
  whatsappId?: string | null
  instagramId?: string | null
  eitaaId?: string | null
}

export function TeacherContactActionsClient({
  teacherId,
  contactPhone,
  telegramId,
  whatsappId,
  instagramId,
  eitaaId
}: TeacherContactActionsClientProps) {
  function track(type: string) {
    try {
      fetch(`/api/teachers/${teacherId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interaction_type: type })
      }).catch(() => {})
    } catch {}
  }

  const hasPhone = Boolean(contactPhone && contactPhone.trim() !== '')
  const hasTelegram = Boolean(telegramId && telegramId.trim() !== '')
  const hasWhatsapp = Boolean(whatsappId && whatsappId.trim() !== '')
  const hasInstagram = Boolean(instagramId && instagramId.trim() !== '')
  const hasEitaa = Boolean(eitaaId && eitaaId.trim() !== '')

  if (!hasPhone && !hasTelegram && !hasWhatsapp && !hasInstagram && !hasEitaa) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {hasPhone && (
        <a
          href={`tel:${contactPhone}`}
          onClick={() => track('phone')}
          className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 text-slate-700 p-3 rounded-xl transition-colors border border-slate-200 group"
          dir="ltr"
        >
          <span className="font-bold text-sm group-hover:text-slate-900">{contactPhone}</span>
          <div className="bg-white p-1.5 rounded-lg shadow-2xs group-hover:shadow text-slate-500">
            <Phone className="w-4 h-4" />
          </div>
        </a>
      )}

      {hasTelegram && (
        <a
          href={`https://t.me/${telegramId!.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('telegram')}
          className="flex items-center justify-between bg-[#229ED9]/5 hover:bg-[#229ED9]/10 text-[#229ED9] p-3 rounded-xl transition-colors border border-[#229ED9]/20 group"
          dir="ltr"
        >
          <span className="font-bold text-sm">@{telegramId!.replace('@', '')}</span>
          <div className="bg-white p-1.5 rounded-lg shadow-2xs text-[#229ED9] text-xs font-bold">تلگرام</div>
        </a>
      )}

      {hasWhatsapp && (
        <a
          href={`https://wa.me/${whatsappId!.replace(/^0/, '98').replace(/\+/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp')}
          className="flex items-center justify-between bg-[#25D366]/5 hover:bg-[#25D366]/10 text-[#25D366] p-3 rounded-xl transition-colors border border-[#25D366]/20 group"
          dir="ltr"
        >
          <span className="font-bold text-sm">{whatsappId}</span>
          <div className="bg-white p-1.5 rounded-lg shadow-2xs text-[#25D366] text-xs font-bold">واتساپ</div>
        </a>
      )}

      {hasInstagram && (
        <a
          href={`https://instagram.com/${instagramId!.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('instagram')}
          className="flex items-center justify-between bg-[#E1306C]/5 hover:bg-[#E1306C]/10 text-[#E1306C] p-3 rounded-xl transition-colors border border-[#E1306C]/20 group"
          dir="ltr"
        >
          <span className="font-bold text-sm">@{instagramId!.replace('@', '')}</span>
          <div className="bg-white p-1.5 rounded-lg shadow-2xs text-[#E1306C] text-xs font-bold">اینستاگرام</div>
        </a>
      )}

      {hasEitaa && (
        <a
          href={`https://eitaa.com/${eitaaId!.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('eitaa')}
          className="flex items-center justify-between bg-[#F26422]/5 hover:bg-[#F26422]/10 text-[#F26422] p-3 rounded-xl transition-colors border border-[#F26422]/20 group"
          dir="ltr"
        >
          <span className="font-bold text-sm">@{eitaaId!.replace('@', '')}</span>
          <div className="bg-white p-1.5 rounded-lg shadow-2xs text-[#F26422] text-xs font-bold">ایتا</div>
        </a>
      )}
    </div>
  )
}
