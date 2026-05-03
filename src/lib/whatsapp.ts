// Update this number to your real WhatsApp business number (international format, no +)
// Note: wa.me/message/XXXX short-links do NOT support a prefilled text. Use a phone number.
export const WHATSAPP_NUMBER = "2347052537265";

export const waLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export type CartItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
  image_url?: string;
};

export const formatPrice = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export const buildOrderMessage = (items: CartItem[]): string => {
  if (items.length === 0) return "Hi Perfumes By Luch! I'd like to place an order.";

  const lines: string[] = [];
  lines.push("Hi Perfumes By Luch! 🌸");
  lines.push("I'd like to buy the following items:");
  lines.push("");

  items.forEach((item, i) => {
    lines.push(
      `${i + 1}. ${item.name} (${item.category}) — ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`,
    );
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  lines.push("");
  lines.push(`Items: ${totalQty}`);
  lines.push(`Total: ${formatPrice(subtotal)}`);
  lines.push("");
  lines.push("Please confirm availability.");

  return lines.join("\n");
};
