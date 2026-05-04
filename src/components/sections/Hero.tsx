import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import heroImage from "@/assets/hero-perfume.jpg";

const Hero = () => (
  <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16">
    <div className="absolute inset-0 bg-radial-pink pointer-events-none" />
    <div className="container relative grid gap-12 lg:grid-cols-2 lg:items-center">
      <div className="animate-fade-up">
        <span className="inline-block rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
          Lekki, Lagos
        </span>
        <h1 className="mt-6 font-serif text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
          Luxury Perfumes <br />
          <span className="relative text-gradient-pink italic">
            You Can Trust
            <span className="absolute -bottom-4 left-1/2 h-0.5 w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 after:absolute after:inset-0 after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent" />
          </span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted-foreground">
          Boxed, unboxed, thrifted, and tester perfumes available. Authentic fragrances, delivered across Nigeria and Worldwide.
        </p>
        <p className="mt-4 font-serif italic text-primary/80 animate-fade-in [animation-delay:400ms] text-sm md:text-base">
          "The right scent doesn't just smell good — it tells your story before you say a word."
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild size="lg" variant="whatsapp" className="text-base">
            <a href={waLink("Hi Perfumes By Luch! I'd like to by perfume.")} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="h-5 w-5" />
              Shop on WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base">
            <Link to="/collections">Browse Collection</Link>
          </Button>
        </div>
        <p className="mt-4 text-[10px] text-muted-foreground/60 text-center md:text-left">
          Join 500+ customers who found their signature scent with us.
        </p>
        <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
          <div>
            <p className="font-serif text-2xl text-foreground">100%</p>
            <p>Authentic</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="font-serif text-2xl text-foreground">1–2</p>
            <p>Days Lagos</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="font-serif text-2xl text-foreground">500+</p>
            <p>Happy clients</p>
          </div>
        </div>
        
        {/* Trust Bar */}
        <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 animate-fade-in [animation-delay:600ms]">
          <span>✦ Boxed & Unboxed Originals</span>
          <span className="text-primary/40">•</span>
          <span>✦ Discreet Packaging</span>
          <span className="text-primary/40">•</span>
          <span>✦ International Shipping Available</span>
          <span className="text-primary/40">•</span>
          <span>✦ Secure Payment</span>
        </div>
      </div>

      <div className="relative animate-fade-up [animation-delay:200ms]">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-3xl" />
        <img
          src={heroImage}
          alt="Luxury perfume bottle by Perfumes By Luch"
          width={1280}
          height={1280}
          className="mx-auto w-full max-w-md rounded-2xl object-cover shadow-pink animate-float"
        />
      </div>
    </div>
  </section>
);

export default Hero;
