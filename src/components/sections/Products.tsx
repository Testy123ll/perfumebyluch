import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice, waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { useCart } from "@/contexts/CartContext";
import { Plus, Check, Loader2, Search, Play, X, Instagram, ShoppingBag } from "lucide-react";
import { supabase, Product, getOptimisedImageUrl } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import p1 from "@/assets/perfume-1.jpg";
import p2 from "@/assets/perfume-2.jpg";
import p4 from "@/assets/perfume-4.jpg";
import p7 from "@/assets/perfume-7.jpg";

type Category = "All" | "Unboxed" | "Thrifted Open Box" | "Boxed" | "Tester";

const categories: Category[] = ["All", "Unboxed", "Thrifted Open Box", "Boxed", "Tester"];

// Shown as demo products when Supabase is not yet configured
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "sample-boxed",
    name: "Baccarat Rouge 540",
    description: "Jasmine · amberwood · ambergris · fir resin",
    price: 120000,
    category: "Boxed",
    image_url: p2,
    in_stock: true,
    visible: true,
    is_new: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-unboxed",
    name: "Oud Wood",
    description: "Rare oud wood · sandalwood · vetiver · amber",
    price: 75000,
    category: "Unboxed",
    image_url: p4,
    in_stock: true,
    visible: true,
    is_new: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-thrifted",
    name: "Chance Eau Tendre",
    description: "Grapefruit · quince · jasmine · white musk",
    price: 35000,
    category: "Thrifted Open Box",
    image_url: p1,
    in_stock: true,
    visible: true,
    is_new: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-tester",
    name: "Sauvage",
    description: "Bergamot · pepper · ambroxan · labdanum",
    price: 28000,
    category: "Tester",
    image_url: p7,
    in_stock: false,
    visible: true,
    is_new: false,
    created_at: new Date().toISOString(),
  },
];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [loadMsgIdx, setLoadMsgIdx] = useState(0);
  const { addItem, items, openCart, totalQuantity } = useCart();

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
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("visible", true)
        .order("created_at", { ascending: false });

      // Fall back to sample products when Supabase returns nothing
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(SAMPLE_PRODUCTS);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filtered = products
    .filter((p) => active === "All" || p.category === active)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section id="products" className="py-14 md:py-20 bg-background">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">The Collection</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Shop The Collection</h2>
          <p className="mt-4 text-muted-foreground">
            Hand-picked fragrances across every budget. Add to cart and send your order in one message.
          </p>
        </div>

        {/* Search bar */}
        <div className="mx-auto mt-10 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search fragrances..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p className="font-serif italic text-muted-foreground animate-fade-in transition-all duration-300">
              {loadingMessages[loadMsgIdx]}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-20 pb-12 text-center">
            <p className="text-muted-foreground text-sm">
              No products in this category yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((p, idx) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                priority={idx < 4} 
                isTopSelling={p.is_bestseller}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <a href="https://instagram.com/perfumesbyluch" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-5 w-5 text-primary" />
              View More on Instagram
            </a>
          </Button>
        </div>
      </div>

      {totalQuantity > 0 && (
        <div className="fixed bottom-24 left-0 right-0 z-40 flex justify-center px-4 animate-fade-up">
          <button
            onClick={openCart}
            className="inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-smooth hover:scale-105"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalQuantity} item{totalQuantity > 1 ? "s" : ""} in cart • Send Order via WhatsApp
          </button>
        </div>
      )}
    </section>
  );
};

const ProductCard = ({ product, priority, isTopSelling }: { product: Product; priority?: boolean; isTopSelling?: boolean }) => {
  const { addItem, items } = useCart();
  const [videoOpen, setVideoOpen] = useState(false);
  const inCart = items.some((i) => i.id === product.id);
  const soldOut = !product.in_stock;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image_url: product.image_url || undefined,
      size: product.size || undefined,
    });
  };

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-card-luxe transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-pink">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {product.image_url ? (
            <img
              src={getOptimisedImageUrl(product.image_url)}
              alt={product.name}
              width={400}
              height={400}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "auto"}
              className={`h-full w-full object-cover transition-smooth group-hover:scale-105 ${soldOut ? "opacity-60" : ""}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              No Image
            </div>
          )}

          {product.video_url && (
            <video
              src={getOptimisedImageUrl(product.video_url, 400)}
              poster={getOptimisedImageUrl(product.image_url, 400)}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
          )}

          {/* Video Play Button */}
          {product.video_url && (
            <button
              onClick={() => setVideoOpen(true)}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                <Play className="h-8 w-8 fill-current" />
              </div>
            </button>
          )}

          {/* Emotional Hover Overlay */}
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
            <p className="font-serif text-sm italic text-white/90">
              {product.scent_mood || "Discover your next signature scent"}
            </p>
          </div>

          {/* "New" or "Top Selling" badge */}
          {product.is_new ? (
            <span className="absolute left-3 top-3 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-amber-950 backdrop-blur">
              New
            </span>
          ) : isTopSelling ? (
            <span className="absolute left-3 top-3 rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg animate-pulse-slow">
              🔥 Top Selling
            </span>
          ) : null}

          {/* Category label */}
          <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground backdrop-blur">
            {product.category}
          </span>

          {/* Sold Out badge */}
          {soldOut && (
            <span className="absolute right-3 top-3 rounded-full bg-red-500/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              Sold Out
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between">
            <h3 className="font-serif text-2xl">{product.name}</h3>
            {product.size && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {product.size}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>

          <div className="mt-4 flex items-center justify-between">
            <span className="font-serif text-xl text-primary">{formatPrice(product.price)}</span>
          </div>

          <Button
            onClick={handleAddToCart}
            variant={inCart ? "outline" : "default"}
            size="sm"
            disabled={soldOut}
            className="mt-4 w-full"
          >
            {soldOut ? (
              "Sold Out"
            ) : inCart ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added • Add Another
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>

          {!soldOut && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mt-2 w-full text-xs text-muted-foreground hover:text-primary"
            >
              <a
                href={waLink(
                  `Hi, I'd like to order ${product.name}${
                    product.size ? ` (${product.size})` : ""
                  } at ${formatPrice(product.price)}`
                )}
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

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl border-none bg-black p-0 shadow-none">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            {product.video_url && (
              <video
                poster={getOptimisedImageUrl(product.image_url, 800, 80)}
                preload={videoOpen ? "auto" : "metadata"}
                playsInline
                autoPlay
                muted
                controls
                className="h-full w-full"
              >
                <source src={getOptimisedImageUrl(product.video_url, 1080)} />
                Your browser does not support the video tag.
              </video>
            )}
            <DialogClose className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60">
              <X className="h-6 w-6" />
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Products;
