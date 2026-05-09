import React, { lazy, Suspense } from "react";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import BestSellers from "@/components/sections/BestSellers";
import Footer from "@/components/sections/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const Products = lazy(() => import("@/components/sections/Products"));
const HowToOrder = lazy(() => import("@/components/sections/HowToOrder"));
const Guarantee = lazy(() => import("@/components/sections/Guarantee"));
const Reviews = lazy(() => import("@/components/sections/Reviews"));
const Testimonials = lazy(() => import("@/components/sections/Testimonials"));
const About = lazy(() => import("@/components/sections/About"));
const FAQ = lazy(() => import("@/components/sections/FAQ"));
const CTA = lazy(() => import("@/components/sections/CTA"));

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
          <Suspense fallback={<div className="h-24 w-full" />}>
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
          </Suspense>
        </main>
        <Footer />
        <WhatsAppFloat />
        <CartDrawer />
      </div>
    </CartProvider>
  );
};

export default Index;
