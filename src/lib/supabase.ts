import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const IS_SUPABASE_CONFIGURED =
  !!import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes("PLACEHOLDER") &&
  !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes("PLACEHOLDER");

const isConfigured = IS_SUPABASE_CONFIGURED && supabaseUrl.startsWith("https://");

// Only create the real client when credentials are valid.
// When not configured, export a safe no-op mock so the app still renders.
export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new Proxy({}, {
      get: (_t, prop) => {
        if (prop === "from") return () => ({
          select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }), order: () => Promise.resolve({ data: [], error: null }) }),
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
          delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        });
        if (prop === "auth") return {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          signOut: () => Promise.resolve({}),
        };
        if (prop === "storage") return {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
            getPublicUrl: () => ({ data: { publicUrl: "" } }),
          }),
        };
        return () => Promise.resolve({ data: null, error: null });
      },
    }) as unknown as SupabaseClient);

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
  created_at: string;
};
