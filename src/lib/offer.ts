import { Product } from "@/lib/supabase";

export interface GlobalPromoData {
  isGlobalPromoActive: boolean;
  globalLabel: string;
  globalPromoEnd: string;
}

export interface ActiveOffer {
  isOnSale: boolean;
  price: number;
  promoLabel: string;
  offerEnd: string | null;
}

export const getActiveOffer = (
  product: Product,
  globalPromo?: GlobalPromoData
): ActiveOffer => {
  const now = new Date();

  // Whether the product has a valid offer price set (must be > 0)
  const hasOfferPrice =
    product.sale_price !== undefined &&
    product.sale_price !== null &&
    product.sale_price > 0;

  // 1. Individual promo is active only when ALL of these are true:
  //    - sale_price is not null and greater than 0
  //    - sale_end_date is not null (required — open-ended sales are not shown)
  //    - current time is before sale_end_date
  const ownPromoValid =
    hasOfferPrice &&
    product.sale_end_date !== undefined &&
    product.sale_end_date !== null &&
    new Date(product.sale_end_date) > now;

  if (ownPromoValid) {
    return {
      isOnSale: true,
      price: product.sale_price!,
      promoLabel: "SALE",
      offerEnd: product.sale_end_date || null,
    };
  }

  // 2. No active individual promo, BUT global promo is active AND product has an offer price set
  //    Products without an offer_price are never affected by global promo
  if (globalPromo?.isGlobalPromoActive && hasOfferPrice) {
    return {
      isOnSale: true,
      price: product.sale_price!,
      promoLabel: globalPromo.globalLabel || "SALE",
      offerEnd: globalPromo.globalPromoEnd || null,
    };
  }

  // 3. No active promo of any kind — return normal price
  return {
    isOnSale: false,
    price: product.price,
    promoLabel: "",
    offerEnd: null,
  };
};
