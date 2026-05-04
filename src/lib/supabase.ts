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

console.log("Supabase Client Init:", { supabaseUrl, supabaseAnonKey });

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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
  created_at: string;
};

export const getOptimisedImageUrl = (url: string, width = 400, quality = 75) => {
  if (!url) return '';
  if (url.includes('supabase')) {
    return `${url}?width=${width}&quality=${quality}&format=webp`;
  }
  return url;
};
