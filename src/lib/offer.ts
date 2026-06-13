import { Product } from "@/lib/supabase";

export interface GlobalPromoData {
  isGlobalPromoActive: boolean;
  globalDiscount: number;
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
  globalPromo?: {
    isGlobalPromoActive: boolean;
    globalDiscount: number;
    globalLabel: string;
    globalPromoEnd: string;
  }
): ActiveOffer => {
  // 1. If the product has its own valid offer price with a valid date range that has not expired
  const hasOwnPromo =
    product.sale_price !== undefined &&
    product.sale_price !== null &&
    (product.sale_end_date === undefined ||
      product.sale_end_date === null ||
      new Date(product.sale_end_date) > new Date());

  if (hasOwnPromo) {
    return {
      isOnSale: true,
      price: product.sale_price!,
      promoLabel: "SALE",
      offerEnd: product.sale_end_date || null,
    };
  }

  // 2. If the product has no active individual promo BUT global promo is active
  if (globalPromo && globalPromo.isGlobalPromoActive) {
    const discountedPrice = product.price - (product.price * globalPromo.globalDiscount) / 100;
    return {
      isOnSale: true,
      price: Math.round(discountedPrice),
      promoLabel: globalPromo.globalLabel || "SALE",
      offerEnd: globalPromo.globalPromoEnd || null,
    };
  }

  // 3. If neither
  return {
    isOnSale: false,
    price: product.price,
    promoLabel: "",
    offerEnd: null,
  };
};
