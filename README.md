# یار اولی‌ها - Yar Avali-ha Platform

پلتفرم آموزشی و سرگرمی فارسی برای کودکان پیش‌دبستانی و دبستان

## ویژگی‌ها

### محتوای آموزشی
- محتوای درسی برای کلاس‌های اول، دوم و سوم
- ویدیوهای آموزشی
- کاربرگ‌ها و فایل‌های تمرینی
- مطالب روان‌خوانی

### سرگرمی
- کتابخانه سریال‌های انیمه (با قسمت‌های مختلف)
- فیلم‌های کودکانه
- دسته‌بندی بر اساس سن و ژانر

### سیستم اشتراک
- لینک‌های اشتراک قابل تنظیم (تاریخ انقضا و حداکثر استفاده)
- اشتراک ۶ ماهه با دسترسی کامل
- محتوای رایگان برای کاربران بدون اشتراک

### فروشگاه
- لوازم‌التحریر
- محصولات دیجیتال (قالب‌های پاورپوینت، PDF)
- فروشگاه PDF جداگانه با قابلیت دانلود

### پنل مدیریت
- آپلود و مدیریت محتوا
- ایجاد و مدیریت لینک‌های اشتراک
- مدیریت کاربران
- آمار و گزارش‌گیری

### امکانات ویدیو
- پخش ویدیو از Pixeldrain
- توکن امنیتی موقت برای دسترسی
- واترمارک با نام و شماره کاربر
- ذخیره پیشرفت تماشا
- ادامه از جایی که متوقف شده

## تکنولوژی

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon PostgreSQL (Serverless)
- **Video Hosting**: Pixeldrain
- **Storage**: AWS S3 (یا سرویس مشابه)

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+ 
- حساب Neon PostgreSQL
- (اختیاری) حساب Pixeldrain Pro برای ویدیو
- (اختیاری) AWS S3 یا سرویس ذخیره‌سازی مشابه

### مراحل نصب

1. **نصب پکیج‌ها:**

```bash
npm install
```

2. **تنظیم متغیرهای محیطی:**

فایل `.env.local` بسازید:

```bash
cp .env.example .env.local
```

ویرایش `.env.local` و مقادیر زیر را وارد کنید:

```env
# اتصال به دیتابیس Neon
DATABASE_URL=postgresql://user:password@host/database

# Pixeldrain API Key (اختیاری - برای آپلود مستقیم)
PIXELDRAIN_API_KEY=your_api_key

# AWS S3 (اختیاری - برای ذخیره فایل‌ها)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=bucket_name

# SMTP برای ایمیل (اختیاری)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@yaravaliha.com

# کلید امنیتی (حتماً تغییر دهید)
SESSION_SECRET=your-random-secret-key-min-32-chars

# آدرس سایت
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **ایجاد جداول دیتابیس:**

```bash
npm run db:setup
```

4. **ساخت اکانت ادمین اولیه:**

در دیتابیس، یک یوزر ایجاد کنید و role را به 'admin' تغییر دهید:

```sql
-- ثبت‌نام معمولی در سایت انجام دهید، سپس:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

5. **اجرای پروژه:**

```bash
npm run dev
```

سایت در `http://localhost:3000` در دسترس خواهد بود.

## راهنمای استفاده

### برای کاربران

1. ثبت‌نام / ورود
2. مشاهده محتوای رایگان
3. خرید اشتراک با کد دریافتی
4. دسترسی به تمام محتوا

### برای مدیر

1. ورود با اکانت ادمین
2. رفتن به `/admin`
3. آپلود محتوا (ویدیو، کاربرگ، etc.)
4. ساخت لینک اشتراک
5. مدیریت کاربران و محتوا

## ساختار فایل‌ها

```
yar-avali-ha/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # صفحات احراز هویت
│   ├── admin/                    # پنل مدیریت
│   ├── api/                      # API Routes
│   ├── curriculum/               # محتوای درسی
│   ├── entertainment/            # سرگرمی
│   ├── dashboard/                # داشبورد کاربر
│   ├── watch/[id]/               # پخش ویدیو
│   └── subscription/             # خرید اشتراک
├── components/                   # کامپوننت‌های React
│   └── VideoPlayer.tsx           # پلیر ویدیو با محافظت
├── lib/                          # توابع و utilities
│   ├── db.ts                     # اتصال دیتابیس
│   ├── auth.ts                   # احراز هویت
│   ├── subscriptions.ts          # مدیریت اشتراک
│   └── video.ts                  # مدیریت ویدیو
└── scripts/                      # اسکریپت‌های setup
    └── setup-db.js               # ایجاد جداول
```

## ویژگی‌های امنیتی

### محافظت از محتوا
- توکن‌های موقت برای دسترسی به ویدیو (۱ ساعت اعتبار)
- غیرفعال کردن راست‌کلیک و keyboard shortcuts
- واترمارک روی ویدیو با اطلاعات کاربر
- بررسی اشتراک قبل از نمایش محتوا

### احراز هویت
- هش کردن رمز عبور با scrypt
- توکن‌های session امن (HttpOnly cookies)
- بررسی نقش کاربر (user/admin)
- Session timeout بعد از ۲۴ ساعت

### API
- Middleware برای بررسی احراز هویت
- بررسی نقش برای endpointهای ادمین
- Parameterized queries برای جلوگیری از SQL injection

## یادداشت‌های مهم

### Pixeldrain
- برای استفاده در production، حساب Pro با hotlinking enabled نیاز است
- برای آپلود مستقیم از پنل ادمین، API key لازم است
- می‌توان ویدیوها را manual آپلود کرد و لینک را paste کرد

### محدودیت‌های محافظت از محتوا
- راه‌حل‌های پیاده‌سازی شده **بازدارنده** هستند نه DRM واقعی
- کاربران همچنان می‌توانند از screen recording استفاده کنند
- این موضوع در UI به صراحت ذکر شده است

### RTL و فارسی
- تمام UI به صورت راست به چپ است
- فونت IRANSans برای خوانایی بهتر
- پشتیبانی کامل از زبان فارسی

## Deployment

### Vercel (توصیه می‌شود)

1. پوش کردن پروژه به GitHub
2. اتصال به Vercel
3. تنظیم environment variables
4. Deploy اتوماتیک

### سایر پلتفرم‌ها

هر پلتفرمی که از Next.js 14+ پشتیبانی کند قابل استفاده است.

## لایسنس

این پروژه برای استفاده خصوصی "یار اولی‌ها" طراحی شده است.

## پشتیبانی

برای سوالات و مشکلات، با تیم توسعه تماس بگیرید.
