import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice, waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { useCart } from "@/contexts/CartContext";
import { Plus, Check, Loader2, Search, ShoppingBag, Instagram, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase, Product } from "@/lib/supabase";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/contexts/CartContext";
import p1 from "@/assets/perfume-1.jpg";
import p2 from "@/assets/perfume-2.jpg";
import p4 from "@/assets/perfume-4.jpg";
import p7 from "@/assets/perfume-7.jpg";

type Category = "All" | "Unboxed" | "Thrifted Open Box" | "Boxed" | "Tester";
const categories: Category[] = ["All", "Unboxed", "Thrifted Open Box", "Boxed", "Tester"];

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

const MAX_QTY = 10;

const CollectionsGrid = () => {
  const [active, setActive] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { addItem, items } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("visible", true)
        .order("created_at", { ascending: false });

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

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [active, search]);

  return (
    <div>
      {/* Search */}
      <div className="mx-auto max-w-md">
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
      <div className="mt-5 flex flex-wrap justify-center gap-2">
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

      {/* Results count */}
      {!loading && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"} found
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="mt-20 flex justify-center pb-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-20 pb-12 text-center">
          <p className="text-muted-foreground text-sm">No products in this category yet. Check back soon.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginated.map((p) => {
            const inCart = items.some((i) => i.id === p.id);
            const soldOut = !p.in_stock;
            return (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card-luxe transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-pink"
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
                      <ShoppingBag className="h-10 w-10 opacity-30" />
                    </div>
                  )}
                  {p.is_new && (
                    <span className="absolute left-3 top-3 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-amber-950 backdrop-blur">
                      New
                    </span>
                  )}
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
                  <h3 className="font-serif text-2xl">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-serif text-xl text-primary">{formatPrice(p.price)}</span>
                  </div>
                  <Button
                    onClick={() =>
                      addItem({ id: p.id, name: p.name, price: p.price, category: p.category, image_url: p.image_url || undefined })
                    }
                    variant={inCart ? "outline" : "default"}
                    size="sm"
                    disabled={soldOut}
                    className="mt-4 w-full"
                  >
                    {soldOut ? "Sold Out" : inCart ? (
                      <><Check className="h-4 w-4" /> Added • Add Another</>
                    ) : (
                      <><Plus className="h-4 w-4" /> Add to Cart</>
                    )}
                  </Button>
                  {!soldOut && (
                    <Button asChild variant="ghost" size="sm" className="mt-2 w-full text-xs text-muted-foreground hover:text-primary">
                      <a
                        href={waLink(`Hi, I'd like to order ${p.name} at ${formatPrice(p.price)}`)}
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-all ${
                    currentPage === page
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </>
      )}

      {/* CTA */}
      <div className="mt-14 text-center">
        <Button asChild variant="outline" size="lg" className="hover:border-primary hover:text-primary">
          <a href="https://instagram.com/perfumesbyluch" target="_blank" rel="noopener noreferrer">
            <Instagram className="h-4 w-4" />
            View More on Instagram
          </a>
        </Button>
      </div>
    </div>
  );
};

const Collections = () => (
  <CartProvider>
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container pt-32 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">All Fragrances</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">The Collection</h1>
          <p className="mt-4 text-muted-foreground">
            Browse our full range of designer and niche fragrances: boxed, unboxed, thrifted, and testers.
          </p>
        </div>
        <div className="mt-12">
          <CollectionsGrid />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
    </div>
  </CartProvider>
);

export default Collections;
