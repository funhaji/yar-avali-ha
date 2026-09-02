'use client'

import { useState } from 'react'
import { Save, Upload } from 'lucide-react'

type SiteSetting = {
  id: string
  setting_key: string
  setting_value: string | null
  setting_type: string
}

type Props = {
  initialSettings: SiteSetting[]
}

const DEFAULT_SETTINGS = [

    // Header Menu
    { key: 'nav_1_title', label: 'عنوان لینک ۱', type: 'text', placeholder: 'فروشگاه', category: 'header_menu' },
    { key: 'nav_1_url', label: 'لینک ۱', type: 'text', placeholder: '/shop', category: 'header_menu' },
    { key: 'nav_1_icon', label: 'آیکون ۱ (Lucide)', type: 'text', placeholder: 'ShoppingBag', category: 'header_menu' },
    
    { key: 'nav_2_title', label: 'عنوان لینک ۲', type: 'text', placeholder: 'سرگرمی', category: 'header_menu' },
    { key: 'nav_2_url', label: 'لینک ۲', type: 'text', placeholder: '/entertainment', category: 'header_menu' },
    { key: 'nav_2_icon', label: 'آیکون ۲', type: 'text', placeholder: 'Clapperboard', category: 'header_menu' },

    { key: 'nav_3_title', label: 'عنوان لینک ۳', type: 'text', placeholder: 'کاربرگ‌ها', category: 'header_menu' },
    { key: 'nav_3_url', label: 'لینک ۳', type: 'text', placeholder: '/worksheets', category: 'header_menu' },
    { key: 'nav_3_icon', label: 'آیکون ۳', type: 'text', placeholder: '', category: 'header_menu' },

    { key: 'nav_4_title', label: 'عنوان لینک ۴', type: 'text', placeholder: 'وبلاگ', category: 'header_menu' },
    { key: 'nav_4_url', label: 'لینک ۴', type: 'text', placeholder: '/blog', category: 'header_menu' },
    { key: 'nav_4_icon', label: 'آیکون ۴', type: 'text', placeholder: '', category: 'header_menu' },

    { key: 'nav_5_title', label: 'عنوان لینک ۵', type: 'text', placeholder: 'کتاب‌ها', category: 'header_menu' },
    { key: 'nav_5_url', label: 'لینک ۵', type: 'text', placeholder: '/books', category: 'header_menu' },
    { key: 'nav_5_icon', label: 'آیکون ۵', type: 'text', placeholder: 'BookOpen', category: 'header_menu' },

    { key: 'nav_6_title', label: 'عنوان لینک ۶', type: 'text', placeholder: 'گالری', category: 'header_menu' },
    { key: 'nav_6_url', label: 'لینک ۶', type: 'text', placeholder: '/gallery', category: 'header_menu' },
    { key: 'nav_6_icon', label: 'آیکون ۶', type: 'text', placeholder: '', category: 'header_menu' },

    { key: 'nav_7_title', label: 'عنوان لینک ۷', type: 'text', placeholder: 'درباره ما', category: 'header_menu' },
    { key: 'nav_7_url', label: 'لینک ۷', type: 'text', placeholder: '/about', category: 'header_menu' },
    { key: 'nav_7_icon', label: 'آیکون ۷', type: 'text', placeholder: '', category: 'header_menu' },

  { key: 'site_logo_url', label: 'لوگوی سایت', type: 'logo', category: 'general' },
  { key: 'site_name', label: 'نام سایت', type: 'text', category: 'general' },
  { key: 'site_font', label: 'فونت سایت', type: 'select', category: 'general', options: [
    { value: 'vazirmatn', label: 'وزیرمتن (پیش‌فرض)' },
    { value: 'iranyekan', label: 'ایران یکان' },
    { value: 'estedad', label: 'استعداد' },
    { value: 'samim', label: 'صمیم' },
    { value: 'shabnam', label: 'شبنم' },
    { value: 'mikhak', label: 'میخک' }
  ]},
  { key: 'hero_title', label: 'عنوان اصلی صفحه', type: 'text', category: 'general' },
  { key: 'hero_subtitle', label: 'زیرعنوان صفحه اصلی', type: 'textarea', category: 'general' },
  { key: 'hero_cta_text', label: 'متن دکمه اصلی', type: 'text', category: 'general' },
  { key: 'hero_trust_badge_1', label: 'متن نشان اعتماد اول (سپر)', type: 'text', category: 'general' },
  { key: 'hero_trust_badge_2', label: 'متن نشان اعتماد دوم (ستاره)', type: 'text', category: 'general' },
  { key: 'footer_text', label: 'متن فوتر', type: 'textarea', category: 'general' },
  { key: 'contact_email', label: 'ایمیل تماس', type: 'email', category: 'general' },
  { key: 'contact_phone', label: 'تلفن تماس', type: 'tel', category: 'general' },
  { key: 'contact_telegram_id', label: 'آیدی تلگرام (برای ثبت سفارشات)', type: 'text', placeholder: '@yar_avali_ha', category: 'general' },
  
  // Social media links
  { key: 'social_instagram', label: 'لینک اینستاگرام', type: 'url', placeholder: 'https://instagram.com/username', category: 'social' },
  { key: 'social_telegram', label: 'لینک تلگرام', type: 'url', placeholder: 'https://t.me/username', category: 'social' },
  { key: 'social_whatsapp', label: 'شماره واتساپ', type: 'tel', placeholder: '+989123456789', category: 'social' },
  { key: 'social_eitaa', label: 'لینک ایتا', type: 'url', placeholder: 'https://eitaa.com/username', category: 'social' },
  
  // Stats configuration
  { key: 'stat_lessons_count', label: 'تعداد درس‌ها (خودکار یا دستی)', type: 'text', placeholder: 'auto یا عدد مثل 120', category: 'stats' },
  { key: 'stat_lessons_label', label: 'برچسب درس‌ها', type: 'text', placeholder: 'درس تصویری', category: 'stats' },
  { key: 'stat_episodes_count', label: 'تعداد قسمت‌ها (خودکار یا دستی)', type: 'text', placeholder: 'auto یا عدد مثل 500', category: 'stats' },
  { key: 'stat_episodes_label', label: 'برچسب قسمت‌ها', type: 'text', placeholder: 'قسمت انیمه و فیلم', category: 'stats' },
  { key: 'stat_uptime', label: 'درصد پایداری', type: 'text', placeholder: '99.9', category: 'stats' },
  { key: 'stat_uptime_label', label: 'برچسب پایداری', type: 'text', placeholder: 'پایداری سرویس', category: 'stats' },
  
  // Poster tiles configuration
  { key: 'poster_tile_1_text', label: 'متن کارت اول', type: 'text', placeholder: 'ریاضی\nکلاس اول', category: 'posters' },
  { key: 'poster_tile_1_image', label: 'تصویر کارت اول (URL)', type: 'url', category: 'posters' },
  { key: 'poster_tile_1_show_text', label: 'نمایش متن روی تصویر کارت اول', type: 'checkbox', category: 'posters' },
  
  { key: 'poster_tile_2_text', label: 'متن کارت دوم', type: 'text', placeholder: 'انیمه\nماجراجویی', category: 'posters' },
  { key: 'poster_tile_2_image', label: 'تصویر کارت دوم (URL)', type: 'url', category: 'posters' },
  { key: 'poster_tile_2_show_text', label: 'نمایش متن روی تصویر کارت دوم', type: 'checkbox', category: 'posters' },
  { key: 'poster_tile_2_badge', label: 'بج کارت دوم', type: 'text', placeholder: 'انیمه', category: 'posters' },
  
  { key: 'poster_tile_3_text', label: 'متن کارت سوم', type: 'text', placeholder: 'فارسی\nو روان‌خوانی', category: 'posters' },
  { key: 'poster_tile_3_image', label: 'تصویر کارت سوم (URL)', type: 'url', category: 'posters' },
  { key: 'poster_tile_3_show_text', label: 'نمایش متن روی تصویر کارت سوم', type: 'checkbox', category: 'posters' },
  
  { key: 'poster_tile_4_text', label: 'متن کارت چهارم', type: 'text', placeholder: 'فیلم\nکودکانه', category: 'posters' },
  { key: 'poster_tile_4_image', label: 'تصویر کارت چهارم (URL)', type: 'url', category: 'posters' },
  { key: 'poster_tile_4_show_text', label: 'نمایش متن روی تصویر کارت چهارم', type: 'checkbox', category: 'posters' },
  { key: 'poster_tile_4_badge', label: 'بج کارت چهارم', type: 'text', placeholder: 'فیلم', category: 'posters' },

  
  // Feature Tiles
  { key: 'feature_1_title', label: 'عنوان ویژگی ۱', type: 'text', placeholder: 'محتوای درسی معتبر', category: 'home' },
  { key: 'feature_1_desc', label: 'توضیحات ویژگی ۱', type: 'textarea', placeholder: 'ریاضی، فارسی و علوم برای کلاس‌های اول تا سوم.', category: 'home' },
  { key: 'feature_1_icon', label: 'نام آیکون ویژگی ۱ (از Lucide)', type: 'text', placeholder: 'BookOpen', category: 'home' },
  
  { key: 'feature_2_title', label: 'عنوان ویژگی ۲', type: 'text', placeholder: 'کتابخانه رده‌بندی‌شده', category: 'home' },
  { key: 'feature_2_desc', label: 'توضیحات ویژگی ۲', type: 'textarea', placeholder: 'هر عنوان با رده سنی مشخص، برای انتخاب راحت والدین.', category: 'home' },
  { key: 'feature_2_icon', label: 'نام آیکون ویژگی ۲ (از Lucide)', type: 'text', placeholder: 'Palette', category: 'home' },
  
  { key: 'feature_3_title', label: 'عنوان ویژگی ۳', type: 'text', placeholder: 'کنترل والدین', category: 'home' },
  { key: 'feature_3_desc', label: 'توضیحات ویژگی ۳', type: 'textarea', placeholder: 'مدیریت دسترسی و زمان تماشا برای هر پروفایل کودک.', category: 'home' },
  { key: 'feature_3_icon', label: 'نام آیکون ویژگی ۳ (از Lucide)', type: 'text', placeholder: 'ShieldCheck', category: 'home' },

  // Promo Box 1 (Teacher Training)
  { key: 'promo_box_1_title', label: 'عنوان بنر اول', type: 'text', placeholder: 'دوره تربیت معلم و معلم خصوصی', category: 'banners' },
  { key: 'promo_box_1_desc', label: 'توضیحات بنر اول', type: 'textarea', placeholder: 'با شرکت در این دوره، مهارت‌های تدریس خود را ارتقا دهید...', category: 'banners' },
  { key: 'promo_box_1_badge', label: 'نشان بنر اول', type: 'text', placeholder: 'ویژه', category: 'banners' },
  { key: 'promo_box_1_link', label: 'لینک بنر اول', type: 'text', placeholder: '/teacher-training', category: 'banners' },
  { key: 'promo_box_1_image', label: 'تصویر بنر اول (URL)', type: 'url', category: 'banners' },

  // Promo Box 2 (Books)
  { key: 'promo_box_2_title', label: 'عنوان بنر دوم', type: 'text', placeholder: 'معرفی کتاب‌ها', category: 'banners' },
  { key: 'promo_box_2_desc', label: 'توضیحات بنر دوم', type: 'textarea', placeholder: 'بهترین کتاب‌های کمک آموزشی و داستان...', category: 'banners' },
  { key: 'promo_box_2_badge', label: 'نشان بنر دوم', type: 'text', placeholder: 'معرفی', category: 'banners' },
  { key: 'promo_box_2_link', label: 'لینک بنر دوم', type: 'text', placeholder: '/books', category: 'banners' },
  { key: 'promo_box_2_image', label: 'تصویر بنر دوم (URL)', type: 'url', category: 'banners' },

  // Entertainment Page
  { key: 'ent_cat1_image', label: 'کاور دسته لوحه نویسی (URL)', type: 'url', category: 'entertainment' },
  { key: 'ent_cat1_video', label: 'لینک ویدیوی لوحه نویسی (آپارات)', type: 'url', category: 'entertainment' },
  { key: 'ent_cat2_image', label: 'کاور دسته نشانه های ۱/۲ (URL)', type: 'url', category: 'entertainment' },
  { key: 'ent_cat2_video', label: 'لینک ویدیوی نشانه های ۱/۲ (آپارات)', type: 'url', category: 'entertainment' },
  { key: 'ent_cat3_image', label: 'کاور دسته علوم (URL)', type: 'url', category: 'entertainment' },
  { key: 'ent_cat3_video', label: 'لینک ویدیوی علوم (آپارات)', type: 'url', category: 'entertainment' },
  { key: 'ent_cat4_image', label: 'کاور دسته سایر محتوا (URL)', type: 'url', category: 'entertainment' },
  
  // About Us Page
  { key: 'about_title', label: 'عنوان صفحه درباره ما', type: 'text', placeholder: 'درباره یار اولی‌ها', category: 'about' },
  { key: 'about_subtitle', label: 'زیرعنوان صفحه', type: 'textarea', placeholder: 'توضیحات کوتاه...', category: 'about' },
  { key: 'about_content', label: 'متن اصلی', type: 'textarea', placeholder: 'داستان شکل‌گیری ما...', category: 'about' },
  { key: 'about_image', label: 'تصویر اصلی (URL)', type: 'url', category: 'about' },

  // Teacher Training Page
  { key: 'tt_title', label: 'عنوان اصلی صفحه', type: 'text', placeholder: 'آموزش و تدریس خصوصی', category: 'teacher_training' },
  { key: 'tt_subtitle', label: 'زیرنویس صفحه', type: 'textarea', placeholder: 'با استفاده از بهترین متدها...', category: 'teacher_training' },
  { key: 'tt_video_url', label: 'لینک ویدیو تربیت معلم (آپارات)', type: 'url', category: 'teacher_training' },
  { key: 'tt_video_url_2', label: 'لینک ویدیو معلم خصوصی (آپارات)', type: 'url', category: 'teacher_training' },

  // Store Page Badges
  { key: 'product_badge_1', label: 'متن نشان اول', type: 'text', placeholder: 'تضمین کیفیت', category: 'store' },
  { key: 'product_badge_1_icon', label: 'آیکون نشان اول (Lucide)', type: 'text', placeholder: 'ShieldCheck', category: 'store' },
  { key: 'product_badge_2', label: 'متن نشان دوم', type: 'text', placeholder: 'دانلود فوری', category: 'store' },
  { key: 'product_badge_2_icon', label: 'آیکون نشان دوم (Lucide)', type: 'text', placeholder: 'Download', category: 'store' },
  { key: 'product_badge_3_instock', label: 'متن موجود بودن', type: 'text', placeholder: 'موجوده', category: 'store' },
  { key: 'product_badge_3_outstock', label: 'متن تمام شدن', type: 'text', placeholder: 'تمام شده', category: 'store' },
  { key: 'product_badge_3_icon', label: 'آیکون موجودی (Lucide)', type: 'text', placeholder: 'CheckCircle2', category: 'store' },

  // Teacher Training Page Additional
  { key: 'tt_card1_title', label: 'عنوان کارت ۱ (معلم خصوصی)', type: 'text', placeholder: 'معلم خصوصی', category: 'teacher_training' },
  { key: 'tt_card1_desc', label: 'توضیحات کارت ۱', type: 'textarea', placeholder: 'درخواست معلم خصوصی...', category: 'teacher_training' },
  { key: 'tt_card1_btn_title', label: 'متن دکمه کارت ۱', type: 'text', placeholder: 'درخواست معلم', category: 'teacher_training' },
  { key: 'tt_card1_btn_desc', label: 'توضیحات زیر دکمه کارت ۱', type: 'textarea', placeholder: 'برای هماهنگی...', category: 'teacher_training' },
  { key: 'tt_card1_btn_id', label: 'آیدی پشتیبانی کارت ۱', type: 'text', placeholder: '@yar_avali_ha', category: 'teacher_training' },

  { key: 'tt_card2_title', label: 'عنوان کارت ۲ (تربیت معلم)', type: 'text', placeholder: 'دوره تربیت معلم', category: 'teacher_training' },
  { key: 'tt_card2_desc', label: 'توضیحات کارت ۲', type: 'textarea', placeholder: 'در دوره‌های تربیت معلم...', category: 'teacher_training' },
  { key: 'tt_card2_btn_title', label: 'متن دکمه کارت ۲', type: 'text', placeholder: 'ثبت نام به زودی!', category: 'teacher_training' },
  { key: 'tt_card2_btn_desc', label: 'توضیحات زیر دکمه کارت ۲', type: 'textarea', placeholder: 'ظرفیت دوره محدود است...', category: 'teacher_training' },
  { key: 'tt_card2_btn_id', label: 'آیدی پشتیبانی کارت ۲', type: 'text', placeholder: '@yar_avali_ha', category: 'teacher_training' },


]

export function SettingsManager({ initialSettings }: Props) {
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {}
    initialSettings.forEach(s => {
      obj[s.setting_key] = s.setting_value || ''
    })
    // Ensure checkbox defaults are set
    DEFAULT_SETTINGS.forEach(setting => {
      if (setting.type === 'checkbox' && !(setting.key in obj)) {
        obj[setting.key] = 'false'
      }
    })
    return obj
  })
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      // Prepare all settings in an array
      const settingsArray = DEFAULT_SETTINGS.map(setting => ({
        key: setting.key,
        value: settings[setting.key] || '',
        type: setting.type
      }))
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsArray })
      })
      
      if (!response.ok) throw new Error('Failed to save settings')
      
      setMessage('تنظیمات با موفقیت ذخیره شد')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Save error:', error)
      setMessage('خطا در ذخیره تنظیمات')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(key)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/settings/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        handleSettingChange(key, data.url)
        setMessage('تصویر با موفقیت آپلود شد')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage('خطا: ' + (error.error || 'آپلود ناموفق'))
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage('خطا در آپلود تصویر')
    } finally {
      setUploading(null)
    }
  }

  const [activeTab, setActiveTab] = useState('general')

  const TABS = [
    { id: 'general', label: 'عمومی' },
      { id: 'header_menu', label: 'منوی سایت' },
    { id: 'home', label: 'صفحه اصلی (ویژگی‌ها)' },
    
    { id: 'social', label: 'شبکه‌های اجتماعی' },
    { id: 'stats', label: 'آمار' },
    { id: 'posters', label: 'کاشی‌های صفحه اصلی' },
    { id: 'banners', label: 'بنرهای تبلیغاتی' },
    { id: 'about', label: 'درباره ما' },
    { id: 'teacher_training', label: 'تربیت معلم' },
    { id: 'entertainment', label: 'محتوای آموزشی' },
      { id: 'store', label: 'فروشگاه' },
  ]

  return (
    <div className="space-y-8">
      {/* Settings Section */}
      <section className="card" style={{ padding: '2rem' }}>
        
        {/* Tabs Navigation */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--line-soft)', paddingBottom: '1rem', marginBottom: '2rem', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`button ${activeTab === tab.id ? 'button-primary' : 'button-ghost'}`}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.95rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          {DEFAULT_SETTINGS.filter(s => (s as any).category === activeTab).map((setting) => (
            <div key={setting.key}>
              <label className="block font-medium mb-2">
                {setting.label}
              </label>
              {setting.type === 'textarea' ? (
                <textarea
                  value={settings[setting.key] || ''}
                  onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder={setting.placeholder}
                  style={{ direction: 'rtl' }}
                />
              ) : setting.type === 'checkbox' ? (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings[setting.key] === 'true' || settings[setting.key] === 'true'}
                    onChange={(e) => handleSettingChange(setting.key, e.target.checked ? 'true' : 'false')}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">فعال</span>
                </label>
              ) : setting.type === 'select' ? (
                <select
                  value={settings[setting.key] || setting.options?.[0].value || ''}
                  onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  style={{ direction: 'rtl' }}
                >
                  {setting.options?.map((option: any) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : setting.key.includes('_image') || setting.type === 'logo' ? (
                // Image/Logo upload field
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  <input
                    type="url"
                    value={settings[setting.key] || ''}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    placeholder={setting.placeholder || 'URL تصویر'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    style={{ direction: 'ltr' }}
                  />
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    <label
                      htmlFor={`upload-${setting.key}`}
                      className="button button-ghost"
                      style={{ cursor: 'pointer', fontSize: '.9rem', padding: '.6rem 1.2rem' }}
                    >
                      {uploading === setting.key ? (
                        <>
                          <Upload style={{ width: 16 }} className="animate-spin" />
                          در حال آپلود...
                        </>
                      ) : (
                        <>
                          <Upload style={{ width: 16 }} />
                          {setting.type === 'logo' ? 'آپلود لوگو' : 'آپلود تصویر'}
                        </>
                      )}
                    </label>
                    <input
                      id={`upload-${setting.key}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(setting.key, file)
                      }}
                      style={{ display: 'none' }}
                      disabled={uploading === setting.key}
                    />
                    {settings[setting.key] && (
                      <span style={{ fontSize: '.85rem', color: 'var(--teal-deep)' }}>✓ تصویر آپلود شده</span>
                    )}
                  </div>
                  {settings[setting.key] && (
                    <img 
                      src={settings[setting.key]} 
                      alt="پیش‌نمایش" 
                      style={{ maxWidth: setting.type === 'logo' ? '150px' : '200px', maxHeight: setting.type === 'logo' ? '60px' : 'auto', borderRadius: '8px', border: '1px solid var(--line-soft)', objectFit: 'contain' }}
                    />
                  )}
                  {setting.type === 'logo' && (
                    <p style={{ fontSize: '.85rem', color: 'var(--ink-soft)' }}>
                      توصیه: تصویر شفاف (PNG) با ابعاد مناسب (حداکثر ارتفاع 60px)
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type={setting.type}
                  value={settings[setting.key] || ''}
                  onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                  placeholder={setting.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  style={{ direction: setting.type === 'url' || setting.type === 'email' ? 'ltr' : 'rtl' }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="button button-primary flex items-center gap-2"
          >
            <Save style={{ width: 18 }} />
            {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
          
          {message && (
            <span className={message.includes('موفقیت') ? 'text-green-600' : 'text-red-600'}>
              {message}
            </span>
          )}
        </div>
      </section>
    </div>
  )
}
