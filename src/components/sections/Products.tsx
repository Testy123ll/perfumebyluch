import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice, waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { useCart } from "@/contexts/CartContext";
import { Plus, Check } from "lucide-react";
import p1 from "@/assets/perfume-1.jpg";
import p2 from "@/assets/perfume-2.jpg";
import p3 from "@/assets/perfume-3.jpg";
import p4 from "@/assets/perfume-4.jpg";
import p5 from "@/assets/perfume-5.jpg";
import p6 from "@/assets/perfume-6.jpg";
import p7 from "@/assets/perfume-7.jpg";
import p8 from "@/assets/perfume-8.jpg";

type Category = "All" | "Boxed" | "Unboxed" | "Thrifted" | "Testers";

const products = [
  { id: "velvet-oud", name: "Velvet Oud", note: "Smoky oud · amber · vanilla", price: 95000, image: p2, category: "Boxed" as const },
  { id: "rose-noir", name: "Rose Noir", note: "Bulgarian rose · musk · saffron", price: 110000, image: p3, category: "Boxed" as const },
  { id: "midnight-bleu", name: "Midnight Bleu", note: "Bergamot · cedar · ambroxan", price: 85000, image: p4, category: "Unboxed" as const },
  { id: "onyx-reserve", name: "Onyx Reserve", note: "Tobacco · leather · oud", price: 120000, image: p5, category: "Boxed" as const },
  { id: "ivory-bloom", name: "Ivory Bloom", note: "Jasmine · white musk · pear", price: 65000, image: p6, category: "Unboxed" as const },
  { id: "crystal-aura", name: "Crystal Aura", note: "Clean musk · iris · powder", price: 45000, image: p1, category: "Thrifted" as const },
  { id: "pink-soiree", name: "Pink Soirée", note: "Lychee · peony · raspberry", price: 25000, image: p7, category: "Testers" as const },
  { id: "golden-hour", name: "Golden Hour", note: "Saffron · honey · sandalwood", price: 135000, image: p8, category: "Boxed" as const },
];

const categories: Category[] = ["All", "Boxed", "Unboxed", "Thrifted", "Testers"];

const Products = () => {
  const [active, setActive] = useState<Category>("All");
  const { addItem, items } = useCart();
  const filtered = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <section id="products" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">The Collection</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Signature Scents</h2>
          <p className="mt-4 text-muted-foreground">
            Hand-picked fragrances across every budget. Add to cart and send your order in one message.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full border px-5 py-2 text-sm transition-smooth ${
                active === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p) => {
            const inCart = items.some((i) => i.id === p.id);
            return (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card-luxe transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-pink"
              >
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <img
                    src={p.image}
                    alt={p.name}
                    width={768}
                    height={768}
                    loading="lazy"
                    className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground backdrop-blur">
                    {p.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-2xl">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-serif text-xl text-primary">{formatPrice(p.price)}</span>
                  </div>
                  <Button
                    onClick={() =>
                      addItem({ id: p.id, name: p.name, price: p.price, category: p.category })
                    }
                    variant={inCart ? "outline" : "default"}
                    size="sm"
                    className="mt-4 w-full"
                  >
                    {inCart ? (
                      <>
                        <Check className="h-4 w-4" />
                        Added — Add Another
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="mt-2 w-full text-xs text-muted-foreground hover:text-primary">
                    <a
                      href={waLink(`Hi! I have a question about ${p.name} (${formatPrice(p.price)}).`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5" />
                      Ask about this scent
                    </a>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <a href={waLink("Hi! Can I see more perfumes available?")} target="_blank" rel="noopener noreferrer">
              View More on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
