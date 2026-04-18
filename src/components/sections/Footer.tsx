import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { Instagram, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-12">
    <div className="container">
      <div className="grid gap-8 md:grid-cols-3 md:items-center">
        <div>
          <p className="font-serif text-2xl">Perfumes <span className="text-gradient-pink italic">By Luch</span></p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Lekki, Lagos
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <a href="#products" className="transition-smooth hover:text-primary">Shop</a>
          <a href="#about" className="transition-smooth hover:text-primary">About</a>
          <a href="#faq" className="transition-smooth hover:text-primary">FAQ</a>
        </nav>

        <div className="flex justify-start gap-3 md:justify-end">
          <a
            href={waLink("Hi Perfumes By Luch!")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
          <a
            href="https://instagram.com/perfumesbyluch"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
          >
            <Instagram className="h-5 w-5" />
          </a>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Perfumes By Luch. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
