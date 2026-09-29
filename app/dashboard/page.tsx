import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { getActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { getUserOrders } from '@/lib/orders'
import { getSettings } from '@/lib/settings'
import { UserDashboardHub } from '@/components/dashboard/UserDashboardHub'

async function getData(userId: string) {
  let continuing: any[] = []
  let watched: any[] = []
  try {
    const history = await query<any>(
      `SELECT vh.*, c.title, c.thumbnail_url, c.duration_seconds, c.content_type
       FROM yar_viewing_history vh
       JOIN yar_content_items c ON vh.content_id = c.id
       WHERE vh.user_id = $1
       ORDER BY vh.last_watched_at DESC
       LIMIT 8`,
      [userId]
    )
    continuing = history.filter((x) => !x.completed && x.progress_seconds > 0).slice(0, 5)
    watched = history.filter((x) => x.completed).slice(0, 6)
  } catch (error) {
    console.error('Error fetching viewing history:', error)
  }

  let slides: any[] = []
  try {
    slides = await query<any>(
      `SELECT * FROM yar_homepage_slides 
       WHERE is_active = true 
       ORDER BY display_order ASC`
    )
  } catch (error) {
    console.error('Slides table not found or error fetching slides:', error)
  }

  return { continuing, watched, slides }
}

export default async function DashboardPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  if (!user) redirect('/login')

  const [
    activeSub,
    settings,
    userOrders,
    { continuing, slides },
  ] = await Promise.all([
    getActiveSubscription(user.id),
    getSettings([
      'site_logo_url',
      'site_name',
      'footer_text',
      'contact_email',
      'contact_phone',
      'admin_card_number',
      'admin_card_holder'
    ]),
    getUserOrders(user.id),
    getData(user.id),
  ])

  // Fetch tutoring requests submitted by this user (by user_id or matching phone)
  let tutoringRequests: any[] = []
  try {
    tutoringRequests = await query<any>(
      `SELECT 
         r.id,
         r.teacher_id,
         t.name as teacher_name,
         t.photo_url as teacher_photo,
         t.specialty as teacher_specialty,
         r.student_name,
         r.phone,
         r.teaching_mode,
         r.teaching_type,
         r.grade,
         r.subject,
         r.duration_minutes,
         r.preferred_time,
         r.city,
         r.notes,
         r.status,
         r.created_at
       FROM yar_tutoring_requests r
       LEFT JOIN yar_teachers t ON r.teacher_id = t.id
       WHERE r.user_id = $1 OR (r.phone = $2 AND $2 != '')
       ORDER BY r.created_at DESC`,
      [user.id, user.phone || '']
    )
  } catch (e) {
    console.error('Error fetching user tutoring requests:', e)
  }

  // Fetch support tickets count for this user
  let supportTicketsCount = 0
  try {
    const ticketRows = await query<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM yar_support_tickets WHERE user_id = $1`,
      [user.id]
    )
    supportTicketsCount = ticketRows[0] ? Number(ticketRows[0].count) : 0
  } catch (e) {
    console.error('Error counting support tickets:', e)
  }

  // Calculate subscription days left
  let daysLeft = 0
  if (activeSub && activeSub.end_date) {
    const end = new Date(activeSub.end_date).getTime()
    const now = Date.now()
    daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
  }

  const adminCard = settings.admin_card_number ? {
    number: settings.admin_card_number,
    name: settings.admin_card_holder || 'مدیریت سایت'
  } : undefined

  return (
    <div className="page bg-[#f8fafc] min-h-screen flex flex-col">
      <SiteHeader 
        userName={user.name} 
        isAdmin={user.role === 'admin'} 
        siteLogo={settings.site_logo_url || undefined}
        siteName={settings.site_name || undefined}
      />

      <main className="shell py-8 md:py-12 flex-1">
        <UserDashboardHub
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            created_at: (user as any).created_at
          }}
          subscription={{
            isActive: !!activeSub,
            startDate: activeSub?.start_date,
            endDate: activeSub?.end_date,
            daysLeft: daysLeft
          }}
          orders={userOrders}
          tutoringRequests={tutoringRequests}
          supportTicketsCount={supportTicketsCount}
          slides={slides}
          continuingWatching={continuing}
          adminCard={adminCard}
        />
      </main>

      <SiteFooter 
        footerText={settings.footer_text || undefined}
        contactEmail={settings.contact_email || undefined}
        contactPhone={settings.contact_phone || undefined}
        siteLogo={settings.site_logo_url || undefined}
        siteName={settings.site_name || undefined}
      />
    </div>
  )
}
