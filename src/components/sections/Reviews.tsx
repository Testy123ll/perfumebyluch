const reviews = [
  {
    quote: "Got my Velvet Oud in 24 hours and it smells exactly like the original. Luch is now my go-to.",
    name: "Adaeze O.",
    location: "Lekki",
  },
  {
    quote: "I ordered a tester to try a scent before committing. So smart. Delivery was smooth, packaging was lovely.",
    name: "Tomi A.",
    location: "Abuja",
  },
  {
    quote: "Authentic perfumes at honest prices. The Rose Noir is unreal — getting compliments daily.",
    name: "Chiamaka E.",
    location: "Ikoyi",
  },
];

const Reviews = () => (
  <section className="py-20 md:py-28">
    <div className="container">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Loved by clients</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Words from our community</h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {reviews.map((r) => (
          <figure
            key={r.name}
            className="rounded-2xl border border-border bg-card p-8 shadow-card-luxe transition-smooth hover:border-primary/40"
          >
            <div className="flex gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <blockquote className="mt-4 font-serif text-xl leading-snug text-foreground">
              "{r.quote}"
            </blockquote>
            <figcaption className="mt-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{r.name}</span> · {r.location}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

export default Reviews;
