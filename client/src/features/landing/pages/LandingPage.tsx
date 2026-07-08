import { Navbar } from "../components/header & hero/Navbar";
import { Hero } from "../components/header & hero/Hero";
import { Features } from "../components/header & hero/Features";
import { HowItWorks } from "../components/header & hero/HowitWorks";
import { WorkspacePreview } from "../components/header & hero/WorkspacePreview";
import { AIFeatures } from "../components/header & hero/AIFeatures";
// import { Collaboration } from "../components/header & hero/Collaboration";
// import { Testimonials } from "../components/header & hero/Testimonials";
// import { Pricing } from "../components/footer/Pricing";
import { FAQ } from "../components/footer/FAQ";
import { CTASection } from "../components/footer/CTASection";
// import { Footer } from "../components/footer/Footer";



interface LandingPageProps {
  onGetStarted?: () => void;
  onViewDemo?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
}

export function LandingPage({ onGetStarted, onViewDemo, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onGetStarted={onGetStarted} onLogin={onLogin} />
      <Hero onGetStarted={onGetStarted} onViewDemo={onViewDemo} />
      <Features />
      <HowItWorks />
      <WorkspacePreview />
      <AIFeatures />
      {/* <Collaboration /> */}
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      <FAQ />
      <CTASection onGetStarted={onGetStarted} onViewDemo={onViewDemo} />
      {/* <Footer /> */}
    </div>
  );
}