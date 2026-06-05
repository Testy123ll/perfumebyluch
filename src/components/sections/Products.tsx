import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatPrice, waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { useCart } from "@/contexts/CartContext";
import { Plus, Check, Loader2, Search, Play, X, Instagram, ShoppingBag } from "lucide-react";
import { supabase, Product } from "@/lib/supabase";
import { getOptimizedVideoUrl, getOptimizedImageUrl, getVideoThumbnail } from "@/lib/media";
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
            Hand-Picked Luxurious Fragrances across every budget, add to cart and send in your order in one message. Very seamless.
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
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search scents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-card/50 py-3 pl-11 pr-4 text-sm backdrop-blur-sm transition-smooth focus:border-primary/60 focus:ring-4 focus:ring-primary/5"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full border px-5 py-2 text-sm transition-smooth ${active === cat
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
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
            {filtered.slice(0, 6).map((p, idx) => (
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
            <Link to="/collection">
              View Full Collection
            </Link>
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

const LazyVideo = ({ 
  product, 
  soldOut, 
  onPlayClick 
}: { 
  product: Product; 
  soldOut?: boolean; 
  onPlayClick?: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = () => {
    if (videoRef.current && product.video_url) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleTouchStart = () => {
    if (videoRef.current && product.video_url) {
      if (isPlaying) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onClick={onPlayClick}
      className="relative h-full w-full cursor-pointer"
    >
      {/* Always show image first */}
      <img
        src={getOptimizedImageUrl(product.image_url, 400, 65)}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          isPlaying ? "opacity-0" : "opacity-100"
        } ${soldOut ? "opacity-60" : ""}`}
      />

      {/* Only render video element when card is visible in viewport */}
      {isVisible && product.video_url && (
        <video
          ref={videoRef}
          src={getOptimizedVideoUrl(product.video_url)}
          preload="none"
          muted
          loop
          playsInline
          poster={getVideoThumbnail(product.video_url) || getOptimizedImageUrl(product.image_url, 400, 65)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            isPlaying ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Play hint icon */}
      {isVisible && product.video_url && !isPlaying && (
        <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white z-20">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 1.5l6 3.5-6 3.5V1.5z"/>
          </svg>
        </div>
      )}

      {/* Large play button on hover */}
      {product.video_url && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
            <Play className="h-8 w-8 fill-current" />
          </div>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product, priority, isTopSelling }: { product: Product; priority?: boolean; isTopSelling?: boolean }) => {
  const { addItem, items } = useCart();
  const [videoOpen, setVideoOpen] = useState(false);
  const inCart = items.some((i) => i.id === product.id);
  const soldOut = !product.in_stock;

  const isSaleActive = product.sale_price && (!product.sale_end_date || new Date(product.sale_end_date) > new Date());
  const displayPrice = isSaleActive ? product.sale_price! : product.price;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
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
            <LazyVideo
              product={product}
              soldOut={soldOut}
              onPlayClick={product.video_url ? () => setVideoOpen(true) : undefined}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              No Image
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
            <p className="font-serif text-sm italic text-white/90">
              {product.scent_mood || "Discover your next signature scent"}
            </p>
          </div>

          <div className="absolute left-3 top-3 z-30 flex flex-col items-start gap-2">
            {isSaleActive && (
              <span className="rounded-full bg-red-600/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg shadow-red-500/20 animate-pulse-slow">
                Sale
              </span>
            )}
            {product.is_new && (
              <span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-amber-950 backdrop-blur shadow-sm">
                New
              </span>
            )}
            {isTopSelling && !product.is_new && (
              <span className="rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg animate-pulse-slow">
                🔥 Top Selling
              </span>
            )}
          </div>

          <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground backdrop-blur">
            {product.category}
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
              <h3 className="font-serif text-2xl">{product.name}</h3>
              {product.size && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {product.size}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            {isSaleActive ? (
              <div className="flex flex-col">
                <span className="font-serif text-xl text-red-500 font-bold">{formatPrice(displayPrice)}</span>
                <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="font-serif text-xl text-primary">{formatPrice(product.price)}</span>
            )}
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
                  `Hi, I'd like to order ${product.name}${product.size ? ` (${product.size})` : ""
                  } at ${formatPrice(displayPrice)}`
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
                poster={getVideoThumbnail(product.video_url) || getOptimizedImageUrl(product.image_url, 800, 65)}
                preload={videoOpen ? "auto" : "none"}
                playsInline
                autoPlay
                muted
                controls
                className="h-full w-full"
              >
                <source src={getOptimizedVideoUrl(product.video_url)} />
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
