// Update this number to your real WhatsApp business number (international format, no +)
export const WHATSAPP_NUMBER = "2348000000000";

export const waLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
