import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  ChevronRight,
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
  MessageSquare,
  Star,
  HelpCircle,
  ArrowRight,
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
  const [activeTab, setActiveTab] = useState<"clients" | "freelancers">(
    "clients",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const clientSteps = [
    {
      step: 1,
      title: "Post Your Project",
      description:
        "Describe your project requirements, set your budget, and specify your timeline. It takes just 2 minutes to create a detailed project brief that attracts the right talent.",
      icon: FileEdit,
      features: [
        "Detailed project description",
        "Budget range setting",
        "Skill requirements",
        "Deadline specification",
      ],
    },
    {
      step: 2,
      title: "Review Proposals",
      description:
        "Receive proposals from verified freelancers within hours. Compare portfolios, ratings, and reviews to find the perfect match for your project.",
      icon: Users,
      features: [
        "View freelancer portfolios",
        "Compare pricing & timelines",
        "Check ratings & reviews",
        "Message candidates",
      ],
    },
    {
      step: 3,
      title: "Hire & Collaborate",
      description:
        "Select your preferred freelancer, agree on terms, and start working together. Our secure platform handles payments and communication seamlessly.",
      icon: CheckCircle,
      features: [
        "Secure contract creation",
        "Milestone-based payments",
        "Built-in messaging",
        "File sharing & feedback",
      ],
    },
  ];

  const freelancerSteps = [
    {
      step: 1,
      title: "Create Your Profile",
      description:
        "Build a compelling profile that showcases your skills, experience, and portfolio. Get verified to stand out and attract more clients.",
      icon: UserPlus,
      features: [
        "Add portfolio items",
        "Showcase your expertise",
        "Get verified badge",
        "Highlight top skills",
      ],
    },
    {
      step: 2,
      title: "Find & Apply to Projects",
      description:
        "Browse projects matching your skills or get notified when new opportunities arise. Submit compelling proposals to win clients.",
      icon: Search,
      features: [
        "Smart project matching",
        "Instant notifications",
        "Easy proposal submission",
        "Track applications",
      ],
    },
    {
      step: 3,
      title: "Deliver & Get Paid",
      description:
        "Complete the work, get client approval, and receive payment directly to your bank account. Build your reputation with positive reviews.",
      icon: Wallet,
      features: [
        "Secure milestone payments",
        "Direct bank transfer",
        "Build your ratings",
        "Grow your client base",
      ],
    },
  ];

  const faqs = [
    {
      question: "How do I get started as a client?",
      answer:
        "Simply create a free account, post your project with details about your requirements, budget, and timeline. You'll start receiving proposals from qualified freelancers within hours.",
    },
    {
      question: "Is there a fee to post projects?",
      answer:
        "Posting projects is completely free for clients. We only charge a small service fee when you hire a freelancer and make a payment.",
    },
    {
      question: "How are freelancers verified?",
      answer:
        "All freelancers go through our verification process which includes identity verification (Aadhaar/PAN), portfolio review, and skill assessment. Verified freelancers display a special badge on their profile.",
    },
    {
      question: "How do payments work?",
      answer:
        "Payments are processed securely through Razorpay. For fixed-price projects, you can set up milestone payments. The payment is held in escrow until you approve the work.",
    },
    {
      question: "What if I'm not satisfied with the work?",
      answer:
        "We have a dispute resolution process to handle any issues. If the work doesn't meet the agreed requirements, you can request revisions or escalate to our support team.",
    },
    {
      question: "Can freelancers work remotely?",
      answer:
        "Yes! Most projects on ConnectMeIndia are remote-friendly. However, some clients may prefer on-site work, which will be specified in the project requirements.",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Secure Payments",
      desc: "Escrow-protected transactions",
    },
    { icon: Clock, title: "Fast Hiring", desc: "Find talent within 24 hours" },
    {
      icon: Star,
      title: "Quality Assured",
      desc: "Verified professionals only",
    },
    {
      icon: MessageSquare,
      title: "Easy Communication",
      desc: "Built-in chat & file sharing",
    },
  ];

  const activeSteps = activeTab === "clients" ? clientSteps : freelancerSteps;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      <PublicNavbar variant="white" />

      {/* 1. PAGE HEADER */}
      <section className="relative py-20 bg-[#050B15] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue" />
        <div className="absolute inset-0 bg-plus-pattern opacity-[0.05]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-royal-blue/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-white">How It Works</span>
          </nav>

          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              How It{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
                Works
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-10">
              Get started in 3 simple steps. Whether you're hiring talent or
              looking for work, we make the process seamless.
            </p>

            {/* Quick Benefits */}
            <div className="flex flex-wrap justify-center gap-6">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-white/80"
                >
                  <benefit.icon size={18} className="text-teal-light" />
                  <span className="text-sm font-medium">{benefit.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. ROLE TABS */}
      <section className="sticky top-16 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-center">
            <div className="inline-flex bg-slate-100 rounded-xl p-1.5 my-4">
              <button
                onClick={() => setActiveTab("clients")}
                className={cn(
                  "px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300",
                  activeTab === "clients"
                    ? "bg-white text-navy shadow-md"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <Briefcase size={16} className="inline mr-2" />
                For Clients
              </button>
              <button
                onClick={() => setActiveTab("freelancers")}
                className={cn(
                  "px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300",
                  activeTab === "freelancers"
                    ? "bg-white text-navy shadow-md"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <UserPlus size={16} className="inline mr-2" />
                For Freelancers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 & 4. STEPS SECTION */}
      <section
        className={cn(
          "py-24 transition-colors duration-500",
          activeTab === "freelancers" ? "bg-slate-50" : "bg-white",
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-teal/10 text-teal rounded-full text-sm font-semibold mb-4">
                {activeTab === "clients"
                  ? "Hiring Made Easy"
                  : "Start Earning Today"}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mb-4">
                {activeTab === "clients"
                  ? "Hire Top Talent"
                  : "Find Great Projects"}
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                {activeTab === "clients"
                  ? "Post your project and connect with skilled freelancers in minutes"
                  : "Showcase your skills and start working on exciting projects"}
              </p>
            </div>
          </AnimatedSection>

          {/* Steps */}
          <div className="max-w-5xl mx-auto space-y-16">
            {activeSteps.map((step, idx) => (
              <AnimatedSection key={step.step} delay={idx * 150}>
                <div
                  className={cn(
                    "flex flex-col lg:flex-row gap-12 items-center",
                    idx % 2 === 1 ? "lg:flex-row-reverse" : "",
                  )}
                >
                  {/* Content */}
                  <div className="flex-1">
                    {/* Step Badge */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal/30">
                        {step.step}
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-teal/50 to-transparent" />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-navy mb-4">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-lg leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Features List */}
                    <ul className="grid grid-cols-2 gap-3">
                      {step.features.map((feature, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-center gap-2 text-slate-600"
                        >
                          <CheckCircle
                            size={16}
                            className="text-teal flex-shrink-0"
                          />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Illustration Card */}
                  <div className="flex-1 w-full max-w-md">
                    <div className="relative">
                      <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden group">
                        {/* Icon */}
                        <div
                          className={cn(
                            "w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110",
                            idx === 0
                              ? "bg-gradient-to-br from-royal-blue to-blue-600"
                              : idx === 1
                                ? "bg-gradient-to-br from-teal to-emerald-500"
                                : "bg-gradient-to-br from-gold to-orange-500",
                          )}
                        >
                          <step.icon size={56} className="text-white" />
                        </div>
                      </div>

                      {/* Floating Elements */}
                      {idx === 0 && (
                        <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 animate-float">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-teal rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-navy">
                              2 min to post
                            </span>
                          </div>
                        </div>
                      )}
                      {idx === 1 && (
                        <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-float-delayed">
                          <div className="flex items-center gap-2">
                            <Star className="text-gold fill-gold" size={16} />
                            <span className="text-sm font-medium text-navy">
                              4.9 avg rating
                            </span>
                          </div>
                        </div>
                      )}
                      {idx === 2 && (
                        <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-float">
                          <div className="flex items-center gap-2">
                            <Shield className="text-teal" size={16} />
                            <span className="text-sm font-medium text-navy">
                              100% Secure
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* CTA after steps */}
          <AnimatedSection delay={500}>
            <div className="text-center mt-16">
              <Button
                size="lg"
                className="bg-teal hover:bg-teal-light text-white font-bold text-lg px-10 py-7 rounded-xl shadow-xl shadow-teal/25 hover:-translate-y-1 transition-all"
              >
                {activeTab === "clients"
                  ? "Post Your First Project"
                  : "Create Your Profile"}
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 5. VIDEO TUTORIAL SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-royal-blue/10 text-royal-blue rounded-full text-sm font-semibold mb-4">
                <Play size={14} className="inline mr-1" />
                Video Tutorial
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mb-4">
                Watch How It Works
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                See the platform in action with our quick walkthrough video
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-navy to-royal-blue overflow-hidden relative group cursor-pointer shadow-2xl shadow-navy/20">
                {/* Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play
                      className="text-navy ml-1"
                      size={40}
                      fill="currentColor"
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h3 className="font-bold text-xl">
                        Platform Walkthrough
                      </h3>
                      <p className="text-white/70 text-sm">3 minute overview</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-white/70">
                        <Clock size={16} />
                        <span className="text-sm">3:24</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-semibold mb-4">
                <HelpCircle size={14} className="inline mr-1" />
                FAQ
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Everything you need to know about using ConnectMeIndia
              </p>
            </div>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <AnimatedSection key={idx} delay={idx * 50}>
                <div className="mb-4">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className={cn(
                      "w-full flex items-center justify-between p-6 bg-white rounded-2xl text-left transition-all duration-300",
                      openFaq === idx
                        ? "shadow-lg ring-2 ring-teal/20"
                        : "shadow-sm hover:shadow-md",
                    )}
                  >
                    <span className="font-semibold text-navy pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={cn(
                        "text-slate-400 transition-transform duration-300 flex-shrink-0",
                        openFaq === idx ? "rotate-180 text-teal" : "",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      openFaq === idx
                        ? "max-h-60 opacity-100"
                        : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="p-6 pt-4 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={300}>
            <div className="text-center mt-12">
              <p className="text-slate-500 mb-4">Still have questions?</p>
              <Link to="/contact">
                <Button
                  variant="outline"
                  className="border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white"
                >
                  Contact Support
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-24 bg-gradient-to-r from-teal to-teal-light relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-white/90 text-xl mb-10 leading-relaxed">
                Join thousands of clients and freelancers already using
                ConnectMeIndia to transform how creative work gets done.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-teal hover:bg-slate-100 font-bold text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <Briefcase size={20} className="mr-2" />
                  Hire Talent
                </Button>
                <Button
                  size="lg"
                  className="bg-transparent border border-white/30 text-white hover:bg-white/10 font-bold text-lg px-10 py-7 rounded-xl"
                >
                  <UserPlus size={20} className="mr-2" />
                  Become a Freelancer
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 8. FOOTER */}
      <PublicFooter />

      {/* Custom CSS for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default HowItWorks;
