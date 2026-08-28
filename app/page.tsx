import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowLeft, BookOpen, Clapperboard, HeartHandshake, Palette, Rocket, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { validateSession } from '@/lib/auth'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { Reveal } from '@/components/Reveal'
import { getCachedSettings, getCachedTeachers, getCachedStoreItems, getCachedContent, getCachedBlogPosts } from '@/lib/cache'
import { query } from '@/lib/db'
import { ProductCard } from '@/components/shop/ProductCard'

export const revalidate = 60; // ISR: 1 minute

async function getHomePageContent() {
  const settingsKeys = [
    'hero_title', 'hero_subtitle', 'hero_cta_text', 'hero_trust_badge_1', 'hero_trust_badge_2', 'site_logo_url', 'site_name',
    'footer_text', 'contact_email', 'contact_phone',
    'stat_lessons_count', 'stat_lessons_label', 'stat_episodes_count', 'stat_episodes_label',
    'stat_uptime', 'stat_uptime_label',
    'poster_tile_1_text', 'poster_tile_1_image', 'poster_tile_1_show_text',
    'poster_tile_2_text', 'poster_tile_2_image', 'poster_tile_2_show_text', 'poster_tile_2_badge',
    'poster_tile_3_text', 'poster_tile_3_image', 'poster_tile_3_show_text',
    'poster_tile_4_text', 'poster_tile_4_image', 'poster_tile_4_show_text', 'poster_tile_4_badge',
    'promo_box_1_title', 'promo_box_1_desc', 'promo_box_1_badge', 'promo_box_1_link', 'promo_box_1_image',
    'promo_box_2_title', 'promo_box_2_desc', 'promo_box_2_badge', 'promo_box_2_link', 'promo_box_2_image',
    'ent_cat1_image', 'ent_cat2_image', 'ent_cat3_image', 'ent_cat4_image'
  ]
  const settingsData = await getCachedSettings(settingsKeys)
  
  // Calculate auto stats if needed
  let lessonsCount = settingsData.stat_lessons_count || 'auto'
  let episodesCount = settingsData.stat_episodes_count || 'auto'
  
  // Use cached content to compute counts
  const allContent = await getCachedContent();
  
  if (lessonsCount === 'auto') {
    lessonsCount = allContent.filter(c => ['lesson', 'worksheet', 'reading'].includes(c.content_type)).length.toString();
  }
  
  if (episodesCount === 'auto') {
    episodesCount = allContent.filter(c => ['anime', 'movie'].includes(c.content_type)).length.toString();
  }
  
  settingsData.stat_lessons_count = lessonsCount
  settingsData.stat_episodes_count = episodesCount
  
  // Get featured store items from cache
  const allStoreItems = await getCachedStoreItems();
  // Filter out products that are free, have no price, or are just for introducing
  const validStoreItems = allStoreItems.filter(i => !i.is_free && i.price_cents !== 0 && i.price_cents !== null);
  const storeItems = validStoreItems.slice(0, 4);
  
  // Get latest blog/news posts
  const allBlogs = await getCachedBlogPosts();
  const news = allBlogs.slice(0, 4);
  
  return { settings: settingsData, storeItems, news }
}

export default async function HomePage() {
  const token = (await cookies()).get('session_token')?.value
  const [user, teachers, { settings, storeItems, news }] = await Promise.all([
    token ? validateSession(token).catch(() => null) : Promise.resolve(null),
    getCachedTeachers().catch(() => []),
    getHomePageContent().catch((e) => {
      console.error("HomePage Error:", e);
      return { settings: {}, storeItems: [], news: [] };
    }),
  ])
  
  // Cast settings to proper type for safe access
  const s = settings as Record<string, string | null>
  
  // Use settings or fallback to defaults
  const heroTitle = s?.hero_title || 'درس بخون، انیمه ببین، با خانواده'
  const heroSubtitle = s?.hero_subtitle || 'درس‌های تصویری برای کلاس اول تا سوم، در کنار کتابخانه‌ای از انیمه و فیلم‌های مناسب هر سن — همه در یک اشتراک.'
  const ctaText = s?.hero_cta_text || (user ? 'رفتن به داشبورد' : 'رایگان شروع کن')
  
  // Stats configuration
  const statLessonsCount = s?.stat_lessons_count || '120'
  const statLessonsLabel = s?.stat_lessons_label || 'درس تصویری'
  const statEpisodesCount = s?.stat_episodes_count || '500'
  const statEpisodesLabel = s?.stat_episodes_label || 'قسمت انیمه و فیلم'
  const statUptime = s?.stat_uptime || '99.9'
  const statUptimeLabel = s?.stat_uptime_label || 'پایداری سرویس'

  return (
    <div className="page">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={s?.site_logo_url || undefined}
        siteName={s?.site_name || undefined}
      />

      {/* HERO: poster collage — the content is the identity, not decoration */}
      <section className="hero">
        <div className="hero-field" aria-hidden="true">
          <div className="hero-glow g1" />
          <div className="hero-glow g2" />
          <div className="hero-glow g3" />
        </div>
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="section-kicker"><Sparkles /> یادگیری + سرگرمی، یک‌جا</span>
            <h1 className="display text-balance">{heroTitle}</h1>
            <p className="lead" style={{ marginTop: '1.1rem' }}>{heroSubtitle}</p>
            <div className="button-row" style={{ marginTop: '1.6rem' }}>
              <Link href={user ? '/dashboard' : '/register'} className="button button-primary button-lg">{ctaText} <ArrowLeft /></Link>
              <Link href="/subscription" className="button button-ghost button-lg">اشتراک‌ها</Link>
            </div>
            <div className="hero-trust">
              <span><ShieldCheck style={{ width: 18, color: 'var(--teal-deep)' }} /> {s?.hero_trust_badge_1 || 'محیط امن خانواده'}</span>
              <span><Star style={{ width: 18, color: 'var(--sunflower)' }} /> {s?.hero_trust_badge_2 || 'محتوای مناسب سن'}</span>
            </div>
            <div className="stat-bar">
              <div>
                <div className="stat-bar-num">{statLessonsCount}+</div>
                <div className="stat-bar-label">{statLessonsLabel}</div>
              </div>
              <div>
                <div className="stat-bar-num">{statEpisodesCount}+</div>
                <div className="stat-bar-label">{statEpisodesLabel}</div>
              </div>
              <div>
                <div className="stat-bar-num">{statUptime}٪</div>
                <div className="stat-bar-label">{statUptimeLabel}</div>
              </div>
            </div>
          </div>

          {/* Signature element: tilted poster collage mixing lesson + anime/movie art */}
          <div className="poster-collage">
            {/* Tile 1 */}
            <div className="poster-tile tilt-a" style={{ 
              width: '34%', 
              top: '2%', 
              left: '4%', 
              aspectRatio: '2/3',
              background: s?.poster_tile_1_image 
                ? `url(${s?.poster_tile_1_image}) center/cover` 
                : 'linear-gradient(140deg, var(--teal), var(--teal-deep))'
            }}>
              {(s?.poster_tile_1_show_text === 'true' || !s?.poster_tile_1_image) && (
                <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#fff', fontWeight: 800, fontSize: '.85rem', textAlign: 'center', padding: '.5rem', whiteSpace: 'pre-line' }}>
                  {s?.poster_tile_1_text || 'ریاضی\nکلاس اول'}
                </div>
              )}
            </div>
            
            {/* Tile 2 */}
            <div className="poster-tile tilt-b" style={{ 
              width: '30%', 
              top: 0, 
              right: '6%', 
              aspectRatio: '2/3',
              background: s?.poster_tile_2_image 
                ? `url(${s?.poster_tile_2_image}) center/cover` 
                : 'linear-gradient(140deg, var(--berry), #c2185b)'
            }}>
              {(s?.poster_tile_2_show_text === 'true' || !s?.poster_tile_2_image) && (
                <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#fff', fontWeight: 800, fontSize: '.85rem', textAlign: 'center', padding: '.5rem', whiteSpace: 'pre-line' }}>
                  {s?.poster_tile_2_text || 'انیمه\nماجراجویی'}
                </div>
              )}
              {s?.poster_tile_2_badge && (
                <span className="poster-badge">{s?.poster_tile_2_badge}</span>
              )}
            </div>
            
            {/* Tile 3 */}
            <div className="poster-tile tilt-c" style={{ 
              width: '32%', 
              bottom: '4%', 
              left: '14%', 
              aspectRatio: '2/3',
              background: s?.poster_tile_3_image 
                ? `url(${s?.poster_tile_3_image}) center/cover` 
                : 'linear-gradient(140deg, var(--sunflower), #f59e0b)'
            }}>
              {(s?.poster_tile_3_show_text === 'true' || !s?.poster_tile_3_image) && (
                <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#fff', fontWeight: 800, fontSize: '.85rem', textAlign: 'center', padding: '.5rem', whiteSpace: 'pre-line' }}>
                  {s?.poster_tile_3_text || 'فارسی\nو روان‌خوانی'}
                </div>
              )}
            </div>
            
            {/* Tile 4 */}
            <div className="poster-tile tilt-d" style={{ 
              width: '30%', 
              bottom: 0, 
              right: '2%', 
              aspectRatio: '2/3',
              background: s?.poster_tile_4_image 
                ? `url(${s?.poster_tile_4_image}) center/cover` 
                : 'linear-gradient(140deg, var(--sky), #2563eb)'
            }}>
              {(s?.poster_tile_4_show_text === 'true' || !s?.poster_tile_4_image) && (
                <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#fff', fontWeight: 800, fontSize: '.85rem', textAlign: 'center', padding: '.5rem', whiteSpace: 'pre-line' }}>
                  {s?.poster_tile_4_text || 'فیلم\nکودکانه'}
                </div>
              )}
              {s?.poster_tile_4_badge && (
                <span className="poster-badge">{s?.poster_tile_4_badge}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STORE RAIL - Dynamic */}
      <section className="section" style={{ paddingBlock: '2.5rem' }}>
        <div className="shell">
          <Reveal>
          <div className="rail-head">
            <div>
              <span className="section-kicker"><Star /> برگزیده‌ها</span>
              <h2 className="section-title">فروشگاه</h2>
            </div>
            <Link href="/shop" className="muted" style={{ fontWeight: 700 }}>مشاهده همه <ArrowLeft style={{ width: 16, display: 'inline' }} /></Link>
          </div>
          {storeItems.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:pb-6 hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
              {storeItems.map((item: any) => (
                <div key={item.id} className="max-md:w-[200px] max-md:snap-center shrink-0">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="muted">محصولات فروشگاه به زودی اضافه می‌شود</p>
            </div>
          )}
          </Reveal>
        </div>
      </section>

      {/* TEACHER TRAINING & BOOKS */}
      <section className="section" style={{ paddingBlock: '1rem' }}>
        <div className="shell">
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <Link href={s?.promo_box_1_link || "/teacher-training"} className="card card-hover p-8 relative overflow-hidden group" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid var(--teal)', background: `linear-gradient(180deg, rgba(20,19,31,0) 0%, rgba(20,19,31,0.8) 100%), url(${s?.promo_box_1_image || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=2000&auto=format&fit=crop'}) center/cover` }}>
                <div className="relative z-10 text-white">
                  <span className="badge bg-teal text-paper mb-3">{s?.promo_box_1_badge || 'ویژه'}</span>
                  <h3 className="text-2xl font-bold mb-2">{s?.promo_box_1_title || 'دوره تربیت معلم و معلم خصوصی'}</h3>
                  <p className="text-white/80 line-clamp-2">{s?.promo_box_1_desc || 'با شرکت در این دوره، مهارت‌های تدریس خود را ارتقا دهید و به یک معلم حرفه‌ای تبدیل شوید.'}</p>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={100}>
              <Link href={s?.promo_box_2_link || "/books"} className="card card-hover p-8 relative overflow-hidden group" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid var(--tangerine)', background: `linear-gradient(180deg, rgba(20,19,31,0) 0%, rgba(20,19,31,0.8) 100%), url(${s?.promo_box_2_image || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000&auto=format&fit=crop'}) center/cover` }}>
                <div className="relative z-10 text-white">
                  <span className="badge bg-tangerine text-paper mb-3">{s?.promo_box_2_badge || 'معرفی'}</span>
                  <h3 className="text-2xl font-bold mb-2">{s?.promo_box_2_title || 'معرفی کتاب‌ها'}</h3>
                  <p className="text-white/80 line-clamp-2">{s?.promo_box_2_desc || 'بهترین کتاب‌های کمک آموزشی و داستان را برای فرزندان خود پیدا کنید.'}</p>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ANIME & MOVIES RAIL - Dynamic */}
      <section className="section" style={{ paddingBlock: '1rem 2.5rem', background: 'var(--cream)' }}>
        <div className="shell">
          <Reveal>
          <div className="rail-head">
            <div>
              <span className="section-kicker"><Clapperboard /> کتابخانه سرگرمی</span>
              <h2 className="section-title">انیمه و فیلم</h2>
            </div>
            <Link href="/entertainment" className="muted" style={{ fontWeight: 700 }}>مشاهده همه <ArrowLeft style={{ width: 16, display: 'inline' }} /></Link>
          </div>
                    {/* CATEGORY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'لوحه نویسی', title: 'لوحه نویسی', icon: '✏️', bg: s?.ent_cat1_image ? `linear-gradient(135deg, rgba(20,184,166,0.6), rgba(15,118,110,0.8)), url(${s.ent_cat1_image}) center/cover` : 'linear-gradient(135deg, #14b8a6, #0f766e)' },
              { id: 'نشانه های ۱/۲', title: 'نشانه های ۱/۲', icon: '🔤', bg: s?.ent_cat2_image ? `linear-gradient(135deg, rgba(245,158,11,0.6), rgba(180,83,9,0.8)), url(${s.ent_cat2_image}) center/cover` : 'linear-gradient(135deg, #f59e0b, #b45309)' },
              { id: 'علوم', title: 'علوم', icon: '🔬', bg: s?.ent_cat3_image ? `linear-gradient(135deg, rgba(59,130,246,0.6), rgba(29,78,216,0.8)), url(${s.ent_cat3_image}) center/cover` : 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
              { id: 'سایر', title: 'سایر محتوا', icon: '📺', bg: s?.ent_cat4_image ? `linear-gradient(135deg, rgba(236,72,153,0.6), rgba(190,24,93,0.8)), url(${s.ent_cat4_image}) center/cover` : 'linear-gradient(135deg, #ec4899, #be185d)' }
            ].map(card => (
              <Link key={card.id} href={`/entertainment?c=${encodeURIComponent(card.id)}`} className="card card-hover p-6 relative overflow-hidden group flex flex-col justify-end text-right transition-transform hover:-translate-y-1" style={{ minHeight: '200px', background: card.bg, border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' }}>
                <div className="absolute top-4 right-4 text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                <div className="relative z-10 text-white w-full">
                  <span className="badge bg-white/20 text-white backdrop-blur-sm mb-2 inline-block px-2 py-1 rounded-full text-xs font-medium">بخش آموزشی</span>
                  <h3 className="text-xl font-bold mb-1 text-white drop-shadow-md">{card.title}</h3>
                </div>
              </Link>
            ))}
          </div>


          </Reveal>
        </div>
      </section>

      {/* NEWS & BLOG RAIL - Dynamic */}
      <section className="section" style={{ paddingBlock: '1rem 2.5rem' }}>
        <div className="shell">
          <Reveal>
          <div className="rail-head">
            <div>
              <span className="section-kicker"><BookOpen /> مجله ما</span>
              <h2 className="section-title">آخرین خبرها و وبلاگ</h2>
            </div>
            <Link href="/blog" className="muted" style={{ fontWeight: 700 }}>مشاهده همه <ArrowLeft style={{ width: 16, display: 'inline' }} /></Link>
          </div>
          {news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:pb-6 hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
              {news.map((item: any) => (
                <Link 
                  key={item.id} 
                  href={`/blog/${item.slug}`} 
                  className="card card-hover p-0 overflow-hidden flex flex-col max-md:w-[280px] max-md:snap-center shrink-0"
                >
                  <div className="aspect-video" style={{ 
                    backgroundImage: item.thumbnail_url ? `url(${item.thumbnail_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    background: !item.thumbnail_url ? 'linear-gradient(150deg, var(--teal-deep), var(--ink))' : undefined,
                  }} />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-xs text-teal font-bold mb-2">وبلاگ</div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-ink-soft text-sm line-clamp-2 flex-1">{item.excerpt || item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="muted">مطلبی یافت نشد</p>
            </div>
          )}
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" style={{ paddingBlock: '2rem' }}>
        <div className="shell">
          <Reveal>
          <div className="tiles">
            <div className="card tile">
              <div className="tile-ico" style={{ background: '#d9f9e3', color: '#0d7a3d' }}><BookOpen /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>محتوای درسی معتبر</h3>
              <p className="muted" style={{ marginTop: '.4rem', lineHeight: 1.7, fontSize: '.92rem' }}>ریاضی، فارسی و علوم برای کلاس‌های اول تا سوم.</p>
            </div>
            <div className="card tile">
              <div className="tile-ico" style={{ background: '#fde3ef', color: '#c2185b' }}><Palette /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>کتابخانه رده‌بندی‌شده</h3>
              <p className="muted" style={{ marginTop: '.4rem', lineHeight: 1.7, fontSize: '.92rem' }}>هر عنوان با رده سنی مشخص، برای انتخاب راحت والدین.</p>
            </div>
            <div className="card tile">
              <div className="tile-ico" style={{ background: '#e0f0ff', color: '#2563eb' }}><ShieldCheck /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>کنترل والدین</h3>
              <p className="muted" style={{ marginTop: '.4rem', lineHeight: 1.7, fontSize: '.92rem' }}>مدیریت دسترسی و زمان تماشا برای هر پروفایل کودک.</p>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* TEACHERS */}
      <section className="section" id="teachers">
        <div className="shell">
          <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <span className="section-kicker"><HeartHandshake /> تیم دوست‌داشتنی</span>
              <h2 className="section-title">معلم‌های ما را بشناسید</h2>
            </div>
            <p className="muted" style={{ maxWidth: '38ch', lineHeight: 1.7 }}>هر درس را کسی می‌سازد که عاشق آموزش کودکان است.</p>
          </div>

          {teachers.length > 0 ? (
            <div className="teacher-grid max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:pb-6 hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch', gap: '1rem' }}>
              {teachers.map((t) => (
                <article key={t.id} className="card card-hover teacher-card max-md:w-[260px] max-md:snap-center shrink-0">
                  {t.photo_url ? (
                    <img src={t.photo_url || "/placeholder.svg"} alt={t.name} className="teacher-photo" />
                  ) : (
                    <div className="teacher-photo" style={{ display: 'grid', placeItems: 'center', color: 'var(--ink-soft)' }}><Sparkles style={{ width: 40 }} /></div>
                  )}
                  <div className="teacher-body">
                    <h3 className="teacher-name">{t.name}</h3>
                    {t.specialty && <span className="chip teacher-specialty">{t.specialty}</span>}
                    {t.bio && <p className="muted" style={{ lineHeight: 1.7, fontSize: '.95rem', marginBottom: t.video_url ? '1rem' : 0 }}>{t.bio}</p>}
                    {t.video_url && (
                      <a href={t.video_url} target="_blank" rel="noopener noreferrer" className="button button-ghost" style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        <Clapperboard style={{ width: 14, height: 14 }} /> ویدیو معرفی
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2.4rem', textAlign: 'center', border: '1px dashed var(--line-soft)' }}>
              <Sparkles style={{ width: 40, margin: '0 auto .6rem', color: 'var(--teal-deep)' }} />
              <p className="muted">به‌زودی معلم‌های ما را اینجا معرفی می‌کنیم.</p>
            </div>
          )}
          </Reveal>
        </div>
      </section>

      {/* SUBSCRIPTION CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <Reveal>
          <div className="card" style={{ padding: 'clamp(2rem, 5vw, 3rem)', background: 'var(--ink)', color: 'var(--paper)', border: 'none' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="section-kicker" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}><Rocket style={{ width: 16 }} /> اشتراک ۶ ماهه</span>
                <h2 className="section-title text-balance" style={{ maxWidth: '22ch' }}>دسترسی کامل به همه درس‌ها، انیمه و فیلم‌ها</h2>
              </div>
              <Link href="/subscription" className="button button-primary button-lg">فعال‌سازی اشتراک <ArrowLeft /></Link>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter 
        footerText={s?.footer_text || undefined}
        contactEmail={s?.contact_email || undefined}
        contactPhone={s?.contact_phone || undefined}
      />
    </div>
  )
}
