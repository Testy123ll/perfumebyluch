import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import BestSellers from "@/components/sections/BestSellers";
import Products from "@/components/sections/Products";
import HowToOrder from "@/components/sections/HowToOrder";
import Guarantee from "@/components/sections/Guarantee";
import Reviews from "@/components/sections/Reviews";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import SectionDivider from "@/components/ui/SectionDivider";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <CartProvider>
      <Helmet>
        <title>Perfumes By Luch | Buy Original Perfume in Nigeria | Lagos, Abuja, PH Delivery</title>
        <meta name="description" content="Buy 100% authentic luxury perfumes online in Nigeria. Fast delivery to Lagos, Abuja, Port Harcourt, Kano, Ibadan, Enugu, Benin City and all states. Boxed, unboxed, thrifted and tester fragrances. Order via WhatsApp." />
        <link rel="canonical" href="https://perfumesbyluch.com/" />
      </Helmet>
      <div className="min-h-screen bg-background scroll-smooth">
        <Nav />
        <main>
          <Hero />
          <SectionDivider />
          <section className="relative bg-background">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
            <RevealWrapper>
              <BestSellers />
            </RevealWrapper>
          </section>
          <SectionDivider />
          <RevealWrapper>
            <HowToOrder />
          </RevealWrapper>
          <SectionDivider />
          <RevealWrapper>
            <Products />
          </RevealWrapper>
          <SectionDivider />
          <RevealWrapper>
            <Guarantee />
          </RevealWrapper>
          <SectionDivider />
          <RevealWrapper>
            <Reviews />
          </RevealWrapper>
          <SectionDivider />
          <RevealWrapper>
            <Testimonials />
          </RevealWrapper>
          <SectionDivider />
          <RevealWrapper>
            <About />
          </RevealWrapper>
          <SectionDivider />
          <RevealWrapper>
            <FAQ />
          </RevealWrapper>
          <RevealWrapper>
            <CTA />
          </RevealWrapper>
        </main>
        <Footer />
        <WhatsAppFloat />
        <CartDrawer />
      </div>
    </CartProvider>
  );
};

export default Index;
