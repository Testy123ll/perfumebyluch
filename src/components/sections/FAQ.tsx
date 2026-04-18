import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Are your perfumes original?",
    a: "Yes. All products are verified and sourced from trusted suppliers.",
  },
  {
    q: "Do you deliver outside Lagos?",
    a: "Yes. Nationwide delivery is available.",
  },
  {
    q: "How do I order?",
    a: "Click any WhatsApp button on this page and send your order. We'll handle the rest.",
  },
  {
    q: "Do you sell testers?",
    a: "Yes. Testers and thrifted options are available at lower prices.",
  },
  {
    q: "How long does delivery take?",
    a: "Lagos: 1–2 days. Outside Lagos: 2–4 days.",
  },
];

const FAQ = () => (
  <section id="faq" className="py-20 md:py-28">
    <div className="container max-w-3xl">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Questions</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Good to know</h2>
      </div>

      <Accordion type="single" collapsible className="mt-10 space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="rounded-xl border border-border bg-card px-5 data-[state=open]:border-primary/40"
          >
            <AccordionTrigger className="font-serif text-lg hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQ;
