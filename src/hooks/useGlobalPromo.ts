import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface GlobalPromoData {
  isGlobalPromoActive: boolean;
  globalLabel: string;
  globalPromoEnd: string;
  loading: boolean;
}

export const useGlobalPromo = (): GlobalPromoData => {
  const [promo, setPromo] = useState<{
    enabled: boolean;
    label: string;
    offer_start: string | null;
    offer_end: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPromo = async () => {
    try {
      const { data, error } = await supabase
        .from("global_promo")
        .select("enabled, label, offer_start, offer_end")
        .maybeSingle();

      if (!error && data) {
        setPromo(data);
      } else if (!data) {
        setPromo(null);
      }
    } catch (err) {
      console.error("Error fetching global promo in hook:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromo();

    const interval = setInterval(() => {
      fetchPromo();
    }, 60000); // re-fetch every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const isGlobalPromoActive = promo
    ? promo.enabled &&
      (!promo.offer_start || new Date(promo.offer_start) <= now) &&
      (!promo.offer_end || new Date(promo.offer_end) >= now)
    : false;

  return {
    isGlobalPromoActive,
    globalLabel: promo ? promo.label || "" : "",
    globalPromoEnd: promo ? promo.offer_end || "" : "",
    loading,
  };
};
