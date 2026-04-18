import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/whatsapp";

const Nav = () => (
  <header className="fixed inset-x-0 top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
    <div className="container flex h-16 items-center justify-between">
      <a href="#" className="font-serif text-xl md:text-2xl">
        Perfumes <span className="text-gradient-pink italic">By Luch</span>
      </a>
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        <a href="#products" className="transition-smooth hover:text-primary">Shop</a>
        <a href="#about" className="transition-smooth hover:text-primary">About</a>
        <a href="#faq" className="transition-smooth hover:text-primary">FAQ</a>
      </nav>
      <Button asChild variant="whatsapp" size="sm">
        <a href={waLink("Hi Perfumes By Luch!")} target="_blank" rel="noopener noreferrer">
          Order Now
        </a>
      </Button>
    </div>
  </header>
);

export default Nav;
