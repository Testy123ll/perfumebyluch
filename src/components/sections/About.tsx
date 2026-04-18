const About = () => (
  <section id="about" className="py-20 md:py-28">
    <div className="container">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center md:p-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">About Us</p>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl">
          Built on <span className="italic text-gradient-pink">trust</span> and authenticity
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Perfumes By Luch is a Lekki-based fragrance house dedicated to making luxury accessible. Every bottle is
          carefully verified and sourced from trusted suppliers — so you get the real scent, every single time.
          Whether you want a brand-new boxed designer or a budget-friendly tester, we've got you.
        </p>
      </div>
    </div>
  </section>
);

export default About;
