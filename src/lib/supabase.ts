import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const IS_SUPABASE_CONFIGURED =
  !!import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL.startsWith("https://") &&
  !import.meta.env.VITE_SUPABASE_URL.includes("PLACEHOLDER") &&
  !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes("PLACEHOLDER");

const isConfigured = IS_SUPABASE_CONFIGURED;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetch.bind(globalThis),
  },
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Override storage upload to always use standard upload by ensuring TUS isn't triggered
const originalFrom = supabase.storage.from.bind(supabase.storage);
supabase.storage.from = (bucketId: string) => {
  const bucket = originalFrom(bucketId);
  const originalUpload = bucket.upload.bind(bucket);
  bucket.upload = (path: string, file: any, options?: any) => {
    return originalUpload(path, file, {
      ...options,
      uploadSignedUrl: undefined,
    });
  };
  return bucket;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url: string;
  in_stock: boolean;
  visible: boolean;
  is_new: boolean;
  video_url?: string;
  size?: string;
  is_bestseller?: boolean;
  scent_mood?: string;
  created_at: string;
};

export const getOptimisedImageUrl = (url: string, width = 280, quality = 40) => {
  if (!url) return '';
  if (url.includes('supabase.co')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?width=${width}&quality=${quality}&format=webp`;
  }
  if (url.includes('cloudinary.com')) {
    const isVideo = url.includes('/video/upload/');
    const optimizationParams = isVideo 
      ? `f_auto,q_auto,w_${width},br_1.5m` 
      : `f_auto,q_auto,w_${width}`;
    return url.replace('/upload/', `/upload/${optimizationParams}/`);
  }
  return url;
};
