import { waLink, trackWhatsAppConversion } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { Instagram, MapPin, Clock, Mail, Phone } from "lucide-react";
import logo from "@/assets/logo.webp";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.55a8.16 8.16 0 0 0 4.77 1.52V6.69h-1.84z" />
  </svg>
);

const Footer = () => (
  <footer id="contact" className="border-t border-border py-14">
    <div className="container">
      <div className="grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <img src={logo} alt="Perfumes By Luch" className="h-20 w-auto" width={200} height={80} />
          <p className="mt-4 text-sm italic text-muted-foreground">
            Smell so good without breaking the bank.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-primary">Visit Us</h3>
          <p className="mt-4 flex items-start gap-2 text-sm text-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              13B Charles Ifeanyi Street,<br />
              Off Fola Osibo Street,<br />
              Lekki Phase 1, Lagos
              <a 
                href="https://www.google.com/maps/search/?api=1&query=13B+Charles+Ifeanyi+Street+Lekki+Phase+1+Lagos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 block text-[10px] text-primary hover:underline"
              >
                View on Google Maps →
              </a>
            </span>
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-primary">Opening Hours</h3>
          <p className="mt-4 flex items-start gap-2 text-sm text-foreground">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Mon to Sat<br />
              10:00 AM to 4:30 PM<br />
              <span className="text-muted-foreground">Closed Sundays</span>
            </span>
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-primary">Connect</h3>
          <p className="mt-4 flex items-center gap-2 text-sm text-foreground">
            <Mail className="h-4 w-4 shrink-0 text-primary" />
            <a href="mailto:luchperfumes@yahoo.com" className="transition-smooth hover:text-primary">
              luchperfumes@yahoo.com
            </a>
          </p>
          <p className="mt-2 mb-4 flex items-center gap-2 text-sm text-foreground">
            <Phone className="h-4 w-4 shrink-0 text-primary" />
            <a href="tel:+2347052537265" className="transition-smooth hover:text-primary">
              +234 705 253 7265
            </a>
          </p>
          <div className="flex gap-3">
            <a
              href={waLink("Hi Perfumes By Luch!")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              onClick={trackWhatsAppConversion}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com/perfumesbyluch"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @perfumesbyluch"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://tiktok.com/@perfumesbyluch"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok @perfumesbyluch"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-border pt-8 text-center">
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-8">
          <p className="font-serif italic text-muted-foreground text-sm">
            "Thank you for trusting us with your scent story. 🌸"
          </p>
          <a
            href={waLink("Hi Perfumes By Luch! I'd like to place an order.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackWhatsAppConversion}
            className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-whatsapp-foreground transition-smooth hover:scale-105"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Order on WhatsApp
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} Perfumes By Luch. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
