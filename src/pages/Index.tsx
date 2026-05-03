import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import HowToOrder from "@/components/sections/HowToOrder";
import Products from "@/components/sections/Products";
import About from "@/components/sections/About";
import Reviews from "@/components/sections/Reviews";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Nav />
        <main>
          <Hero />
          <HowToOrder />
          <Products />
          <About />
          <Reviews />
          <FAQ />
          <CTA />
        </main>
        <Footer />
        <WhatsAppFloat />
        <CartDrawer />
      </div>
    </CartProvider>
  );
};

export default Index;
