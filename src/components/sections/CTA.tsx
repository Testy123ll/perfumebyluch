import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";

const CTA = () => (
  <section className="py-14 md:py-20">
    <div className="container">
      <div className="mb-16 text-center animate-fade-up [animation-delay:200ms]">
        <p className="font-serif text-2xl md:text-4xl leading-relaxed text-foreground">
          "Scent is the only sense directly linked to memory and emotion. <br className="hidden md:block" />
          <span className="text-primary italic mt-2 block">Choose wisely. Choose something that stays."</span>
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card to-background p-10 text-center md:p-20 shadow-pink">
        <div className="absolute inset-0 bg-radial-pink" />
        <div className="relative">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight">
            Ready to <span className="italic text-gradient-pink">smell amazing</span>?
          </h2>
          <p className="mt-6 max-w-md text-lg text-muted-foreground mx-auto">
            Boxed, unboxed, thrifted, and tester perfumes available. Authentic fragrances, delivered across Nigeria, Ghana and Cameroon.
          </p>
          <div className="mt-4 flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-primary/70 mb-8">
            <span>🚀 Outside Lagos: 2-7 Days</span>
            <span>🌍 Ghana & Cameroon: 5-14 Days</span>
          </div>
          
          <Button asChild size="lg" variant="whatsapp" className="shadow-xl hover:scale-105 transition-transform">
            <a
              href={waLink("Hi Perfumes By Luch! I'm ready to smell amazing.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Message on WhatsApp
            </a>
          </Button>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-center text-[10px] uppercase tracking-widest text-primary/70">
            <div className="flex flex-col items-center border-r border-border/30 pr-8 last:border-0">
              <span className="font-serif text-2xl text-foreground tracking-normal lowercase italic">500+</span>
              <span>Happy customers</span>
            </div>
            <div className="flex flex-col items-center border-r border-border/30 pr-8 last:border-0">
              <span className="font-serif text-2xl text-foreground tracking-normal lowercase italic">3 Countries</span>
              <span>Nigeria • Ghana • Cameroon</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl text-foreground tracking-normal lowercase italic">100%</span>
              <span>Authentic Always</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
