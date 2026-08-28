import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTeacherById } from '@/lib/teachers'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import { GraduationCap, MapPin, Building2, ChevronRight } from 'lucide-react'

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

  return (
    <div className="page bg-paper text-ink min-h-screen flex flex-col">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={s?.site_logo_url || undefined}
        siteName={s?.site_name || undefined}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto md:py-8">
        <div className="bg-white md:rounded-2xl md:border md:border-line-soft overflow-hidden shadow-sm">
          
          {/* Header Banner */}
          <div className="relative h-48 md:h-56 bg-slate-800" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            <div className="absolute top-4 right-4 z-10">
              <Link href="/about" className="inline-flex items-center gap-1 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors text-sm">
                <ChevronRight className="w-4 h-4" />
                بازگشت
              </Link>
            </div>
            
            {/* Yellow Accent Shape (like the screenshot) */}
            <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-sunflower rounded-br-[100px] opacity-90" />
            
            <div className="absolute bottom-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-48 text-white text-center md:text-right">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{teacher.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-white/80 text-sm">
                <span className="w-2 h-2 rounded-full bg-sunflower"></span>
                <span>{teacher.specialty || 'مدرس یاراولیها'}</span>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 md:px-12 pb-12 relative">
            
            {/* Avatar */}
            <div className="flex justify-center md:justify-start -mt-20 md:-mt-24 mb-8 relative z-20">
              <div className="w-40 h-40 rounded-full border-4 border-white bg-cream shadow-md overflow-hidden relative">
                <div className="absolute inset-0 rounded-full border-[6px] border-sunflower/20" />
                {teacher.photo_url ? (
                  <img src={teacher.photo_url} alt={teacher.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl text-slate-300">
                    {teacher.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-4 mb-10 max-w-lg mx-auto md:mx-0 text-ink-soft">
              {teacher.education && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-400" />
                  <span>{teacher.education}</span>
                </div>
              )}
              {teacher.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span>{teacher.location}</span>
                </div>
              )}
              {teacher.workplace && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-slate-400" />
                  <span>{teacher.workplace}</span>
                </div>
              )}
              {teacher.experience_years && (
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 text-slate-400 flex items-center justify-center text-xs font-bold border border-slate-400 rounded-full">
                    {teacher.experience_years}
                  </span>
                  <span>سال سابقه کار</span>
                </div>
              )}
            </div>

            {/* Stats/Ranks */}
            {(teacher.national_rank || teacher.provincial_rank || teacher.district_rank) && (
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-12 py-6 border-y border-line-soft">
                <div className="text-center px-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-rose-500"></span>
                    <span className="text-xs md:text-sm text-ink-soft">رتبه کشوری</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold">{teacher.national_rank || '—'}</div>
                </div>
                <div className="text-center px-2 border-x border-line-soft">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-sunflower"></span>
                    <span className="text-xs md:text-sm text-ink-soft">رتبه استانی</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold">{teacher.provincial_rank || '—'}</div>
                </div>
                <div className="text-center px-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-emerald-500"></span>
                    <span className="text-xs md:text-sm text-ink-soft">رتبه ناحیه</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold">{teacher.district_rank || '—'}</div>
                </div>
              </div>
            )}

            {/* About Me */}
            {teacher.bio && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">درباره من</h2>
                <div className="prose prose-lg text-ink-soft leading-relaxed max-w-none">
                  {teacher.bio.split('\\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Video */}
            {teacher.video_url && (
              <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">ویدیو معرفی</h2>
                <div className="aspect-video rounded-xl overflow-hidden border border-line-soft">
                  <iframe
                    src={teacher.video_url.includes('aparat.com/v/') ? teacher.video_url.replace('/v/', '/video/video/embed/videohash/') + '/vt/frame' : teacher.video_url}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  )
}
