import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";

const CTA = () => (
  <section className="py-20 md:py-28">
    <div className="container">
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card to-background p-10 text-center md:p-20">
        <div className="absolute inset-0 bg-radial-pink" />
        <div className="relative">
          <h2 className="font-serif text-4xl md:text-6xl">
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
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
