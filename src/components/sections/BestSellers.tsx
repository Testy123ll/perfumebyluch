import { useEffect, useState } from "react";
import { supabase, Product } from "@/lib/supabase";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatPrice, waLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";

const BestSellers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadMsgIdx, setLoadMsgIdx] = useState(0);

  const loadingMessages = [
    "Curating your collection...",
    "Finding your perfect scent...",
    "Preparing something special...",
    "Almost there...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const fetchBestSellers = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_bestseller", true)
        .eq("visible", true)
        .order("created_at", { ascending: false });

      if (data) setProducts(data);
      setLoading(false);
    };
    fetchBestSellers();
  }, []);

  return (
    <section 
      className="py-14 md:py-20 bg-background"
    >
      <div className="container">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Most Loved</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Best Sellers</h2>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground italic font-serif text-lg">
            "These aren't just perfumes. They're the ones our customers reach for on their most important days."
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p className="font-serif italic text-muted-foreground animate-fade-in transition-all duration-300">
              {loadingMessages[loadMsgIdx]}
            </p>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
            {products.map((p) => (
              <div 
                key={p.id} 
                className="group relative flex min-w-[280px] flex-col overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] md:min-w-0"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={getOptimizedImageUrl(p.image_url, 400, 60)}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 z-30 flex flex-col items-start gap-2">
                    {p.sale_price && (!p.sale_end_date || new Date(p.sale_end_date) > new Date()) && (
                      <span className="rounded-full bg-red-600/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg shadow-red-500/20 animate-pulse-slow">
                        Sale
                      </span>
                    )}
                    {p.size && (
                      <span className="rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur">
                        {p.size}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6 text-center">
                  <div className="flex-1">
                    <h3 className="font-serif text-xl">{p.name}</h3>
                  </div>
                  {p.sale_price && (!p.sale_end_date || new Date(p.sale_end_date) > new Date()) ? (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="font-serif text-lg text-red-500 font-bold">{formatPrice(p.sale_price)}</span>
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>
                    </div>
                  ) : (
                    <p className="mt-2 font-serif text-lg text-primary">{formatPrice(p.price)}</p>
                  )}
                  
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-4 border-primary/20 text-xs hover:bg-primary hover:text-primary-foreground"
                  >
                    <a
                      href={waLink(`Hi! I'd like to order the Best Seller: ${p.name}${p.size ? ` (${p.size})` : ""} at ${formatPrice(p.sale_price && (!p.sale_end_date || new Date(p.sale_end_date) > new Date()) ? p.sale_price : p.price)}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5" />
                      Order via WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-3">
          <a
            href="#products"
            className="font-serif italic text-primary/80 text-sm hover:text-primary transition-colors"
          >
            Explore the full collection ↓
          </a>
        </div>

        <div className="mt-12 text-center">
          <a
            href="#products"
            className="text-sm uppercase tracking-widest text-muted-foreground transition-smooth hover:text-primary"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            View Full Collection
          </a>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
