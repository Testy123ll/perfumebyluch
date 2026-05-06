# Supabase Setup Guide 🛠️

Follow these steps to set up the Supabase backend for **Perfumes By Luch**.

## 1. Create Tables

Run the following SQL in the Supabase SQL Editor:

```sql
-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'restricted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  visible BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  size TEXT,
  scent_mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Reviews Table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified BOOLEAN DEFAULT false,
  visible BOOLEAN DEFAULT true,
  is_testimonial BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Admin Invites Table
CREATE TABLE public.admin_invites (
  email TEXT PRIMARY KEY,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Activity Log Table
CREATE TABLE public.activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  admin_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## 2. Configure Storage

1. Go to **Storage** in the Supabase Dashboard.
2. Create a new bucket named `products`.
3. Set the bucket to **Public**.
4. Create a folder named `product-images` inside the bucket.

## 3. Row Level Security (RLS)

Enable RLS on all tables and apply these policies:

### Products
- **Select**: Allow public access (`true`).
- **Insert/Update/Delete**: Authenticated users with role `admin` or `owner`.

### Reviews
- **Select**: Allow public access where `visible = true`.
- **Insert**: Allow public access.
- **Update/Delete**: Authenticated users with role `admin` or `owner`.

### Profiles
- **Select**: Authenticated users can see all profiles.
- **Update/Delete**: Only the `owner` can modify roles or delete profiles.

## 4. Environment Variables

Add these to your `.env` and Vercel dashboard:
- `VITE_SUPABASE_URL`: Your Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Project Anon Key.
