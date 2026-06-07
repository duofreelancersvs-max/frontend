import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  ChevronDown,
  FileEdit,
  Search,
  Play,
  Shield,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Custom hook for intersection observer animations
const useInView = (options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1, ...options },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
};

// Animated section wrapper
const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const HowItWorks = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      step: 1,
      title: "Post Your Project",
      description:
        "Tell us what you need in just a few minutes. Whether it's design, development, marketing, finance, or any other skill — post your project and let India's best talent come to you.",
      icon: FileEdit,
      color: "from-blue-500 to-royal-blue",
      features: [
        "Any Category Projects",
        "Smart Talent Matching",
        "Budget Planning",
        "Timeline Control",
      ],
    },
    {
      step: 2,
      title: "Find & Connect",
      description:
        "Browse profiles and portfolios of skilled Indian freelancers from across the country. Compare talent, read reviews, and message directly — no waiting, no middlemen, no delays.",
      icon: Search,
      color: "from-teal to-emerald-500",
      features: [
        "Freelancer Portfolios",
        "Direct Messaging",
        "User Reviews",
        "Pan-India Talent",
      ],
    },
    {
      step: 3,
      title: "Simple & Secure Collaboration",
      description:
        "No middlemen. No commission cuts. Simply connect, discuss your requirements, and get your work done. UPI and Razorpay ensure your payments are always fast, safe, and 100% Indian.",
      icon: Shield,
      color: "from-purple-500 to-pink-500",
      features: [
        "Direct Messaging",
        "UPI & Razorpay Payments",
        "Freelancer Profiles",
        "Job Applications",
        "Indian Payment Standards",
      ],
    },
  ];

  const faqs = [
    {
      question: "How does the verification process work?",
      answer:
        "We manually vet every professional's portfolio, identity, and technical proficiency to ensure they meet our 'Elite' creative standards.",
    },
    {
      question: "How do payments work?",
      answer: "All payments happen directly between the client and the freelancer. We recommend using secure methods like UPI or Razorpay and verifying the other party before transacting.",
    },
    {
      question: "Can I use the platform for physical production?",
      answer:
        "While we specialize in digital post-production (VFX, Editing), many clients hire local talent for on-site shoots through our directory.",
    },
  ];

  const benefits = [
    { icon: Shield, title: "Secured", desc: "Direct Payments" },
    { icon: Clock, title: "Swift", desc: "24h Placement" },
    { icon: Star, title: "Elite", desc: "Vetted Talent" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar dark />

      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-white dark:bg-background border-b border-slate-200 dark:border-white/5">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-royal-blue/5 dark:bg-royal-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-left">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-xs font-bold text-teal dark:text-teal-light mb-8 uppercase tracking-widest">
              <Play size={14} className="fill-current" />
              The Creative Pipeline
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-navy dark:text-white">
              Seamlessly Built for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">
                Excellence
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Experience a streamlined workflow designed by industry
              professionals to bridge local talent with global standards.
            </p>

            <div className="flex flex-wrap justify-center gap-10 opacity-60">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <b.icon size={18} className="text-teal" />
                  <span className="text-sm font-bold uppercase tracking-widest">
                    {b.title}
                  </span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 3. STEPS GRID */}
      <section className="py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-24">
            {steps.map((step, idx) => (
              <AnimatedSection key={step.step} delay={idx * 150}>
                <div
                  className={cn(
                    "flex flex-col lg:flex-row gap-20 items-center",
                    idx % 2 === 1 ? "lg:flex-row-reverse" : "",
                  )}
                >
                  {/* Left: Interactive Visual */}
                  <div className="flex-1 w-full">
                    <div className="relative group">
                      <div
                        className={cn(
                          "aspect-[4/3] rounded-[2.5rem] bg-gradient-to-br p-px overflow-hidden shadow-lg",
                          step.color,
                        )}
                      >
                        <div className="h-full w-full bg-white dark:bg-background/90 rounded-[2.4rem] flex items-center justify-center relative overflow-hidden">
                          <div
                            className={cn(
                              "w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-br",
                              step.color,
                            )}
                          >
                            <step.icon size={40} className="text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Floating Indicator */}
                      <div className="absolute -bottom-6 -right-6 bg-white dark:glass-card dark:bg-transparent shadow-xl dark:shadow-none border border-slate-100 dark:border-white/10 p-6 rounded-2xl animate-float">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal/10 dark:bg-teal/20 rounded-xl flex items-center justify-center text-teal font-bold text-lg">
                            0{step.step}
                          </div>
                          <div className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                            Step
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-navy dark:text-white leading-tight">
                      {step.title}
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>

                    <ul className="grid grid-cols-2 gap-y-4 gap-x-8">
                      {step.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-slate-500 group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-teal group-hover:scale-150 transition-all" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-500 group-hover:text-navy dark:group-hover:text-white transition-colors">
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedSection>
            ))}
            {/* Fraud Disclaimer */}
            <div className="mt-20 max-w-4xl mx-auto text-center">
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-8">
                <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-sm md:text-base text-red-800 dark:text-red-300 font-medium leading-relaxed">
                  "ConnectMeIndia is a direct connect platform. We connect
                  clients and freelancers — all communication and payments
                  happen directly between users. Always verify the person before
                  sharing contact details or making payments. ConnectMeIndia is
                  not responsible for any transactions between users. Report
                  suspicious profiles to our support team."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VIDEO SECTION */}
      <section className="py-32 bg-slate-50 dark:bg-white/5 border-y border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16 space-y-4">
                <span className="text-teal font-bold tracking-widest uppercase text-xs">
                  Visual Guide
                </span>
                <h2 className="text-4xl font-bold text-navy dark:text-white">
                  Watch the Experience
                </h2>
              </div>

              <div className="aspect-video rounded-[3rem] bg-gradient-to-br from-teal/20 to-royal-blue/30 dark:from-navy dark:to-royal-blue/30 p-1 group cursor-pointer relative shadow-xl dark:shadow-2xl dark:shadow-navy/50">
                <div className="h-full w-full bg-white dark:bg-background rounded-[2.9rem] flex items-center justify-center overflow-hidden relative">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-xl border border-slate-100 dark:border-none">
                    <Play
                      fill="currentColor"
                      className="text-teal dark:text-navy ml-1"
                      size={32}
                    />
                  </div>

                  <div className="absolute bottom-10 left-10 text-left">
                    <div className="text-lg font-bold text-navy dark:text-white transition-colors group-hover:text-teal">
                      Platform Walkthrough
                    </div>
                    <div className="text-slate-500 text-sm">
                      3:24 mins • Quality Vetted
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-navy dark:text-white">
                Answers for Success
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-transparent dark:glass-card shadow-sm dark:shadow-none rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-8 text-left flex items-center justify-between group"
                  >
                    <span className="font-bold text-lg text-navy dark:text-white group-hover:text-teal transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={cn(
                        "text-slate-400 dark:text-slate-500 transition-all duration-300",
                        openFaq === idx
                          ? "rotate-180 text-teal dark:text-teal-light"
                          : "",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      openFaq === idx
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="px-8 pb-8 text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-40 relative">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <AnimatedSection>
            <h2 className="text-5xl md:text-7xl font-bold mb-12 text-navy dark:text-white">
              Join the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">
                Evolution
              </span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register?role=client">
                <Button
                  size="lg"
                  className="h-16 px-12 rounded-2xl bg-teal dark:bg-white text-white dark:text-navy font-bold text-lg hover:bg-teal-light dark:hover:bg-slate-100 transition-all hover:scale-105 shadow-xl shadow-teal/20 dark:shadow-2xl dark:shadow-white/10"
                >
                  Hire Elite Talent
                </Button>
              </Link>
              <Link to="/register?role=freelancer">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-12 rounded-2xl border-slate-300 text-slate-700 dark:border-white/20 dark:text-white font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  Join as a Pro
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HowItWorks;
