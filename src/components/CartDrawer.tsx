import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { buildOrderMessage, formatPrice, waLink } from "@/lib/whatsapp";

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, subtotal, totalQuantity } = useCart();

  const orderMessage = buildOrderMessage(items);
  const orderLink = waLink(orderMessage);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? null : closeCart())}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="font-serif text-2xl">
            Your Cart {totalQuantity > 0 && <span className="text-primary">({totalQuantity})</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-serif text-xl">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Add some scents to get started.</p>
            </div>
            <Button variant="outline" onClick={closeCart}>
              Continue Browsing
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-lg leading-tight">{item.name}</h3>
                          <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                            {item.category}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="text-muted-foreground transition-smooth hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-full transition-smooth hover:bg-secondary"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-full transition-smooth hover:bg-secondary"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-serif text-lg text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={clearCart}
                className="mt-6 text-xs uppercase tracking-wider text-muted-foreground transition-smooth hover:text-foreground"
              >
                Clear cart
              </button>
            </div>

            <div className="border-t border-border bg-card/50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-serif text-2xl text-primary">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Delivery confirmed on WhatsApp.
              </p>
              <Button asChild variant="whatsapp" size="lg" className="mt-4 w-full">
                <a href={orderLink} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="h-5 w-5" />
                  Send Order on WhatsApp
                </a>
              </Button>
              <Button variant="ghost" className="mt-2 w-full" onClick={closeCart}>
                Keep Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
