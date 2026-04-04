import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  ChevronDown,
  Check,
  X,
  CreditCard,
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

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      name: "Free",
      description: "Ideal for beginners",
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: null,
      borderColor: "border-white/10",
      highlighted: false,
      buttonVariant: "outline" as const,
      buttonClass: "border-white/20 text-white hover:bg-white/10",
      buttonText: "Start Free",
      features: [
        { text: "Public Profile", included: true },
        { text: "3 Portfolio Items", included: true },
        { text: "5 Project Bids/mo", included: true },
        { text: "Standard Support", included: true },
        { text: "Premium Badge", included: false },
        { text: "Advanced Analytics", included: false },
      ],
    },
    {
      name: "Pro",
      description: "For active professionals",
      monthlyPrice: 499,
      yearlyPrice: 4999,
      badge: { text: "Best For Growth", color: "bg-teal text-white" },
      borderColor: "border-teal/50",
      highlighted: true,
      buttonVariant: "default" as const,
      buttonClass: "bg-teal hover:bg-[#128a7f] text-white shadow-xl shadow-teal/20",
      buttonText: "Go Pro",
      features: [
        { text: "Everything in Free", included: true },
        { text: "Unlimited Portfolio", included: true },
        { text: "Unlimited Bidding", included: true },
        { text: "Featured Badge", included: true },
        { text: "Analytics Tools", included: true },
        { text: "Early Job Access", included: true },
      ],
    },
    {
      name: "Elite",
      description: "For industry leaders",
      monthlyPrice: 999,
      yearlyPrice: 9999,
      badge: { text: "Exclusive", color: "bg-royal-blue text-white" },
      borderColor: "border-royal-blue/50",
      highlighted: false,
      buttonVariant: "default" as const,
      buttonClass: "bg-white text-navy hover:bg-slate-100 shadow-xl",
      buttonText: "Join Elite",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Verified Elite Badge", included: true },
        { text: "Top Search Spot", included: true },
        { text: "Account Manager", included: true },
        { text: "Featured on Home", included: true },
        { text: "Priority Matching", included: true },
      ],
    },
  ];

  const comparisonFeatures = [
    { name: "Portfolio Capacity", free: "3", pro: "Unlimited", premium: "Unlimited" },
    { name: "Global Reach", free: true, pro: true, premium: true },
    { name: "Project Analytics", free: false, pro: true, premium: true },
    { name: "Search Boost", free: false, pro: "Medium", premium: "Maximum" },
    { name: "Direct Matching", free: false, pro: false, premium: true },
    { name: "Custom Domain", free: false, pro: false, premium: true },
  ];

  const faqs = [
    {
      question: "Can I cancel at any time?",
      answer: "Absolutely. You can cancel your subscription from your dashboard settings instantly. You will retain access until the end of your billing cycle.",
    },
    {
      question: "Which plan is right for me?",
      answer: "If you're just starting, the Free plan is great. However, professionals looking for consistent work usually choose the Pro plan for unlimited bids and better visibility.",
    },
    {
      question: "Do you offer custom enterprise pricing?",
      answer: "Yes, for agencies or large teams looking for bespoke solutions, please contact our support team for a custom quote.",
    },
  ];

  const getPrice = (plan: (typeof plans)[0]) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B15] font-sans text-slate-900 dark:text-white">
      <PublicNavbar variant="white" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white dark:bg-transparent border-b border-slate-200 dark:border-none">
        <div className="absolute inset-0 bg-plus-pattern opacity-[0.03] dark:opacity-[0.05]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-royal-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-xs font-bold text-teal dark:text-teal-light mb-8 uppercase tracking-widest">
              <CreditCard size={14} />
              Flexible Pricing
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-navy dark:text-white">
              Invest in Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">Professional Growth</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 px-2">
              Choose the plan that fits your ambition. Scale your creative business with the right tools and visibility.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <span className={cn("text-sm font-bold transition-all", billingCycle === "monthly" ? "text-navy dark:text-white" : "text-slate-400 dark:text-slate-500")}>Monthly</span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="w-16 h-8 bg-slate-200 dark:bg-white/10 rounded-full p-1 relative transition-all border border-slate-300 dark:border-white/10"
              >
                <div className={cn(
                  "w-6 h-6 bg-teal rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(20,184,166,0.5)]",
                  billingCycle === "yearly" ? "translate-x-8" : "translate-x-0"
                )} />
              </button>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-bold transition-all", billingCycle === "yearly" ? "text-navy dark:text-white" : "text-slate-400 dark:text-slate-500")}>Yearly</span>
                <span className="px-2 py-0.5 bg-teal/10 dark:bg-teal/20 text-teal text-[10px] font-bold rounded-full border border-teal/20 dark:border-teal/30">Save 20%</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="pb-32 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end">
            {plans.map((plan, idx) => (
              <AnimatedSection key={plan.name} delay={idx * 100}>
                <div className={cn(
                  "relative bg-white dark:bg-transparent dark:glass-card p-10 rounded-[2.5rem] transition-all duration-500 flex flex-col group border border-slate-200 dark:border-white/5",
                  plan.highlighted ? "border-teal/40 dark:border-teal/40 dark:bg-white/10 bg-white py-14 shadow-xl shadow-teal/5 ring-1 ring-teal/20" : "hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20",
                )}>
                  {plan.badge && (
                    <div className="absolute -top-4 left-10">
                      <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg", plan.badge.color)}>
                        {plan.badge.text}
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-navy dark:text-white">{plan.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-navy dark:text-white">₹{getPrice(plan).toLocaleString()}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-sm font-bold">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-12 flex-1">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-sm">
                        {feature.included ? (
                          <Check size={16} className="text-teal" />
                        ) : (
                          <X size={16} className="text-slate-200 dark:text-white/10" />
                        )}
                        <span className={feature.included ? "text-slate-600 dark:text-slate-300" : "text-slate-300 dark:text-white/20"}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className={cn("h-14 rounded-2xl font-bold text-base transition-all active:scale-95", plan.buttonClass)}>
                    {plan.buttonText}
                  </Button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COMPARISON SECTION */}
      <section className="py-32 bg-slate-50 dark:bg-white/5 border-y border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20 text-navy dark:text-white">
            <h2 className="text-4xl font-bold mb-4">Compare Features</h2>
            <p className="text-slate-500 dark:text-slate-400">Pick the perfect plan for your professional needs.</p>
          </div>

          <div className="max-w-4xl mx-auto bg-white dark:bg-transparent dark:glass-card shadow-lg dark:shadow-none rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-transparent">
                  <th className="p-8 text-sm font-bold text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Features</th>
                  <th className="p-8 text-center font-bold text-navy dark:text-white">Free</th>
                  <th className="p-8 text-center font-bold text-teal">Pro</th>
                  <th className="p-8 text-center font-bold text-royal-blue">Elite</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((f, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                    <td className="p-8 text-slate-700 dark:text-slate-300 font-medium">{f.name}</td>
                    <td className="p-8 text-center">
                      {typeof f.free === 'boolean' ? (f.free ? <Check className="mx-auto text-teal" size={20} /> : <X className="mx-auto text-slate-200 dark:text-white/20" size={20} />) : <span className="text-sm text-slate-500 dark:text-slate-400">{f.free}</span>}
                    </td>
                    <td className="p-8 text-center">
                      {typeof f.pro === 'boolean' ? (f.pro ? <Check className="mx-auto text-teal" size={20} /> : <X className="mx-auto text-slate-200 dark:text-white/20" size={20} />) : <span className="text-sm font-bold text-teal">{f.pro}</span>}
                    </td>
                    <td className="p-8 text-center">
                      {typeof f.premium === 'boolean' ? (f.premium ? <Check className="mx-auto text-teal" size={20} /> : <X className="mx-auto text-slate-200 dark:text-white/20" size={20} />) : <span className="text-sm font-bold text-royal-blue">{f.premium}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-20 text-navy dark:text-white">
              <span className="text-teal font-bold uppercase tracking-widest text-[10px] md:text-xs mb-4 block">Still Curious?</span>
              <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-transparent dark:glass-card shadow-sm dark:shadow-none rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 transition-all">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-8 text-left flex items-center justify-between group"
                  >
                    <span className="font-bold text-lg text-navy dark:text-white group-hover:text-teal transition-colors">{faq.question}</span>
                    <ChevronDown size={20} className={cn("text-slate-400 dark:text-slate-500 transition-all duration-300", openFaq === idx ? "rotate-180 text-teal" : "")} />
                  </button>
                  <div className={cn("overflow-hidden transition-all duration-300", openFaq === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
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

      {/* 5. FINAL CTA */}
      <section className="py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/5 dark:from-royal-blue/10 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <AnimatedSection>
            <h2 className="text-5xl md:text-7xl font-bold mb-10 text-navy dark:text-white">Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">Level Up?</span></h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register?role=freelancer">
                <Button size="lg" className="h-16 px-12 rounded-2xl bg-teal dark:bg-teal-light text-white font-bold text-lg hover:bg-[#128a7f] dark:hover:bg-teal transition-all hover:scale-105 shadow-xl shadow-teal/20 dark:shadow-teal/30">
                  Upgrade Today
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  Talk to Support
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Pricing;
