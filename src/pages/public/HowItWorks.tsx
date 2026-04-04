import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  ChevronDown,
  FileEdit,
  Users,
  CheckCircle,
  UserPlus,
  Search,
  Wallet,
  Play,
  Briefcase,
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
  const [activeTab, setActiveTab] = useState<"clients" | "freelancers">("clients");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const clientSteps = [
    {
      step: 1,
      title: "Post Your Vision",
      description: "Define your creative requirements in minutes. Our intuitive brief builder helps you specify every detail from VFX standards to specific software needs.",
      icon: FileEdit,
      color: "from-blue-500 to-royal-blue",
      features: ["VFX-Specific Briefs", "Budget Planning", "Skill Matching", "Timeline Control"],
    },
    {
      step: 2,
      title: "Curation & Selection",
      description: "Receive high-quality proposals from vetted South Indian professionals. Compare cinematic portfolios and verified reviews to find your perfect partner.",
      icon: Users,
      color: "from-teal to-emerald-500",
      features: ["Cinematic Portfolios", "Verified Reviews", "Instant Messaging", "Technical Vetting"],
    },
    {
      step: 3,
      title: "Elite Collaboration",
      description: "Start your project with secure contracts and milestone-based workflows. Manage files and feedback through our professional production suite.",
      icon: CheckCircle,
      color: "from-purple-500 to-pink-500",
      features: ["Milestone Payments", "Studio-Grade Review", "Secure Escrow", "Global Standards"],
    },
  ];

  const freelancerSteps = [
    {
      step: 1,
      title: "Showcase Your Craft",
      description: "Build a premium digital storefront. Showcase your 3D reels, VFX breakdowns, and video portfolios to a curated list of high-value clients.",
      icon: UserPlus,
      color: "from-teal to-royal-blue",
      features: ["Dynamic Portfolios", "Skill Badges", "Verified Status", "Global Visibility"],
    },
    {
      step: 2,
      title: "Discover Opportunities",
      description: "Get matched with projects that value your specific expertise. From local ad films to international VFX pipelines, find work that inspires you.",
      icon: Search,
      color: "from-sky-blue to-teal",
      features: ["AI Matchmaking", "Instant Alerts", "Premium Proposals", "Direct Inquiries"],
    },
    {
      step: 3,
      title: "Deliver & Prosper",
      description: "Execute projects with clear milestones and guaranteed payments. Build your reputation as an elite professional in the creative economy.",
      icon: Wallet,
      color: "from-royal-blue to-blue-600",
      features: ["Escrow Protection", "Fast Payouts", "Reputation Score", "Client Retention"],
    },
  ];

  const faqs = [
    {
      question: "How does the verification process work?",
      answer: "We manually vet every professional's portfolio, identity, and technical proficiency to ensure they meet our 'Elite' creative standards.",
    },
    {
      question: "Are my initial payments secure?",
      answer: "Yes. All funds are held in a secure escrow account and only released when you approve specific project milestones.",
    },
    {
      question: "Can I use the platform for physical production?",
      answer: "While we specialize in digital post-production (VFX, Editing), many clients hire local talent for on-site shoots through our directory.",
    },
  ];

  const benefits = [
    { icon: Shield, title: "Secured", desc: "Escrow Protection" },
    { icon: Clock, title: "Swift", desc: "24h Placement" },
    { icon: Star, title: "Elite", desc: "Vetted Talent" },
  ];

  const activeSteps = activeTab === "clients" ? clientSteps : freelancerSteps;

  return (
    <div className="min-h-screen bg-[#050B15] font-sans text-white overflow-x-hidden">
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-plus-pattern opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-royal-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-teal-light mb-8 uppercase tracking-widest">
              <Play size={14} className="fill-current" />
              The Creative Pipeline
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              Seamlessly Built for <br />
              <span className="text-gradient">Excellence</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Experience a streamlined workflow designed by industry professionals to bridge local talent with global standards.
            </p>

            <div className="flex flex-wrap justify-center gap-10 opacity-60">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <b.icon size={18} className="text-teal" />
                  <span className="text-sm font-bold uppercase tracking-widest">{b.title}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. ROLE TABS */}
      <section className="sticky top-16 z-40 bg-[#050B15]/80 backdrop-blur-xl border-y border-white/5 py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-center">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab("clients")}
                className={cn(
                  "px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  activeTab === "clients" ? "bg-teal text-white shadow-lg shadow-teal/20" : "text-slate-400 hover:text-white"
                )}
              >
                <Briefcase size={16} />
                I am a Client
              </button>
              <button
                onClick={() => setActiveTab("freelancers")}
                className={cn(
                  "px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  activeTab === "freelancers" ? "bg-royal-blue text-white shadow-lg shadow-royal-blue/20" : "text-slate-400 hover:text-white"
                )}
              >
                <UserPlus size={16} />
                I am a Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STEPS GRID */}
      <section className="py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-24">
            {activeSteps.map((step, idx) => (
              <AnimatedSection key={step.step} delay={idx * 150}>
                <div className={cn(
                  "flex flex-col lg:flex-row gap-20 items-center",
                  idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                )}>
                  {/* Left: Interactive Visual */}
                  <div className="flex-1 w-full">
                    <div className="relative group">
                      <div className={cn(
                        "aspect-[4/3] rounded-[2.5rem] bg-gradient-to-br p-[1px] overflow-hidden",
                        step.color
                      )}>
                        <div className="h-full w-full bg-[#050B15]/90 rounded-[2.4rem] flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-plus-pattern opacity-[0.05]" />
                          <div className={cn(
                            "w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-br",
                            step.color
                          )}>
                            <step.icon size={40} className="text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Floating Indicator */}
                      <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl animate-float">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal/20 rounded-xl flex items-center justify-center text-teal font-bold text-lg">
                            0{step.step}
                          </div>
                          <div className="text-sm font-bold text-slate-300 uppercase tracking-widest">Step</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">{step.title}</h2>
                    <p className="text-xl text-slate-400 leading-relaxed">{step.description}</p>
                    
                    <ul className="grid grid-cols-2 gap-y-4 gap-x-8">
                      {step.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-500 group">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal group-hover:scale-150 transition-all" />
                          <span className="text-sm font-medium group-hover:text-white transition-colors">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VIDEO SECTION */}
      <section className="py-32 bg-white/5 border-y border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16 space-y-4">
                <span className="text-teal font-bold tracking-widest uppercase text-xs">Visual Guide</span>
                <h2 className="text-4xl font-bold">Watch the Experience</h2>
              </div>

              <div className="aspect-video rounded-[3rem] bg-gradient-to-br from-navy to-royal-blue/30 p-1 group cursor-pointer relative shadow-2xl shadow-navy/50">
                <div className="h-full w-full bg-[#050B15] rounded-[2.9rem] flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-plus-pattern opacity-10" />
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-2xl">
                    <Play fill="currentColor" className="text-navy ml-1" size={32} />
                  </div>
                  
                  <div className="absolute bottom-10 left-10 text-left">
                    <div className="text-lg font-bold transition-colors group-hover:text-teal">Platform Walkthrough</div>
                    <div className="text-slate-500 text-sm">3:24 mins • Quality Vetted</div>
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
              <h2 className="text-4xl font-bold">Answers for Success</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="glass-card rounded-2xl overflow-hidden border-white/5">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-8 text-left flex items-center justify-between group"
                  >
                    <span className="font-bold text-lg group-hover:text-teal transition-colors">{faq.question}</span>
                    <ChevronDown size={20} className={cn("text-slate-500 transition-all duration-300", openFaq === idx ? "rotate-180 text-teal" : "")} />
                  </button>
                  <div className={cn("overflow-hidden transition-all duration-300", openFaq === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                    <div className="px-8 pb-8 text-slate-400 leading-relaxed">
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
            <h2 className="text-5xl md:text-7xl font-bold mb-12">Join the <span className="text-gradient">Evolution</span></h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register?role=client">
                <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-navy font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl shadow-white/10">
                  Hire Elite Talent
                </Button>
              </Link>
              <Link to="/register?role=freelancer">
                <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all">
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
