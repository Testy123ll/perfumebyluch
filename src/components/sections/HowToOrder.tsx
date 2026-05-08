import { Search, MessageSquare, Truck, ShoppingBag } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Explore",
    description: "Browse our curated collection of luxury fragrances and find your perfect selection.",
  },
  {
    icon: ShoppingBag,
    title: "2. Add to Bag",
    description: "Add multiple items to your cart, we’ll package them very carefully with so much love, until it gets to you.",
  },
  {
    icon: MessageSquare,
    title: "3. WhatsApp Order",
    description: "Click the Order button to send your entire shopping list to us in one click.",
  },
  {
    icon: Truck,
    title: "4. Global Delivery",
    description: "We’ll confirm availability and ship to your doorstep within Nigeria, to Ghana and Cameroon or Worldwide.",
  },
];

const HowToOrder = () => (
  <section className="py-16 md:py-24 bg-card/30 backdrop-blur-sm">
    <div className="container">
      <div className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Seamless Guidance</p>
        <h2 className="mt-3 font-serif text-3xl md:text-5xl">The 4-Step Luxury Experience</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, idx) => (
          <div key={idx} className="group relative flex flex-col items-center text-center p-8 rounded-3xl border border-border bg-background/50 transition-smooth hover:border-primary/40 hover:shadow-card-luxe">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 text-primary transition-smooth group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
              <step.icon className="h-10 w-10" />
            </div>
            <h3 className="font-serif text-2xl mb-4">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {step.description}
            </p>
            {idx < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 h-px w-6 bg-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowToOrder;
