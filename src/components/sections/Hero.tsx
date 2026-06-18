import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { waLink, trackWhatsAppConversion } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import heroImage from "@/assets/hero-perfume.jpg";

const heroImages = [
  "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=60&fm=webp",
  "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=60&fm=webp",
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=60&fm=webp",
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=60&fm=webp",
  "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=60&fm=webp",
];

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden pt-28 pb-12 md:pt-36 md:pb-16 min-h-[90vh] flex items-center">
      <div className="absolute inset-0 z-0 overflow-hidden">
        {heroImages.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === currentImage ? 1 : 0 }}
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              aria-hidden="true"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/60" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="absolute inset-0 bg-radial-pink pointer-events-none opacity-20" />

      <div className="container relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="animate-fade-up relative">
          <div className="absolute inset-0 -z-10 rounded-2xl bg-background/40 backdrop-blur-sm -mx-4 -my-6 px-4 py-6 md:bg-background/30" />
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
            We sell Boxed, Unboxed, Thrifted Open Box and Tester perfumes. Authentic fragrances delivered across Nigeria, Ghana and Cameroon.
          </p>
          <p className="mt-4 font-serif italic text-primary/80 animate-fade-in [animation-delay:400ms] text-sm md:text-base">
            "The right scent doesn't just smell good, it tells your story before you say a word."
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" variant="whatsapp" className="text-base">
              <a href={waLink("Hi Perfumes By Luch! I'd like to buy perfume.")} target="_blank" rel="noopener noreferrer" onClick={trackWhatsAppConversion}>
                <WhatsAppIcon className="h-5 w-5" />
                Shop on WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base bg-background/20 backdrop-blur-sm">
              <a href="#products">Browse Collection</a>
            </Button>
          </div>
          <p className="mt-4 text-[10px] text-muted-foreground/60 text-center md:text-left">
            Join 500+ customers who found their signature scent with us.
          </p>

          <div className="mt-6 flex items-center justify-center md:justify-start gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImage
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-primary/30 hover:bg-primary/60"
                  }`}
              />
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-6 text-sm text-muted-foreground">
            <div>
              <p className="font-serif text-2xl text-foreground">100%</p>
              <p>Authentic</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div>
              <p className="font-serif text-2xl text-foreground">1 to 2</p>
              <p>Days Lagos</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div>
              <p className="font-serif text-2xl text-foreground">2 to 7</p>
              <p>Days Outside Lagos</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div>
              <p className="font-serif text-2xl text-foreground">5 to 14</p>
              <p>Days Ghana & Cameroon</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div>
              <p className="font-serif text-2xl text-foreground">500+</p>
              <p>Happy clients</p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 animate-fade-in [animation-delay:600ms]">
            <span>✦ Original Boxed & Unboxed Luxury Perfumes</span>
            <span>✦ Free gift when you order ₦200,000 & above</span>
            <span>✦ International Shipping Available</span>
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:200ms] z-10">
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-3xl" />
          <img
            src={heroImage}
            alt="Luxury perfume bottle by Perfumes By Luch"
            width={800}
            height={800}
            loading="eager"
            fetchPriority="high"
            className="mx-auto w-full max-w-md rounded-2xl object-cover shadow-pink animate-float"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
