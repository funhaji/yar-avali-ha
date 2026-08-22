import Link from 'next/link'
import { LayoutDashboard, ShieldCheck } from 'lucide-react'

export function DashboardSwitch({ mode }: { mode: 'admin' | 'user' }) {
  const isAdminMode = mode === 'admin'

  return (
    <aside className="card dashboard-switch">
      <div>
        <span className="section-kicker">
          {isAdminMode ? <ShieldCheck /> : <LayoutDashboard />}
          جابه‌جایی داشبورد
        </span>
        <h2>{isAdminMode ? 'نمای کاربری را ببین' : 'برگرد به پنل مدیریت'}</h2>
        <p className="muted">
          {isAdminMode
            ? 'برای بررسی تجربه کاربران عادی، وارد داشبورد معمولی شو.'
            : 'هر وقت خواستی ابزارهای مدیریتی را باز کنی، از همین میان‌بر استفاده کن.'}
        </p>
      </div>
      <Link href={isAdminMode ? '/dashboard' : '/admin'} className="button button-primary">
        {isAdminMode ? <LayoutDashboard /> : <ShieldCheck />}
        {isAdminMode ? 'داشبورد معمولی' : 'داشبورد مدیریت'}
      </Link>
    </aside>
  )
}
