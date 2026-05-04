import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, BadgeCheck } from "lucide-react";

type Testimonial = {
  reviewer_name: string;
  comment: string;
  rating: number;
  verified: boolean;
  area?: string;
};

const PLACEHOLDERS: Testimonial[] = [
  {
    reviewer_name: "Adaeze M.",
    area: "Lekki",
    comment: "The Noir Oud I ordered lasted all day at my wedding. I got so many compliments. Truly a premium experience from start to finish.",
    rating: 5,
    verified: true,
  },
  {
    reviewer_name: "Emeka T.",
    area: "Abuja",
    comment: "Fast delivery, original packaging, smells exactly like the tester. Will order again. Finally a reliable perfume plug in Lagos!",
    rating: 5,
    verified: true,
  },
  {
    reviewer_name: "Fatima K.",
    area: "Port Harcourt",
    comment: "I've been buying from Perfumes By Luch for 6 months. Never disappointed once. The customer service is as good as the scents.",
    rating: 5,
    verified: true,
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("reviewer_name, comment, rating, verified, is_testimonial")
        .eq("is_testimonial", true)
        .eq("visible", true)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        // If we have some testimonials, we take up to 3 and fill the rest with placeholders if needed
        const fetched = data as Testimonial[];
        const combined = [...fetched];
        if (combined.length < 3) {
          combined.push(...PLACEHOLDERS.slice(0, 3 - combined.length));
        }
        setTestimonials(combined.slice(0, 3));
      } else {
        setTestimonials(PLACEHOLDERS);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section 
      className="py-14 md:py-20 overflow-hidden"
    >
      <div className="container">
        <div className="mb-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Real Customers. Real Stories.</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Why Lagos Loves Us</h2>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Wide Left Card */}
            <div className="flex flex-col gap-6 lg:translate-y-8">
              {testimonials[0] && (
                <div className="group relative rounded-3xl border border-border bg-card/40 p-10 backdrop-blur-sm transition-all duration-300 hover:border-primary/20">
                  <span className="absolute -top-4 -left-2 font-serif text-8xl text-primary/10 select-none">“</span>
                  <div className="relative">
                    <div className="flex gap-1 text-primary">
                      {[...Array(testimonials[0].rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-6 font-serif text-2xl italic leading-relaxed text-foreground">
                      {testimonials[0].comment}
                    </p>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-serif text-lg text-primary">
                          {testimonials[0].reviewer_name}
                          <span className="ml-2 text-sm font-sans italic text-muted-foreground">— {testimonials[0].area || "Verified Buyer"}</span>
                        </p>
                        {testimonials[0].verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Narrower Right Card */}
            <div className="flex flex-col justify-center">
              {testimonials[1] && (
                <div className="group relative max-w-lg self-end rounded-3xl border border-border bg-card/40 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 lg:-translate-y-12">
                  <span className="absolute -top-4 -left-2 font-serif text-7xl text-primary/10 select-none">“</span>
                  <div className="relative">
                    <div className="flex gap-1 text-primary">
                      {[...Array(testimonials[1].rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 font-serif text-xl italic leading-relaxed text-foreground">
                      {testimonials[1].comment}
                    </p>
                    <div className="mt-6">
                      <p className="font-serif text-base text-primary">
                        {testimonials[1].reviewer_name}
                        <span className="ml-2 text-xs font-sans italic text-muted-foreground">— {testimonials[1].area || "Lagos"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Width Bottom Card */}
          <div className="mt-12">
            {testimonials[2] && (
              <div className="group relative mx-auto max-w-4xl rounded-3xl border border-border bg-card/40 p-10 backdrop-blur-sm transition-all duration-300 hover:border-primary/20">
                <span className="absolute -top-4 -left-2 font-serif text-8xl text-primary/10 select-none">“</span>
                <div className="relative flex flex-col items-center text-center">
                  <div className="flex gap-1 text-primary">
                    {[...Array(testimonials[2].rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-6 max-w-2xl font-serif text-2xl italic leading-relaxed text-foreground">
                    {testimonials[2].comment}
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <p className="font-serif text-lg text-primary">
                      {testimonials[2].reviewer_name}
                      <span className="ml-2 text-sm font-sans italic text-muted-foreground">— {testimonials[2].area || "Perfume Enthusiast"}</span>
                    </p>
                    {testimonials[2].verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
