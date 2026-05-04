import { Search, MessageSquare, Truck, ShoppingCart } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse",
    description: "Find the scent that feels like you — or the one you've always wanted to be.",
  },
  {
    icon: ShoppingCart,
    title: "Confirm",
    description: "Check the scent details and availability. Every choice counts.",
  },
  {
    icon: MessageSquare,
    title: "Order",
    description: "One WhatsApp message. We handle the rest with care.",
  },
  {
    icon: Truck,
    title: "Delivery",
    description: "Your new signature scent, delivered to your door across Nigeria and Worldwide.",
  },
];

const HowToOrder = () => (
  <section className="py-12 md:py-16 bg-card/50">
    <div className="container">
      <div className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Simple Steps</p>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">How To Order</h2>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-background shadow-sm transition-smooth hover:border-primary/30">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <step.icon className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-xl mb-3">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowToOrder;
