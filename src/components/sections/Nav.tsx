import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/whatsapp";
import CartButton from "@/components/CartButton";
import logo from "@/assets/logo.webp";

const Nav = () => (
  <header className="fixed inset-x-0 top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
    <div className="container flex h-16 items-center justify-between">
      <a href="#" className="flex items-center gap-2" aria-label="Perfumes By Luch home">
        <img src={logo} alt="Perfumes By Luch logo" className="h-10 w-auto md:h-12" width={120} height={48} />
        <span className="sr-only">Perfumes By Luch</span>
      </a>
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        <a href="#products" className="transition-smooth hover:text-primary">Shop</a>
        <a href="#about" className="transition-smooth hover:text-primary">About</a>
        <a href="#faq" className="transition-smooth hover:text-primary">FAQ</a>
      </nav>
      <div className="flex items-center gap-2">
        <CartButton />
        <Button asChild variant="whatsapp" size="sm" className="hidden sm:inline-flex">
          <a href={waLink("Hi Perfumes By Luch!")} target="_blank" rel="noopener noreferrer">
            Order Now
          </a>
        </Button>
      </div>
    </div>
  </header>
);

export default Nav;
