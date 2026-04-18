import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Products from "@/components/sections/Products";
import About from "@/components/sections/About";
import Reviews from "@/components/sections/Reviews";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <Products />
        <About />
        <Reviews />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
