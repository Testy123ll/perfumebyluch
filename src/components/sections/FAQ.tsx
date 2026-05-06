import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";

const faqCategories = [
  {
    category: "General FAQ",
    items: [
      {
        q: "Are your perfumes authentic?",
        a: "Yes. All our fragrances are 100% authentic and sourced from verified suppliers, retailers, and collectors. We do not sell counterfeit products.",
      },
      {
        q: "What types of perfumes do you sell?",
        a: "We sell a curated selection of Designer and Niche Unboxed, Boxed, Thrifted Open Box and Tester perfumes.",
      },
      {
        q: "What is the difference between Unboxed, Thrifted Open Box, Boxed and Tester Perfumes?",
        a: (
          <div className="space-y-2">
            <p>
              So there are 2<br />
              Old and new,
            </p>
            <p>
              Boxed and tester perfumes are brand new.<br />
              Unboxed and Thrifted Open Box are thrifted.
            </p>
          </div>
        ),
      },
      {
        q: "Do Unboxed and Thrifted Open Box perfumes last as long as Boxed and Tester Perfumes?",
        a: "Most times, they do, but not in all cases. The fragrance quality and longevity may be reduced due to exposure to sunlight and shelf life, which could also affect performance.",
      },
      {
        q: "Do you take wholesale orders?",
        a: "Yes we do, although minimum for wholesale is 10pcs.",
      },
    ],
  },
  {
    category: "Orders & Delivery",
    items: [
      {
        q: "Do you offer delivery across Nigeria and Worldwide?",
        a: "Yes, we deliver across Nigeria, Ghana and Cameroon. Delivery times and fees depend on your location.",
      },
      {
        q: "Do you deliver outside Nigeria?",
        a: "Yes! We deliver Worldwide. For international orders, delivery typically takes 5 to 14 days depending on your location. Contact us on WhatsApp for exact delivery costs and timelines to your area.",
      },
      {
        q: "How long does delivery take?",
        a: (
          <div className="space-y-2">
            <p>Typically:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lagos: 1 to 2 days depending on your location</li>
              <li>Outside Lagos: 2 to 7 days depending on your location.</li>
            </ul>
          </div>
        ),
      },
      {
        q: "Do you offer Payment on Delivery?",
        a: "No we don’t, but you can come to the store to shop, test the fragrances and make payment.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "Can I return a perfume?",
        a: (
          <div className="space-y-3">
            <p>
              Due to the nature of fragrances, we only accept returns/exchange on Brand New Boxed Perfumes only if:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The item is still in its original packaging, sealed and untouched, just the way it was sold to you.</li>
              <li>You received the wrong product.</li>
            </ul>
            <p>
              However, we do not accept returns or exchange on Unboxed and Thrifted Open Box perfumes for hygiene and safety reasons.
            </p>
            <p>
              You can visit our Walk-In Store to sample our fragrances, kindly check the website to see the store address and opening times.
            </p>
          </div>
        ),
      },
    ],
  },
];

const FAQ = () => (
  <section id="faq" className="py-14 md:py-20">
    <div className="container max-w-3xl">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Questions</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Frequently Asked Questions</h2>
      </div>

      <div className="mt-12 space-y-10">
        {faqCategories.map((category, idx) => (
          <div key={idx}>
            <h3 className="mb-4 font-serif text-2xl text-primary">{category.category}</h3>
            <Accordion type="single" collapsible className="space-y-3">
              {category.items.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${idx}-${i}`}
                  className="rounded-xl border border-border bg-card px-5 data-[state=open]:border-primary/40"
                >
                  <AccordionTrigger className="font-serif text-lg text-left hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <p className="font-serif text-xl">Still have questions?</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team is always available on WhatsApp to help you find the perfect scent, confirm availability, or answer any questions before you order.
        </p>
        <a
          href={waLink("Hi Perfumes By Luch! I have a question before I order.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-whatsapp-foreground shadow-glow transition-smooth hover:scale-105"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Chat With Us on WhatsApp
        </a>
      </div>
    </div>
  </section>
);

export default FAQ;
