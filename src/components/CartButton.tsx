import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CartButton = () => {
  const { totalQuantity, openCart } = useCart();
  return (
    <button
      onClick={openCart}
      aria-label={`Open cart (${totalQuantity} items)`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-smooth hover:border-primary/50 hover:text-primary"
    >
      <ShoppingBag className="h-4 w-4" />
      {totalQuantity > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {totalQuantity}
        </span>
      )}
    </button>
  );
};

export default CartButton;
