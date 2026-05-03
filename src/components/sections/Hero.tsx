import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import heroImage from "@/assets/hero-perfume.jpg";

const Hero = () => (
  <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
    <div className="absolute inset-0 bg-radial-pink pointer-events-none" />
    <div className="container relative grid gap-12 lg:grid-cols-2 lg:items-center">
      <div className="animate-fade-up">
        <span className="inline-block rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
          Lekki, Lagos
        </span>
        <h1 className="mt-6 font-serif text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
          Luxury Perfumes <br />
          <span className="text-gradient-pink italic">You Can Trust</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted-foreground">
          Boxed, unboxed, thrifted, and tester perfumes available. Authentic fragrances, delivered across Nigeria, Ghana and Cameroon.
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
