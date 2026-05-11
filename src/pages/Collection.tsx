import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatPrice, waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { useCart } from "@/contexts/CartContext";
import { Plus, Check, Loader2, Search, ArrowLeft, Instagram } from "lucide-react";
import { supabase, Product } from "@/lib/supabase";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import Footer from "@/components/sections/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/contexts/CartContext";
import logo from "@/assets/logo.webp";

type Category = "All" | "Unboxed" | "Thrifted Open Box" | "Boxed" | "Tester";
const categories: Category[] = ["All", "Boxed", "Unboxed", "Thrifted Open Box", "Tester"];

const CollectionContent = () => {
  const [active, setActive] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, items } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("visible", true)
        .order("created_at", { ascending: false });

      if (data) {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filtered = products
    .filter((p) => active === "All" || p.category === active)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.description && p.description.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Perfumes By Luch" className="h-10 w-auto" />
          </Link>
          <div className="w-[100px]"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container pt-12 pb-24">
        {/* Hero Section */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Explore</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Our Collection</h1>
          <p className="mt-4 text-muted-foreground">
            100% authentic luxury perfumes delivered fast across Nigeria. Find your signature scent.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mx-auto max-w-md mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/60 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
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

        {/* Product Count */}
        {!loading && (
          <p className="text-center text-sm font-medium text-muted-foreground mb-8">
            Showing {filtered.length} of {products.length} products
          </p>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground mb-4">No products match your filters.</p>
            <Button variant="outline" onClick={() => { setActive("All"); setSearch(""); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((p) => {
              const inCart = items.some((i) => i.id === p.id);
              const soldOut = !p.in_stock;
              const isSaleActive = p.sale_price && (!p.sale_end_date || new Date(p.sale_end_date) > new Date());
              const displayPrice = isSaleActive ? p.sale_price! : p.price;

              return (
                <article
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-card-luxe transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-pink"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    {p.image_url ? (
                      <img
                        src={getOptimizedImageUrl(p.image_url, 400, 60)}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        width={400}
                        height={400}
                        className={`h-full w-full object-cover transition-smooth group-hover:scale-105 ${soldOut ? "opacity-60" : ""}`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <div className="absolute left-3 top-3 z-30 flex flex-col items-start gap-2">
                      {isSaleActive && (
                        <span className="rounded-full bg-red-600/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg shadow-red-500/20 animate-pulse-slow">
                          Sale
                        </span>
                      )}
                      {p.is_new && (
                        <span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-amber-950 backdrop-blur shadow-sm">
                          New
                        </span>
                      )}
                      {p.is_bestseller && !p.is_new && (
                        <span className="rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg animate-pulse-slow">
                          🔥 Top Seller
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground backdrop-blur">
                      {p.category}
                    </span>
                    {soldOut && (
                      <span className="absolute right-3 top-3 rounded-full bg-red-500/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        Sold Out
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-serif text-xl sm:text-2xl">{p.name}</h3>
                        {p.size && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {p.size}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      {isSaleActive ? (
                        <div className="flex flex-col">
                          <span className="font-serif text-xl text-red-500 font-bold">{formatPrice(displayPrice)}</span>
                          <span className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>
                        </div>
                      ) : (
                        <span className="font-serif text-xl text-primary">{formatPrice(p.price)}</span>
                      )}
                    </div>

                    <Button
                      onClick={() =>
                        addItem({ id: p.id, name: p.name, price: displayPrice, category: p.category, image_url: p.image_url || undefined, size: p.size || undefined })
                      }
                      variant={inCart ? "outline" : "default"}
                      size="sm"
                      disabled={soldOut}
                      className="mt-4 w-full"
                    >
                      {soldOut ? (
                        "Sold Out"
                      ) : inCart ? (
                        <><Check className="h-4 w-4 mr-2" /> Added • Add Another</>
                      ) : (
                        <><Plus className="h-4 w-4 mr-2" /> Add to Cart</>
                      )}
                    </Button>

                    {!soldOut && (
                      <Button asChild variant="ghost" size="sm" className="mt-2 w-full text-xs text-muted-foreground hover:text-primary">
                        <a
                          href={waLink(`Hi, I'd like to order ${p.name}${p.size ? ` (${p.size})` : ""} at ${formatPrice(displayPrice)}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5" />
                          Order via WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Instagram CTA */}
        <div className="mt-16 text-center">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <a href="https://instagram.com/perfumesbyluch" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-5 w-5 text-primary" />
              View More on Instagram
            </a>
          </Button>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
    </div>
  );
};

const Collection = () => {
  return (
    <CartProvider>
      <CollectionContent />
    </CartProvider>
  );
};

export default Collection;
