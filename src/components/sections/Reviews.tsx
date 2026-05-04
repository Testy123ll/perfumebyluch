import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BadgeCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Reviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, products(id, name)")
        .eq("visible", true)
        .order("created_at", { ascending: false });
      
      setReviews(data || []);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <section id="reviews" className="py-14 md:py-20 bg-secondary/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Loved by clients</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Words from our community</h2>
          
          {reviews.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-lg">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(parseFloat(averageRating)) ? "fill-current" : ""}`} />
                ))}
              </div>
              <span className="font-serif font-bold text-primary">{averageRating} ★</span>
              <span className="text-muted-foreground text-sm">from {reviews.length} reviews</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-12 text-center text-muted-foreground italic">
            Be the first to share your experience
          </div>
        ) : (
          <div className="mt-12 flex gap-6 overflow-x-auto pb-6 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
            {reviews.map((r) => (
              <figure
                key={r.id}
                className="min-w-[300px] flex-shrink-0 rounded-2xl border border-border bg-card p-8 shadow-card-luxe transition-smooth hover:border-primary/40 md:min-w-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {new Date(r.created_at).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                
                <blockquote className="mt-4 font-serif text-lg leading-snug text-foreground italic">
                  "{r.comment}"
                </blockquote>
                
                <figcaption className="mt-6">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{r.reviewer_name}</span>
                    {r.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-green-500 font-bold uppercase">
                        <BadgeCheck className="h-3 w-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  {r.products && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Purchased: <Link to="/collections" className="text-primary hover:underline">{r.products.name}</Link>
                    </p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;
