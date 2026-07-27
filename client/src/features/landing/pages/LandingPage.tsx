import { CTASection } from "../components/CTASection";
import { FAQ } from "../components/FAQ";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { Navbar } from "../components/Navbar";
import { ProductShowcase } from "../components/ProductShowcase";
import { SecuritySection } from "../components/SecuritySection";

interface LandingPageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Navbar onGetStarted={onGetStarted} onLogin={onLogin} />
      <main>
        <Hero onGetStarted={onGetStarted} />
        <Features />
        <HowItWorks />
        <ProductShowcase />
        <SecuritySection />
        <FAQ />
        <CTASection onGetStarted={onGetStarted} onLogin={onLogin} />
      </main>
      <Footer onGetStarted={onGetStarted} onLogin={onLogin} />
    </div>
  );
}
