'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Crown, Sparkles, BookOpen, GraduationCap, ShoppingBag, 
  Clapperboard, FileText, HeartHandshake, Film, Image as ImageIcon, 
  Newspaper, Info, MessageSquare, ShieldCheck, ArrowLeft, 
  ExternalLink, KeyRound, Clock, CheckCircle2, ChevronLeft, 
  User, Phone, Mail, Calendar, Settings, ShieldAlert, Play
} from 'lucide-react'
import { HomepageSlider } from '@/components/HomepageSlider'
import { UserOrdersSection } from '@/components/dashboard/UserOrdersSection'
import { UserTutoringRequestsSection, UserTutoringRequestItem } from '@/components/dashboard/UserTutoringRequestsSection'
import { UserSupportTicketsSection } from '@/components/dashboard/UserSupportTicketsSection'
import { AccountControls } from '@/components/AccountControls'
import type { OrderDetail } from '@/lib/orders'

interface Props {
  user: {
    id: string
    name: string
    email: string
    phone?: string | null
    role: string
    created_at?: string | Date
  }
  subscription: {
    isActive: boolean
    startDate?: string | Date | null
    endDate?: string | Date | null
    daysLeft?: number
  }
  orders: OrderDetail[]
  tutoringRequests: UserTutoringRequestItem[]
  supportTicketsCount: number
  slides?: any[]
  continuingWatching?: any[]
  adminCard?: { number: string; name: string }
}

export function UserDashboardHub({
  user,
  subscription,
  orders,
  tutoringRequests,
  supportTicketsCount,
  slides = [],
  continuingWatching = [],
  adminCard
}: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'tutoring' | 'support' | 'security'>('overview')

  const pendingOrdersCount = orders.filter(o => o.status === 'pending_payment' || o.status === 'pending_approval').length
  const pendingRequestsCount = tutoringRequests.filter(r => r.status === 'pending').length

  return (
    <div className="flex flex-col gap-8">
      {/* 1. TOP PROFILE & SUMMARY HERO */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User identity info */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-deep text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-sm border-2 border-teal-700 shrink-0">
              {user.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  سلام، {user.name} عزیز! 👋
                </h1>
                {user.role === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                    مدیر سیستم
                  </span>
                )}
                {subscription.isActive ? (
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-950 border-2 border-amber-400 flex items-center gap-1.5 shadow-2xs">
                    <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    اشتراک ویژه فعال ({subscription.daysLeft ?? 0} روز باقیمانده)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-700 border-2 border-slate-300">
                    کاربر عادی (بدون اشتراک)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 sm:gap-5 text-xs text-slate-600 font-bold mt-2 flex-wrap">
                {user.email && (
                  <span className="flex items-center gap-1 text-slate-700" dir="ltr">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1 text-slate-700" dir="ltr">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {user.phone}
                  </span>
                )}
                {user.created_at && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    عضویت: {new Date(user.created_at).toLocaleDateString('fa-IR')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-black text-xs shadow-sm border-2 border-purple-700 flex items-center gap-2 transition-all hover:scale-102"
              >
                <Settings className="w-4 h-4 text-purple-300" />
                <span>ورود به پنل مدیریت سایت</span>
              </Link>
            )}

            {!subscription.isActive ? (
              <Link
                href="/subscription"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-sm border-2 border-amber-600 flex items-center gap-2 transition-all hover:scale-102"
              >
                <Crown className="w-4 h-4 fill-white" />
                <span>خرید اشتراک ویژه (دسترسی نامحدود)</span>
              </Link>
            ) : (
              <Link
                href="/subscription"
                className="px-4 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs border-2 border-amber-300 shadow-2xs transition-all flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>تمدید یا تغییر پلن اشتراک</span>
              </Link>
            )}
          </div>
        </div>

        {/* 4 SUMMARY STAT CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t-2 border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between gap-3 ${
              activeTab === 'orders'
                ? 'bg-teal/10 border-teal shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div>
              <span className="text-xs text-slate-500 font-bold block mb-1">سفارشات من</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">{orders.length}</span>
              {pendingOrdersCount > 0 && (
                <span className="text-[11px] font-black text-amber-700 block mt-0.5">
                  ({pendingOrdersCount} در انتظار پرداخت)
                </span>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal/15 text-teal flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tutoring')}
            className={`p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between gap-3 ${
              activeTab === 'tutoring'
                ? 'bg-purple-100/60 border-purple-500 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div>
              <span className="text-xs text-slate-500 font-bold block mb-1">کلاس‌ها و دوره‌های من</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">{tutoringRequests.length}</span>
              {pendingRequestsCount > 0 && (
                <span className="text-[11px] font-black text-purple-700 block mt-0.5">
                  ({pendingRequestsCount} در انتظار هماهنگی)
                </span>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between gap-3 ${
              activeTab === 'support'
                ? 'bg-blue-100/60 border-blue-500 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div>
              <span className="text-xs text-slate-500 font-bold block mb-1">تیکت‌های پشتیبانی</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">{supportTicketsCount}</span>
              <span className="text-[11px] font-bold text-slate-500 block mt-0.5">گفتگوی مستقیم</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
          </button>

          <Link
            href="/entertainment"
            className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-right transition-all flex items-center justify-between gap-3"
          >
            <div>
              <span className="text-xs text-slate-500 font-bold block mb-1">کتابخانه ویدیو</span>
              <span className="text-sm sm:text-base font-black text-slate-900 block">انیمه و فیلم‌ها</span>
              <span className="text-[11px] font-bold text-rose-700 block mt-0.5">مشاهده آنلاین</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Clapperboard className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </section>

      {/* 2. MASTER DASHBOARD NAVIGATION TABS */}
      <section className="bg-slate-100 p-2 rounded-2xl border-2 border-slate-300 flex items-center gap-2 overflow-x-auto shadow-xs text-xs font-black">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 border-2 ${
            activeTab === 'overview'
              ? 'bg-teal text-white border-teal-700 shadow-sm'
              : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>۱. نمای کلی و دسترسی به تمام بخش‌ها</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 border-2 ${
            activeTab === 'orders'
              ? 'bg-teal text-white border-teal-700 shadow-sm'
              : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-teal" />
          <span>۲. سفارشات و فایل‌های من</span>
          {orders.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-900 text-white font-black">
              {orders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tutoring')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 border-2 ${
            activeTab === 'tutoring'
              ? 'bg-purple-800 text-white border-purple-900 shadow-sm'
              : 'bg-white text-purple-950 border-purple-300 hover:border-purple-400 font-bold'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-purple-600" />
          <span>۳. کلاس‌ها و دوره‌های من</span>
          {tutoringRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] bg-purple-950 text-white font-black">
              {tutoringRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 border-2 ${
            activeTab === 'support'
              ? 'bg-blue-800 text-white border-blue-900 shadow-sm'
              : 'bg-white text-blue-950 border-blue-300 hover:border-blue-400 font-bold'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>۴. پشتیبانی و تیکت‌ها</span>
          {supportTicketsCount > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] bg-blue-950 text-white font-black">
              {supportTicketsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 border-2 ${
            activeTab === 'security'
              ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
              : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold'
          }`}
        >
          <KeyRound className="w-4 h-4 text-slate-600" />
          <span>۵. امنیت و تنظیمات حساب</span>
        </button>
      </section>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: OVERVIEW & COMPLETE PORTAL ACCESS */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-10 animate-in fade-in duration-200">
          {/* SLIDER / BANNERS IF AVAILABLE */}
          {slides && slides.length > 0 && (
            <section>
              <HomepageSlider slides={slides} />
            </section>
          )}

          {/* CONTINUE WATCHING IF AVAILABLE */}
          {continuingWatching && continuingWatching.length > 0 && (
            <section className="bg-white p-6 rounded-3xl border-2 border-slate-300 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <Film className="w-5 h-5 text-teal" />
                  <span>ادامه تماشای برنامه‌ها و فیلم‌ها</span>
                </h3>
                <Link
                  href="/entertainment"
                  className="text-xs font-black text-teal hover:underline flex items-center gap-1"
                >
                  <span>همه ویدیوها</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {continuingWatching.map(item => {
                  const pct = item.duration_seconds
                    ? Math.min(100, Math.round((item.progress_seconds / item.duration_seconds) * 100))
                    : 0

                  return (
                    <Link
                      key={item.id}
                      href={`/watch/${item.content_id}`}
                      className="group rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-teal transition-all bg-slate-50 flex flex-col"
                    >
                      <div className="aspect-video relative overflow-hidden bg-slate-200">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Play className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-300">
                          <div className="h-full bg-teal" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="p-2.5">
                        <span className="text-xs font-black text-slate-900 line-clamp-1 block group-hover:text-teal">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                          {pct}% تماشا شده
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* COMPLETE ACCESS SUITES (EVERYTHING ON PLATFORM) */}
          <section className="flex flex-col gap-6">
            <div className="border-b-2 border-slate-200 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-teal" />
                <span>دسترسی کامل و یکپارچه به تمامی بخش‌های یار اولی‌ها</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
                برای استفاده از هر بخش، روی کارت مربوطه کلیک کنید
              </p>
            </div>

            {/* SUITE 1: TEACHING, TUTORING & CLASSES */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-teal-deep">
                <GraduationCap className="w-4 h-4 text-teal" />
                <span>بخش اول: آموزش، کلاس‌های خصوصی و تربیت معلم</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/teacher-training"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-900 border border-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        دوره تربیت معلم و تدریس خصوصی
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        رزرو جلسات تدریس برای دانش‌آموزان و دوره‌های تخصصی معلمان
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>مشاهده اساتید و رزرو</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  href="/teachers"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 border border-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <HeartHandshake className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        معلمان و اساتید برتر
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        مشاهده رزومه، افتخارات کشوری، ویدیوها و امتیازات اساتید
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>بانک اساتید یار اولی‌ها</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  href="/worksheets"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        کاربرگ‌ها و آزمون‌ها
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        دانلود فایل‌های تمرینی PDF، نمونه سوالات و تکالیف هفتگی
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>دانلود کاربرگ‌های آموزشی</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  href="/books"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        معرفی کتاب‌های آموزشی
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        بررسی و معرفی برترین کتاب‌های کمک‌آموزشی پایه اول تا ششم
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>مشاهده قفسه کتاب‌ها</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>

            {/* SUITE 2: SHOP, ORDERS & DOWNLOADS */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-teal-deep">
                <ShoppingBag className="w-4 h-4 text-teal" />
                <span>بخش دوم: فروشگاه، محصولات فیزیکی، دانلودی و سبد خرید</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/shop"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-teal/15 text-teal border border-teal/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        فروشگاه کتاب و محصولات
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        خرید کتاب‌های فیزیکی، بسته‌های آموزشی و فایل‌های دانلودی
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>ورود به فروشگاه</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group text-right"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        سفارشات من و دانلود فایل‌ها
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        پیگیری خریدهای ثبت‌شده، وضعیت پرداخت و لینک مستقیم فایل‌های خریداری‌شده
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>مشاهده {orders.length} سفارش من</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </button>

                <Link
                  href="/shop/checkout"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-rose-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        سبد خرید و تسویه حساب
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        مشاهده اقلام موجود در سبد و تکمیل سفارش به روش آنلاین یا کارت به کارت
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>مشاهده سبد خرید</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>

            {/* SUITE 3: ENTERTAINMENT, ANIMATION & GALLERY */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-teal-deep">
                <Clapperboard className="w-4 h-4 text-teal" />
                <span>بخش سوم: سرگرمی، انیمه، فیلم‌ها و آلبوم تصاویر</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/entertainment"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Clapperboard className="w-6 h-6 text-rose-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        کتابخانه انیمه، فیلم و کارتون
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        دسترسی به صدها کارتون، سریال‌های جذاب و فیلم‌های آموزنده با دوبله و زیرنویس
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>ورود به سالن پخش آنلاین</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  href="/gallery"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-900 border border-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        گالری تصاویر و رویدادها
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        آلبوم خاطرات، تصاویر جشن‌ها، تقدیر از دانش‌آموزان و همایش‌های فرهنگی
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>مشاهده آلبوم تصاویر</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>

            {/* SUITE 4: NEWS, ARTICLES & SUPPORT */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-teal-deep">
                <Newspaper className="w-4 h-4 text-teal" />
                <span>بخش چهارم: اطلاع‌رسانی، وبلاگ آموزشی، پشتیبانی و درباره ما</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/news"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-900 border border-sky-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Newspaper className="w-6 h-6 text-sky-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        اخبار و اطلاعیه‌ها
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        تازه‌ترین اخبار مدارس، برنامه‌های امتحانات و اطلاعیه‌های رسمی
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>مشاهده اخبار</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  href="/blog"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        مقالات و وبلاگ آموزشی
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        نکات تربیتی، مشاوره‌های یادگیری برای والدین و معلمان
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>مطالعه مقالات</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveTab('support')}
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group text-right"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 border border-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        پشتیبانی و ثبت تیکت
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        ارسال پیام مستقیم به کارشناسان فنی، مالی و آموزشی سایت
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>ثبت تیکت و گفتگو</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </button>

                <Link
                  href="/about"
                  className="card p-5 rounded-2xl border-2 border-slate-300 bg-white hover:border-teal hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Info className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 group-hover:text-teal mb-1">
                        درباره یار اولی‌ها
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        آشنایی با تاریخچه، رسالت آموزشی و راه‌های ارتباط با مدیریت
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-black text-teal">
                    <span>صفحه معرفی ما</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: MY ORDERS & DOWNLOADS */}
      {activeTab === 'orders' && (
        <div className="animate-in fade-in duration-200">
          <UserOrdersSection initialOrders={orders} adminCard={adminCard} />
        </div>
      )}

      {/* TAB 3: MY TUTORING & CLASSES */}
      {activeTab === 'tutoring' && (
        <div className="animate-in fade-in duration-200">
          <UserTutoringRequestsSection requests={tutoringRequests} />
        </div>
      )}

      {/* TAB 4: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="animate-in fade-in duration-200">
          <UserSupportTicketsSection />
        </div>
      )}

      {/* TAB 5: SECURITY & ACCOUNT SETTINGS */}
      {activeTab === 'security' && (
        <div className="animate-in fade-in duration-200 flex flex-col gap-6">
          <div className="card p-6 sm:p-8 rounded-3xl border-2 border-slate-300 bg-white shadow-xs">
            <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2 border-b-2 border-slate-200 pb-4">
              <KeyRound className="w-5 h-5 text-teal" />
              <span>تغییر کلمه عبور و امنیت حساب</span>
            </h3>
            <AccountControls />
          </div>
        </div>
      )}
    </div>
  )
}
