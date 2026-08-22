import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, ExternalLink, HeartHandshake, KeyRound, Link2, Users, FileVideo, Settings, MessageCircle, FileText, Newspaper, Image } from 'lucide-react'
import { query } from '@/lib/db'
import { validateSession } from '@/lib/auth'
import { SiteHeader } from '@/components/SiteHeader'
import { AccountControls } from '@/components/AccountControls'
import { DatabaseMigration } from '@/components/admin/DatabaseMigration'

async function stats() {
  const [users, subs, content, teachers, recentContent, recentLinks] = await Promise.all([
    query<any>('SELECT COUNT(*) as count FROM yar_users'),
    query<any>('SELECT COUNT(*) as count FROM yar_subscriptions WHERE end_date > NOW()'),
    query<any>('SELECT COUNT(*) as count FROM yar_content_items WHERE published=true'),
    query<any>('SELECT COUNT(*) as count FROM yar_teachers'),
    query<any>('SELECT id,title,content_type,created_at,view_count FROM yar_content_items ORDER BY created_at DESC LIMIT 5'),
    query<any>('SELECT id,code,expires_at,max_redemptions,current_redemptions FROM yar_subscription_links ORDER BY created_at DESC LIMIT 5')
  ])
  
  return {
    users: users[0]?.count || 0,
    subs: subs[0]?.count || 0,
    content: content[0]?.count || 0,
    teachers: teachers[0]?.count || 0,
    recentContent,
    recentLinks
  }
}

export default async function AdminPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  
  if (!user || user.role !== 'admin') redirect('/')
  
  const s = await stats()
  
  return (
    <div className="p-4 md:p-8">
      <main className="max-w-7xl mx-auto space-y-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-ink mb-2">داشبورد مدیریت</h1>
            <p className="text-ink-soft">سلام {user.name} عزیز، به پنل مدیریت خوش آمدی!</p>
          </div>
          <DatabaseMigration />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-6 flex flex-col gap-4" style={{ background: 'var(--paper)' }}>
            <div className="flex items-center gap-3 text-ink-soft">
              <Users />
              <span className="font-bold">کاربران</span>
            </div>
            <p className="text-4xl font-black text-teal">{s.users}</p>
          </div>
          <div className="card p-6 flex flex-col gap-4" style={{ background: 'var(--sunflower)', color: 'var(--ink)' }}>
            <div className="flex items-center gap-3">
              <KeyRound />
              <span className="font-bold">اشتراک فعال</span>
            </div>
            <p className="text-4xl font-black">{s.subs}</p>
          </div>
          <div className="card p-6 flex flex-col gap-4" style={{ background: 'var(--teal)', color: 'var(--paper)' }}>
            <div className="flex items-center gap-3">
              <BookOpen />
              <span className="font-bold">محتوا</span>
            </div>
            <p className="text-4xl font-black">{s.content}</p>
          </div>
          <div className="card p-6 flex flex-col gap-4" style={{ background: 'var(--berry)', color: 'var(--paper)' }}>
            <div className="flex items-center gap-3">
              <HeartHandshake />
              <span className="font-bold">معلم‌ها</span>
            </div>
            <p className="text-4xl font-black">{s.teachers}</p>
          </div>
        </div>

        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
          <section className="card account-panel">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>محتوای اخیر</h2>
            {s.recentContent.length ? s.recentContent.map((x: any) => (
              <div className="data-row" key={x.id}>
                <div>
                  <b>{x.title}</b>
                  <p className="muted" style={{ fontSize: '.85rem' }}>{x.content_type}</p>
                </div>
                <span>{x.view_count || 0} بازدید</span>
              </div>
            )) : <p className="muted">محتوایی نیست.</p>}
          </section>
          <section className="card account-panel">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>کدهای اخیر</h2>
            {s.recentLinks.length ? s.recentLinks.map((x: any) => (
              <div className="data-row" key={x.id}>
                <b className="ltr">{x.code}</b>
                <span>{x.current_redemptions}/{x.max_redemptions}</span>
              </div>
            )) : <p className="muted">کدی نیست.</p>}
          </section>
        </div>
        
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <AccountControls />
        </div>
      </main>
    </div>
  )
}
