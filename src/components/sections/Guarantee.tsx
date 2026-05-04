import { Shield, Sparkles, Heart } from "lucide-react";
const Guarantee = () => {
  const promises = [
    {
      title: "100% Authentic",
      icon: Shield,
      description: "Every perfume is sourced directly and verified for authenticity. What you smell is what you get — no imitations, no compromises.",
    },
    {
      title: "Long Lasting Fragrance",
      icon: Sparkles,
      description: "Our curated selection focuses on longevity. Expect 8–12 hours of wear from our boxed collection, and 6–8 hours from our testers.",
    },
    {
      title: "Satisfaction Guarantee",
      icon: Heart,
      description: "Not happy with your purchase? Message us on WhatsApp within 24 hours of delivery and we'll make it right — no questions asked.",
    },
  ];

  return (
    <section 
      className="bg-card/30 py-16"
    >
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl md:text-5xl">The Perfumes By Luch Promise</h2>
          <p className="mt-8 mx-auto max-w-[600px] font-serif italic text-muted-foreground leading-relaxed">
            "We know what it feels like to fall in love with a scent and receive something that doesn't match. That's why we built Perfumes By Luch differently."
          </p>
          <p className="mt-6 text-sm text-muted-foreground/80">
            Every bottle we sell is a promise — of authenticity, of longevity, and of an experience that lingers.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {promises.map((p, idx) => (
            <div 
              key={idx} 
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/30"
            >
              <div className="absolute top-0 left-0 h-1 w-full scale-x-0 bg-primary/40 transition-transform duration-500 group-hover:scale-x-100" />
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-serif text-2xl">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="font-serif text-xl italic text-primary/80">
            "Scent is the strongest sense tied to memory. We make sure yours is worth remembering."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Guarantee;
