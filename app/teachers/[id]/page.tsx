import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTeacherById } from '@/lib/teachers'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import { GraduationCap, MapPin, Building2, ChevronRight, Phone, Medal, Award, Trophy, Video } from 'lucide-react'
import { Reveal } from '@/components/Reveal'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const teacher = await getTeacherById(id).catch(() => null)
  if (!teacher) return { title: 'معلم یافت نشد' }
  return { title: teacher.name + ' - یاراولیها' }
}

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const teacher = await getTeacherById(id).catch(() => null)
  
  if (!teacher || !teacher.is_visible) {
    notFound()
  }

  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token).catch(() => null) : null
  
  const settingsData = await getSettings([
    'site_logo_url', 'site_name', 'footer_text', 'contact_email', 'contact_phone'
  ])
  const s = settingsData as Record<string, string | null>

  const hasPhone = teacher.contact_phone && teacher.contact_phone.trim() !== '';
  const hasTelegram = teacher.telegram_id && teacher.telegram_id.trim() !== '';
  const hasWhatsapp = teacher.whatsapp_id && teacher.whatsapp_id.trim() !== '';
  const hasEitaa = teacher.eitaa_id && teacher.eitaa_id.trim() !== '';
  const hasInstagram = teacher.instagram_id && teacher.instagram_id.trim() !== '';
  const hasAnyContact = hasPhone || hasTelegram || hasWhatsapp || hasEitaa || hasInstagram;

  return (
    <div className="page bg-paper text-ink min-h-screen flex flex-col">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={s?.site_logo_url || undefined}
        siteName={s?.site_name || undefined}
      />

      <main className="flex-1 w-full pb-16">
        
        {/* Modern Header Banner */}
        <div className="relative h-64 md:h-80 bg-teal overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 150%, var(--tangerine) 0%, transparent 50%), radial-gradient(circle at 80% -50%, var(--teal-light) 0%, transparent 50%)' }}></div>
          
          <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20">
            <Link href="/teachers" className="inline-flex items-center gap-1 text-white hover:text-teal bg-white/20 hover:bg-white px-4 py-2 rounded-xl backdrop-blur-md transition-all text-sm font-bold shadow-sm">
              <ChevronRight className="w-5 h-5" />
              همه مدرسین
            </Link>
          </div>

          <div className="z-10 text-center text-white px-4 mt-8 md:mt-0">
            <Reveal>
              <h1 className="text-4xl md:text-5xl font-black mb-3">{teacher.name}</h1>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold">
                {teacher.specialty || 'مدرس یاراولیها'}
              </div>
            </Reveal>
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative -mt-16 md:-mt-24 z-20">
          
          {/* Avatar Section */}
          <Reveal delay={100}>
            <div className="flex flex-col items-center mb-10">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[8px] border-paper bg-cream shadow-xl overflow-hidden relative">
                {teacher.photo_url ? (
                  <img src={teacher.photo_url} alt={teacher.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-teal-light/20 flex items-center justify-center text-5xl md:text-7xl font-bold text-teal/40">
                    {teacher.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Sidebar Details */}
            <div className="md:col-span-1 space-y-6">
              
              <Reveal delay={200}>
                <div className="card p-6 border border-line-soft bg-white shadow-sm rounded-2xl">
                  <h3 className="font-bold text-lg mb-5 flex items-center gap-2 border-b border-line-soft pb-3">
                    <MapPin className="w-5 h-5 text-tangerine" /> اطلاعات پایه
                  </h3>
                  <div className="space-y-5 text-sm">
                    {teacher.education && (
                      <div className="flex items-start gap-3">
                        <div className="bg-teal/10 p-2 rounded-lg text-teal shrink-0"><GraduationCap className="w-4 h-4" /></div>
                        <div>
                          <div className="text-ink-soft text-xs mb-1">مدرک تحصیلی</div>
                          <div className="font-bold text-ink">{teacher.education}</div>
                        </div>
                      </div>
                    )}
                    {teacher.location && (
                      <div className="flex items-start gap-3">
                        <div className="bg-teal/10 p-2 rounded-lg text-teal shrink-0"><MapPin className="w-4 h-4" /></div>
                        <div>
                          <div className="text-ink-soft text-xs mb-1">استان و شهر</div>
                          <div className="font-bold text-ink">{teacher.location}</div>
                        </div>
                      </div>
                    )}
                    {teacher.workplace && (
                      <div className="flex items-start gap-3">
                        <div className="bg-teal/10 p-2 rounded-lg text-teal shrink-0"><Building2 className="w-4 h-4" /></div>
                        <div>
                          <div className="text-ink-soft text-xs mb-1">محل خدمت</div>
                          <div className="font-bold text-ink leading-relaxed">{teacher.workplace}</div>
                        </div>
                      </div>
                    )}
                    {teacher.experience_years && (
                      <div className="flex items-start gap-3">
                        <div className="bg-teal/10 p-2 rounded-lg text-teal shrink-0 flex items-center justify-center font-black text-xs h-8 w-8">
                          {teacher.experience_years}
                        </div>
                        <div>
                          <div className="text-ink-soft text-xs mb-1">سابقه کار</div>
                          <div className="font-bold text-ink">{teacher.experience_years} سال</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* Socials / Contacts */}
              {hasAnyContact && (
                <Reveal delay={300}>
                  <div className="card p-6 border border-line-soft bg-white shadow-sm rounded-2xl">
                    <h3 className="font-bold text-lg mb-5 flex items-center gap-2 border-b border-line-soft pb-3">
                      <Phone className="w-5 h-5 text-tangerine" /> راه‌های ارتباطی
                    </h3>
                    <div className="flex flex-col gap-3">
                      {hasPhone && (
                        <a href={`tel:${teacher.contact_phone}`} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 text-slate-700 p-3 rounded-xl transition-colors border border-slate-100 group" dir="ltr">
                          <span className="font-bold text-sm group-hover:text-slate-900">{teacher.contact_phone}</span>
                          <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow text-slate-500"><Phone className="w-4 h-4" /></div>
                        </a>
                      )}
                      {hasTelegram && (
                        <a href={`https://t.me/${teacher.telegram_id!.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#229ED9]/5 hover:bg-[#229ED9]/10 text-[#229ED9] p-3 rounded-xl transition-colors border border-[#229ED9]/10 group" dir="ltr">
                          <span className="font-bold text-sm">@{teacher.telegram_id!.replace('@', '')}</span>
                          <div className="bg-white p-1.5 rounded-lg shadow-sm text-[#229ED9]">تلگرام</div>
                        </a>
                      )}
                      {hasWhatsapp && (
                        <a href={`https://wa.me/${teacher.whatsapp_id!.replace(/^0/, '98').replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#25D366]/5 hover:bg-[#25D366]/10 text-[#25D366] p-3 rounded-xl transition-colors border border-[#25D366]/10 group" dir="ltr">
                          <span className="font-bold text-sm">{teacher.whatsapp_id}</span>
                          <div className="bg-white p-1.5 rounded-lg shadow-sm text-[#25D366]">واتساپ</div>
                        </a>
                      )}
                      {hasInstagram && (
                        <a href={`https://instagram.com/${teacher.instagram_id!.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#E1306C]/5 hover:bg-[#E1306C]/10 text-[#E1306C] p-3 rounded-xl transition-colors border border-[#E1306C]/10 group" dir="ltr">
                          <span className="font-bold text-sm">@{teacher.instagram_id!.replace('@', '')}</span>
                          <div className="bg-white p-1.5 rounded-lg shadow-sm text-[#E1306C]">اینستاگرام</div>
                        </a>
                      )}
                      {hasEitaa && (
                        <a href={`https://eitaa.com/${teacher.eitaa_id!.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#F26422]/5 hover:bg-[#F26422]/10 text-[#F26422] p-3 rounded-xl transition-colors border border-[#F26422]/10 group" dir="ltr">
                          <span className="font-bold text-sm">@{teacher.eitaa_id!.replace('@', '')}</span>
                          <div className="bg-white p-1.5 rounded-lg shadow-sm text-[#F26422]">ایتا</div>
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              )}

            </div>

            {/* Main Details */}
            <div className="md:col-span-2 space-y-8">
              
              {/* Stats/Ranks */}
              {(teacher.national_rank || teacher.provincial_rank || teacher.district_rank) && (
                <Reveal delay={150}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {teacher.national_rank && (
                      <div className="card p-5 border border-rose-100 bg-rose-50/50 flex flex-col items-center justify-center rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-rose-100 p-3 rounded-full text-rose-500 mb-3"><Trophy className="w-6 h-6" /></div>
                        <div className="text-3xl font-black text-rose-600 mb-1">{teacher.national_rank}</div>
                        <div className="text-sm font-bold text-rose-400">رتبه کشوری</div>
                      </div>
                    )}
                    {teacher.provincial_rank && (
                      <div className="card p-5 border border-sunflower/20 bg-sunflower/5 flex flex-col items-center justify-center rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-sunflower/20 p-3 rounded-full text-amber-600 mb-3"><Medal className="w-6 h-6" /></div>
                        <div className="text-3xl font-black text-amber-600 mb-1">{teacher.provincial_rank}</div>
                        <div className="text-sm font-bold text-amber-500">رتبه استانی</div>
                      </div>
                    )}
                    {teacher.district_rank && (
                      <div className="card p-5 border border-teal/10 bg-teal/5 flex flex-col items-center justify-center rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-teal/10 p-3 rounded-full text-teal mb-3"><Award className="w-6 h-6" /></div>
                        <div className="text-3xl font-black text-teal mb-1">{teacher.district_rank}</div>
                        <div className="text-sm font-bold text-teal/70">رتبه ناحیه</div>
                      </div>
                    )}
                  </div>
                </Reveal>
              )}

              {/* About Me */}
              {teacher.bio && (
                <Reveal delay={250}>
                  <div className="card p-6 md:p-8 border border-line-soft bg-white shadow-sm rounded-2xl">
                    <h2 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-3 text-ink">
                      درباره من
                      <div className="h-1 flex-1 bg-gradient-to-l from-line-soft to-transparent rounded-full ml-4 opacity-50"></div>
                    </h2>
                    <div className="prose prose-lg text-ink-soft leading-loose max-w-none">
                      {teacher.bio.split('\n').map((para, i) => (
                        <p key={i} className="mb-4 text-justify">{para}</p>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
              
              {/* Video */}
              {teacher.video_url && (
                <Reveal delay={350}>
                  <div className="card p-6 md:p-8 border border-line-soft bg-white shadow-sm rounded-2xl">
                    <h2 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-3 text-ink">
                      <Video className="w-6 h-6 text-tangerine" /> ویدیو معرفی
                    </h2>
                    <div className="aspect-video rounded-xl overflow-hidden border border-line-soft shadow-inner bg-slate-100">
                      <iframe
                        src={teacher.video_url.includes('aparat.com/v/') ? teacher.video_url.replace('/v/', '/video/video/embed/videohash/') + '/vt/frame' : teacher.video_url}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </Reveal>
              )}

            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter 
        footerText={s?.footer_text || undefined}
        contactEmail={s?.contact_email || undefined}
        contactPhone={s?.contact_phone || undefined}
        siteLogo={s?.site_logo_url || undefined}
        siteName={s?.site_name || undefined}
      />
    </div>
  )
}
