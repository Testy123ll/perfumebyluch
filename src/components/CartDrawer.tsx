import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, Copy, Check, ExternalLink } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { buildOrderMessage, formatPrice, waLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { toast } from "@/hooks/use-toast";

const MAX_QTY = 10;

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, subtotal, totalQuantity } = useCart();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Inline clear confirmation state: null | "pending"
  const [clearState, setClearState] = useState<"idle" | "pending">("idle");

  const orderMessage = buildOrderMessage(items);
  const orderLink = waLink(orderMessage);

  const handleSend = () => {
    if (items.length === 0) return;
    setConfirmOpen(true);
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage);
      setCopied(true);
      toast({ title: "Order copied", description: "Order summary copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  // Snapshot the link BEFORE clearing the cart, then open WhatsApp programmatically.
  // If we clear first, React re-renders and orderLink becomes the empty fallback.
  const finishAndClose = () => {
    const link = orderLink; // capture current value
    clearCart();
    setConfirmOpen(false);
    closeCart();
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const finishAndClear = () => {
    clearCart();
    setConfirmOpen(false);
    closeCart();
  };

  const handleClearClick = () => {
    if (clearState === "idle") {
      setClearState("pending");
    } else {
      clearCart();
      setClearState("idle");
    }
  };

  const handleClearCancel = () => setClearState("idle");

  return (
    <>
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
                    <li key={item.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                      {/* Product thumbnail */}
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-serif text-lg leading-tight truncate">{item.name}</h3>
                            <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                              {item.category}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="shrink-0 text-muted-foreground transition-smooth hover:text-destructive"
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
                              disabled={item.quantity >= MAX_QTY}
                              className="flex h-8 w-8 items-center justify-center rounded-full transition-smooth hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
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

                {/* Inline clear cart confirmation */}
                <div className="mt-6 flex items-center gap-3">
                  {clearState === "idle" ? (
                    <button
                      onClick={handleClearClick}
                      className="text-xs uppercase tracking-wider text-muted-foreground transition-smooth hover:text-foreground"
                    >
                      Clear cart
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleClearClick}
                        className="text-xs uppercase tracking-wider text-destructive transition-smooth hover:text-destructive/80"
                      >
                        Are you sure? Tap to confirm
                      </button>
                      <button
                        onClick={handleClearCancel}
                        className="text-xs text-muted-foreground underline transition-smooth hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-border bg-card/50 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-serif text-2xl text-primary">{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Delivery confirmed on WhatsApp.</p>
                <Button onClick={handleSend} variant="whatsapp" size="lg" className="mt-4 w-full">
                  <WhatsAppIcon className="h-5 w-5" />
                  Send Order on WhatsApp
                </Button>
                <Button variant="ghost" className="mt-2 w-full" onClick={closeCart}>
                  Keep Shopping
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center font-serif text-2xl">Confirm Your Order</DialogTitle>
            <DialogDescription className="text-center">
              Review your order below, then tap to send it directly to us on WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 rounded-xl border border-border bg-card/50 p-4">
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-serif text-base">{item.name}</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {item.category} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 font-serif text-base text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">
                {totalQuantity} item{totalQuantity === 1 ? "" : "s"}
              </span>
              <span className="font-serif text-xl text-primary">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border bg-background p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Message preview</p>
            <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words font-sans text-xs text-foreground">
              {orderMessage}
            </pre>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Sending to{" "}
            <span className="font-medium text-foreground">
              +{WHATSAPP_NUMBER.slice(0, 3)} {WHATSAPP_NUMBER.slice(3, 6)} {WHATSAPP_NUMBER.slice(6, 9)} {WHATSAPP_NUMBER.slice(9)}
            </span>
          </p>

          <div className="flex flex-col gap-2">
            <Button variant="whatsapp" size="lg" onClick={finishAndClose}>
              <WhatsAppIcon className="h-5 w-5" />
              Open WhatsApp to Send
              <ExternalLink className="h-4 w-4" />
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={copyMessage}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" onClick={finishAndClear}>
                Clear & Close
              </Button>
            </div>
            <button
              onClick={() => setConfirmOpen(false)}
              className="mt-1 text-xs text-muted-foreground transition-smooth hover:text-foreground"
            >
              ← Back to cart
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CartDrawer;
