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
  const heroTitle = s?.hero_title || 'Ø¯Ø±Ø³ Ø¨Ø®ÙˆÙ†ØŒ Ø§Ù†ÛŒÙ…Ù‡ Ø¨Ø¨ÛŒÙ†ØŒ Ø¨Ø§ Ø®Ø§Ù†ÙˆØ§Ø¯Ù‡'
  const heroSubtitle = s?.hero_subtitle || 'Ø¯Ø±Ø³â€ŒÙ‡Ø§ÛŒ ØªØµÙˆÛŒØ±ÛŒ Ø¨Ø±Ø§ÛŒ Ú©Ù„Ø§Ø³ Ø§ÙˆÙ„ ØªØ§ Ø³ÙˆÙ…ØŒ Ø¯Ø± Ú©Ù†Ø§Ø± Ú©ØªØ§Ø¨Ø®Ø§Ù†Ù‡â€ŒØ§ÛŒ Ø§Ø² Ø§Ù†ÛŒÙ…Ù‡ Ùˆ ÙÛŒÙ„Ù…â€ŒÙ‡Ø§ÛŒ Ù…Ù†Ø§Ø³Ø¨ Ù‡Ø± Ø³Ù† â€” Ù‡Ù…Ù‡ Ø¯Ø± ÛŒÚ© Ø§Ø´ØªØ±Ø§Ú©.'
  const ctaText = s?.hero_cta_text || (user ? 'Ø±ÙØªÙ† Ø¨Ù‡ Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯' : 'Ø±Ø§ÛŒÚ¯Ø§Ù† Ø´Ø±ÙˆØ¹ Ú©Ù†')
  
  // Stats configuration
  const statLessonsCount = s?.stat_lessons_count || '120'
  const statLessonsLabel = s?.stat_lessons_label || 'Ø¯Ø±Ø³ ØªØµÙˆÛŒØ±ÛŒ'
  const statEpisodesCount = s?.stat_episodes_count || '500'
  const statEpisodesLabel = s?.stat_episodes_label || 'Ù‚Ø³Ù…Øª Ø§Ù†ÛŒÙ…Ù‡ Ùˆ ÙÛŒÙ„Ù…'
  const statUptime = s?.stat_uptime || '99.9'
  const statUptimeLabel = s?.stat_uptime_label || 'Ù¾Ø§ÛŒØ¯Ø§Ø±ÛŒ Ø³Ø±ÙˆÛŒØ³'

  return (
    <div className="page">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={s?.site_logo_url || undefined}
        siteName={s?.site_name || undefined}
      />

      {/* HERO: poster collage â€” the content is the identity, not decoration */}
      <section className="hero">
        <div className="hero-field" aria-hidden="true">
          <div className="hero-glow g1" />
          <div className="hero-glow g2" />
          <div className="hero-glow g3" />
        </div>
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="section-kicker"><Sparkles /> ÛŒØ§Ø¯Ú¯ÛŒØ±ÛŒ + Ø³Ø±Ú¯Ø±Ù…ÛŒØŒ ÛŒÚ©â€ŒØ¬Ø§</span>
            <h1 className="display text-balance">{heroTitle}</h1>
            <p className="lead" style={{ marginTop: '1.1rem' }}>{heroSubtitle}</p>
            <div className="button-row" style={{ marginTop: '1.6rem' }}>
              <Link href={user ? '/dashboard' : '/register'} className="button button-primary button-lg">{ctaText} <ArrowLeft /></Link>
              <Link href="/subscription" className="button button-ghost button-lg">Ø§Ø´ØªØ±Ø§Ú©â€ŒÙ‡Ø§</Link>
            </div>
            <div className="hero-trust">
              <span><ShieldCheck style={{ width: 18, color: 'var(--teal-deep)' }} /> {s?.hero_trust_badge_1 || 'Ù…Ø­ÛŒØ· Ø§Ù…Ù† Ø®Ø§Ù†ÙˆØ§Ø¯Ù‡'}</span>
              <span><Star style={{ width: 18, color: 'var(--sunflower)' }} /> {s?.hero_trust_badge_2 || 'Ù…Ø­ØªÙˆØ§ÛŒ Ù…Ù†Ø§Ø³Ø¨ Ø³Ù†'}</span>
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
                <div className="stat-bar-num">{statUptime}Ùª</div>
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
                  {s?.poster_tile_1_text || 'Ø±ÛŒØ§Ø¶ÛŒ\nÚ©Ù„Ø§Ø³ Ø§ÙˆÙ„'}
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
                  {s?.poster_tile_2_text || 'Ø§Ù†ÛŒÙ…Ù‡\nÙ…Ø§Ø¬Ø±Ø§Ø¬ÙˆÛŒÛŒ'}
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
                  {s?.poster_tile_3_text || 'ÙØ§Ø±Ø³ÛŒ\nÙˆ Ø±ÙˆØ§Ù†â€ŒØ®ÙˆØ§Ù†ÛŒ'}
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
                  {s?.poster_tile_4_text || 'ÙÛŒÙ„Ù…\nÚ©ÙˆØ¯Ú©Ø§Ù†Ù‡'}
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
              <span className="section-kicker"><Star /> Ø¨Ø±Ú¯Ø²ÛŒØ¯Ù‡â€ŒÙ‡Ø§</span>
              <h2 className="section-title">ÙØ±ÙˆØ´Ú¯Ø§Ù‡</h2>
            </div>
            <Link href="/shop" className="muted" style={{ fontWeight: 700 }}>Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù‡Ù…Ù‡ <ArrowLeft style={{ width: 16, display: 'inline' }} /></Link>
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
              <p className="muted">Ù…Ø­ØµÙˆÙ„Ø§Øª ÙØ±ÙˆØ´Ú¯Ø§Ù‡ Ø¨Ù‡ Ø²ÙˆØ¯ÛŒ Ø§Ø¶Ø§ÙÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯</p>
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
              <Link href={s?.promo_box_1_link || "/teacher-training"} className="card card-hover p-4 md:p-8 relative overflow-hidden group aspect-video md:aspect-auto md:min-h-[300px]" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid var(--teal)', background: `linear-gradient(180deg, rgba(20,19,31,0) 0%, rgba(20,19,31,0.8) 100%), url(${s?.promo_box_1_image || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=2000&auto=format&fit=crop'}) center/cover` }}>
                <div className="relative z-10 text-white">
                  <span className="badge bg-teal text-paper mb-2 md:mb-3">{s?.promo_box_1_badge || 'ÙˆÛŒÚ˜Ù‡'}</span>
                  <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{s?.promo_box_1_title || 'Ú©Ø§Ø±Ú¯Ø§Ù‡ ØªØ±Ø¨ÛŒØª Ù…Ø¹Ù„Ù… Ùˆ Ø¯ÙˆØ±Ù‡ Ù…Ø¹Ù„Ù… Ø®ØµÙˆØµÛŒ'}</h3>
                  <p className="text-white/80 line-clamp-2 text-sm md:text-base">{s?.promo_box_1_desc || 'Ø¨Ø§ Ø´Ø±Ú©Øª Ø¯Ø± Ø§ÛŒÙ† Ø¯ÙˆØ±Ù‡â€ŒÙ‡Ø§ Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ÛŒ Ø®ÙˆØ¯ Ø±Ø§ Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† ÛŒÚ© Ù…Ø¹Ù„Ù… Ø­Ø±ÙÙ‡â€ŒØ§ÛŒ Ø§Ø±ØªÙ‚Ø§ Ø¯Ù‡ÛŒØ¯ Ùˆ Ø¨Ù‡ ÛŒÚ© Ù…Ø¯Ø±Ø³ Ø¨Ø±ØªØ± Ø¯Ø± Ø³Ø·Ø­ Ú©Ø´ÙˆØ± ØªØ¨Ø¯ÛŒÙ„ Ø´ÙˆÛŒØ¯.'}</p>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={100}>
              <Link href={s?.promo_box_2_link || "/books"} className="card card-hover p-4 md:p-8 relative overflow-hidden group aspect-video md:aspect-auto md:min-h-[300px]" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid var(--tangerine)', background: `linear-gradient(180deg, rgba(20,19,31,0) 0%, rgba(20,19,31,0.8) 100%), url(${s?.promo_box_2_image || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000&auto=format&fit=crop'}) center/cover` }}>
                <div className="relative z-10 text-white">
                  <span className="badge bg-tangerine text-paper mb-2 md:mb-3">{s?.promo_box_2_badge || 'Ù…Ø¹Ø±ÙÛŒ'}</span>
                  <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{s?.promo_box_2_title || 'Ù…Ø¹Ø±ÙÛŒ Ú©ØªØ§Ø¨ Ù‡Ø§ÛŒ ÛŒØ§Ø±Ø§ÙˆÙ„ÛŒÙ‡Ø§'}</h3>
                  <p className="text-white/80 line-clamp-2 text-sm md:text-base">{s?.promo_box_2_desc || 'Ø¨Ù‡ØªØ±ÛŒÙ† Ú©ØªØ§Ø¨ Ù‡Ø§ÛŒ Ú©Ù…Ú© Ø¢Ù…ÙˆØ²Ø´ÛŒ Ùˆ Ø¯Ø§Ø³ØªØ§Ù†ÛŒ Ø±Ø§ Ø¨Ø±Ø§ÛŒ Ø¯Ø§Ù†Ø´ Ø¢Ù…ÙˆØ²Ø§Ù† Ø®ÙˆØ¯ Ø§Ø² Ø³Ø§ÛŒØª ÛŒØ§Ø±Ø§ÙˆÙ„ÛŒÙ‡Ø§ ØªÙ‡ÛŒÙ‡ Ú©Ù†ÛŒØ¯.'}</p>
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
              <span className="section-kicker"><Clapperboard /> Ú©ØªØ§Ø¨Ø®Ø§Ù†Ù‡ Ø³Ø±Ú¯Ø±Ù…ÛŒ</span>
              <h2 className="section-title">Ø§Ù†ÛŒÙ…Ù‡ Ùˆ ÙÛŒÙ„Ù…</h2>
            </div>
            <Link href="/entertainment" className="muted" style={{ fontWeight: 700 }}>Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù‡Ù…Ù‡ <ArrowLeft style={{ width: 16, display: 'inline' }} /></Link>
          </div>
                    {/* CATEGORY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'Ù„ÙˆØ­Ù‡ Ù†ÙˆÛŒØ³ÛŒ', title: 'Ù„ÙˆØ­Ù‡ Ù†ÙˆÛŒØ³ÛŒ', icon: 'âœï¸', bg: s?.ent_cat1_image ? `linear-gradient(135deg, rgba(20,184,166,0.6), rgba(15,118,110,0.8)), url(${s.ent_cat1_image}) center/cover` : 'linear-gradient(135deg, #14b8a6, #0f766e)' },
              { id: 'Ù†Ø´Ø§Ù†Ù‡ Ù‡Ø§ÛŒ Û±/Û²', title: 'Ù†Ø´Ø§Ù†Ù‡ Ù‡Ø§ÛŒ Û±/Û²', icon: 'ðŸ”¤', bg: s?.ent_cat2_image ? `linear-gradient(135deg, rgba(245,158,11,0.6), rgba(180,83,9,0.8)), url(${s.ent_cat2_image}) center/cover` : 'linear-gradient(135deg, #f59e0b, #b45309)' },
              { id: 'Ø¹Ù„ÙˆÙ…', title: 'Ø¹Ù„ÙˆÙ…', icon: 'ðŸ”¬', bg: s?.ent_cat3_image ? `linear-gradient(135deg, rgba(59,130,246,0.6), rgba(29,78,216,0.8)), url(${s.ent_cat3_image}) center/cover` : 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
              { id: 'Ø³Ø§ÛŒØ±', title: 'Ø³Ø§ÛŒØ± Ù…Ø­ØªÙˆØ§', icon: 'ðŸ“º', bg: s?.ent_cat4_image ? `linear-gradient(135deg, rgba(236,72,153,0.6), rgba(190,24,93,0.8)), url(${s.ent_cat4_image}) center/cover` : 'linear-gradient(135deg, #ec4899, #be185d)' }
            ].map(card => (
              <Link key={card.id} href={`/entertainment?c=${encodeURIComponent(card.id)}`} className="card card-hover p-6 relative overflow-hidden group flex flex-col justify-end text-right transition-transform hover:-translate-y-1" style={{ minHeight: '200px', background: card.bg, border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' }}>
                <div className="absolute top-4 right-4 text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                <div className="relative z-10 text-white w-full">
                  <span className="badge bg-white/20 text-white backdrop-blur-sm mb-2 inline-block px-2 py-1 rounded-full text-xs font-medium">Ø¨Ø®Ø´ Ø¢Ù…ÙˆØ²Ø´ÛŒ</span>
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
              <span className="section-kicker"><BookOpen /> Ù…Ø¬Ù„Ù‡ Ù…Ø§</span>
              <h2 className="section-title">Ø¢Ø®Ø±ÛŒÙ† Ø®Ø¨Ø±Ù‡Ø§ Ùˆ ÙˆØ¨Ù„Ø§Ú¯</h2>
            </div>
            <Link href="/blog" className="muted" style={{ fontWeight: 700 }}>Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù‡Ù…Ù‡ <ArrowLeft style={{ width: 16, display: 'inline' }} /></Link>
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
                    <div className="text-xs text-teal font-bold mb-2">ÙˆØ¨Ù„Ø§Ú¯</div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-ink-soft text-sm line-clamp-2 flex-1">{item.excerpt || item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="muted">Ù…Ø·Ù„Ø¨ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯</p>
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ù…Ø­ØªÙˆØ§ÛŒ Ø¯Ø±Ø³ÛŒ Ù…Ø¹ØªØ¨Ø±</h3>
              <p className="muted" style={{ marginTop: '.4rem', lineHeight: 1.7, fontSize: '.92rem' }}>Ø±ÛŒØ§Ø¶ÛŒØŒ ÙØ§Ø±Ø³ÛŒ Ùˆ Ø¹Ù„ÙˆÙ… Ø¨Ø±Ø§ÛŒ Ú©Ù„Ø§Ø³â€ŒÙ‡Ø§ÛŒ Ø§ÙˆÙ„ ØªØ§ Ø³ÙˆÙ….</p>
            </div>
            <div className="card tile">
              <div className="tile-ico" style={{ background: '#fde3ef', color: '#c2185b' }}><Palette /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ú©ØªØ§Ø¨Ø®Ø§Ù†Ù‡ Ø±Ø¯Ù‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒØ´Ø¯Ù‡</h3>
              <p className="muted" style={{ marginTop: '.4rem', lineHeight: 1.7, fontSize: '.92rem' }}>Ù‡Ø± Ø¹Ù†ÙˆØ§Ù† Ø¨Ø§ Ø±Ø¯Ù‡ Ø³Ù†ÛŒ Ù…Ø´Ø®ØµØŒ Ø¨Ø±Ø§ÛŒ Ø§Ù†ØªØ®Ø§Ø¨ Ø±Ø§Ø­Øª ÙˆØ§Ù„Ø¯ÛŒÙ†.</p>
            </div>
            <div className="card tile">
              <div className="tile-ico" style={{ background: '#e0f0ff', color: '#2563eb' }}><ShieldCheck /></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ú©Ù†ØªØ±Ù„ ÙˆØ§Ù„Ø¯ÛŒÙ†</h3>
              <p className="muted" style={{ marginTop: '.4rem', lineHeight: 1.7, fontSize: '.92rem' }}>Ù…Ø¯ÛŒØ±ÛŒØª Ø¯Ø³ØªØ±Ø³ÛŒ Ùˆ Ø²Ù…Ø§Ù† ØªÙ…Ø§Ø´Ø§ Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ú©ÙˆØ¯Ú©.</p>
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
              <span className="section-kicker"><HeartHandshake /> ØªÛŒÙ… Ø¯ÙˆØ³Øªâ€ŒØ¯Ø§Ø´ØªÙ†ÛŒ</span>
              <h2 className="section-title">Ù…Ø¹Ù„Ù…â€ŒÙ‡Ø§ÛŒ Ù…Ø§ Ø±Ø§ Ø¨Ø´Ù†Ø§Ø³ÛŒØ¯</h2>
            </div>
            <p className="muted" style={{ maxWidth: '38ch', lineHeight: 1.7 }}>Ù‡Ø± Ø¯Ø±Ø³ Ø±Ø§ Ú©Ø³ÛŒ Ù…ÛŒâ€ŒØ³Ø§Ø²Ø¯ Ú©Ù‡ Ø¹Ø§Ø´Ù‚ Ø¢Ù…ÙˆØ²Ø´ Ú©ÙˆØ¯Ú©Ø§Ù† Ø§Ø³Øª.</p>
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
                        <Clapperboard style={{ width: 14, height: 14 }} /> ÙˆÛŒØ¯ÛŒÙˆ Ù…Ø¹Ø±ÙÛŒ
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2.4rem', textAlign: 'center', border: '1px dashed var(--line-soft)' }}>
              <Sparkles style={{ width: 40, margin: '0 auto .6rem', color: 'var(--teal-deep)' }} />
              <p className="muted">Ø¨Ù‡â€ŒØ²ÙˆØ¯ÛŒ Ù…Ø¹Ù„Ù…â€ŒÙ‡Ø§ÛŒ Ù…Ø§ Ø±Ø§ Ø§ÛŒÙ†Ø¬Ø§ Ù…Ø¹Ø±ÙÛŒ Ù…ÛŒâ€ŒÚ©Ù†ÛŒÙ….</p>
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
                <span className="section-kicker" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}><Rocket style={{ width: 16 }} /> Ø§Ø´ØªØ±Ø§Ú© Û¶ Ù…Ø§Ù‡Ù‡</span>
                <h2 className="section-title text-balance" style={{ maxWidth: '22ch' }}>Ø¯Ø³ØªØ±Ø³ÛŒ Ú©Ø§Ù…Ù„ Ø¨Ù‡ Ù‡Ù…Ù‡ Ø¯Ø±Ø³â€ŒÙ‡Ø§ØŒ Ø§Ù†ÛŒÙ…Ù‡ Ùˆ ÙÛŒÙ„Ù…â€ŒÙ‡Ø§</h2>
              </div>
              <Link href="/subscription" className="button button-primary button-lg">ÙØ¹Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ Ø§Ø´ØªØ±Ø§Ú© <ArrowLeft /></Link>
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
