import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";

const CTA = () => (
  <section className="py-14 md:py-20">
    <div className="container">
      {/* Emotional Statement */}
      <div className="mb-16 text-center animate-fade-up [animation-delay:200ms]">
        <p className="font-serif text-2xl md:text-4xl leading-relaxed text-foreground">
          "Scent is the only sense directly linked to memory and emotion. <br className="hidden md:block" />
          <span className="text-primary italic mt-2 block">Choose wisely. Choose something that stays."</span>
        </p>
        
        <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="text-center">
            <p className="font-serif text-xl text-foreground">500+</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Happy customers</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-xl text-foreground">3 Countries</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">NG · GH · CM</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-xl text-foreground">100%</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Authentic Always</p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card to-background p-10 text-center md:p-20 shadow-pink">
        <div className="absolute inset-0 bg-radial-pink" />
        <div className="relative">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight">
            Ready to <span className="italic text-gradient-pink">smell amazing</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Send us a message and we'll help you pick the perfect scent.
          </p>
          <Button asChild size="lg" variant="whatsapp" className="mt-8 text-base">
            <a
              href={waLink("Hi Perfumes By Luch! I'm ready to smell amazing.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Message on WhatsApp
            </a>
          </Button>

          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">or</p>
            <a
              href="#products"
              className="font-serif italic text-primary/70 text-sm hover:text-primary transition-colors"
            >
              Browse the collection first ↓
            </a>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-center text-sm text-muted-foreground">
            <div>
              <p className="font-serif text-3xl text-foreground">500+</p>
              <p>Happy customers across West Africa</p>
            </div>
            <div className="h-10 w-px bg-border hidden md:block self-center" />
            <div>
              <p className="font-serif text-3xl text-foreground">3</p>
              <p>Countries — Nigeria · Ghana · Cameroon</p>
            </div>
            <div className="h-10 w-px bg-border hidden md:block self-center" />
            <div>
              <p className="font-serif text-3xl text-foreground">100%</p>
              <p>Authentic, every single time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
