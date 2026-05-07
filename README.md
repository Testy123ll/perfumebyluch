# Perfumes By Luch 🌸

A full-stack luxury perfume e-commerce website built for Perfumes By Luch, Lagos Nigeria. Customers browse products and order via WhatsApp. Admins manage products, reviews, team members and activity logs.

## 🌐 Live Site
[perfumebyluch.com](https://perfumebyluch.com)

## ✨ Features

### Customer Facing
- Browse perfume catalog (Boxed, Unboxed, Thrifted, Tester)
- View product images and videos
- Filter by category and scent mood
- Read verified customer reviews and testimonials
- Order directly via WhatsApp
- Fully responsive on all devices

### Admin Dashboard (/admin)
- Secure authentication with role-based access (Owner / Admin)
- Add, edit, delete products with image and video upload
- Toggle product visibility, stock status, new arrival, bestseller
- Manage customer reviews — verify, feature as testimonial, hide
- Invite and manage admin team members
- Full activity log with filtering

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Video Upload | Cloudinary |
| Hosting | Vercel |
| Video Storage | Cloudinary CDN |
| Image Storage | Supabase Storage |

## 📁 Project Structure
src/
├── components/       # Reusable UI components
├── pages/
│   ├── Index.tsx     # Public homepage
│   ├── Admin.tsx     # Admin dashboard
│   └── AdminLogin.tsx
├── lib/
│   └── supabase.ts   # Supabase client and types
└── main.tsx
public/
├── sitemap.xml
└── robots.txt

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🗄 Database Tables

| Table | Purpose |
|-------|---------|
| products | Perfume catalog |
| reviews | Customer reviews |
| profiles | Admin user profiles |
| admin_invites | Pending admin invitations |
| activity_log | Admin action audit trail |

## 📦 Deployment
Deployed automatically via Vercel on every push to main branch.

## 📄 License
Private — All rights reserved. Perfumes By Luch © 2026
