import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/shared/Logo";
import {
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Crown,
  Zap,
  Star,
  Shield,
  CreditCard,
  Smartphone,
  Building,
  HelpCircle,
  ArrowRight,
  MapPin,
  Twitter,
  Linkedin,
  Sparkles,
  MessageSquare,
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: null,
      borderColor: "border-slate-200",
      highlighted: false,
      buttonVariant: "outline" as const,
      buttonClass:
        "border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white",
      buttonText: "Get Started",
      features: [
        { text: "Create profile", included: true },
        { text: "Add up to 3 portfolio items", included: true },
        { text: "Apply to 5 projects/month", included: true },
        { text: "Basic support", included: true },
        { text: "Profile badge", included: false },
        { text: "Analytics dashboard", included: false },
        { text: "Priority support", included: false },
        { text: "Custom portfolio URL", included: false },
      ],
    },
    {
      name: "Pro",
      description: "For serious freelancers",
      monthlyPrice: 499,
      yearlyPrice: 4999,
      badge: { text: "Most Popular", color: "bg-teal text-white" },
      borderColor: "border-teal",
      highlighted: true,
      buttonVariant: "default" as const,
      buttonClass:
        "bg-teal hover:bg-teal-light text-white shadow-lg shadow-teal/25",
      buttonText: "Subscribe Now",
      features: [
        { text: "Everything in Free", included: true },
        { text: "Unlimited portfolio items", included: true },
        { text: "Unlimited applications", included: true },
        { text: "Priority support", included: true },
        { text: "Featured profile badge", included: true },
        { text: "Analytics dashboard", included: true },
        { text: "Early access to projects", included: true },
        { text: "Custom portfolio URL", included: false },
      ],
    },
    {
      name: "Premium",
      description: "For top-tier professionals",
      monthlyPrice: 999,
      yearlyPrice: 9999,
      badge: { text: "Best Value", color: "bg-gold text-white" },
      borderColor: "border-gold",
      highlighted: false,
      buttonVariant: "default" as const,
      buttonClass: "bg-royal-blue hover:bg-royal-blue/90 text-white",
      buttonText: "Go Premium",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Verified badge", included: true },
        { text: "Top search ranking", included: true },
        { text: "Custom portfolio URL", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Featured on homepage", included: true },
        { text: "1-on-1 profile review", included: true },
        { text: "Priority project matching", included: true },
      ],
    },
  ];

  const comparisonFeatures = [
    {
      name: "Portfolio Items",
      free: "3",
      pro: "Unlimited",
      premium: "Unlimited",
    },
    {
      name: "Monthly Applications",
      free: "5",
      pro: "Unlimited",
      premium: "Unlimited",
    },
    {
      name: "Profile Badge",
      free: false,
      pro: "Featured",
      premium: "Verified",
    },
    { name: "Analytics Dashboard", free: false, pro: true, premium: true },
    { name: "Priority Support", free: false, pro: true, premium: true },
    { name: "Early Project Access", free: false, pro: true, premium: true },
    { name: "Custom Portfolio URL", free: false, pro: false, premium: true },
    {
      name: "Search Ranking Boost",
      free: false,
      pro: "Medium",
      premium: "Top",
    },
    { name: "Account Manager", free: false, pro: false, premium: true },
    { name: "Homepage Feature", free: false, pro: false, premium: true },
  ];

  const testimonials = [
    {
      quote:
        "The Pro plan paid for itself in the first week. I got 3 new clients within days of upgrading!",
      author: "Karthik M.",
      role: "VFX Artist",
      plan: "Pro",
      avatar: "KM",
    },
    {
      quote:
        "Being verified and featured on the homepage brought me consistent high-quality leads. Worth every rupee.",
      author: "Sneha R.",
      role: "Video Editor",
      plan: "Premium",
      avatar: "SR",
    },
    {
      quote:
        "The analytics dashboard helped me understand what clients want. My proposals got 50% more responses.",
      author: "Rahul P.",
      role: "3D Designer",
      plan: "Pro",
      avatar: "RP",
    },
  ];

  const faqs = [
    {
      question: "Can I switch plans anytime?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, the change will take effect at the end of your current billing cycle.",
    },
    {
      question: "Is there a free trial for paid plans?",
      answer:
        "We offer a 7-day free trial for the Pro plan so you can experience the benefits before committing. No credit card required to start.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards, UPI, net banking, and wallets through our secure payment partner Razorpay. All payments are processed in INR.",
    },
    {
      question: "Can I cancel my subscription?",
      answer:
        "You can cancel anytime from your account settings. You'll continue to have access to paid features until the end of your billing period.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a full refund within 7 days of purchase if you're not satisfied. After 7 days, we provide prorated refunds for annual plans.",
    },
    {
      question: "Are there any hidden fees?",
      answer:
        "No hidden fees! The subscription price covers all features listed. We charge a small platform fee (2-5%) only when you get paid for a project.",
    },
  ];

  const getPrice = (plan: (typeof plans)[0]) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: (typeof plans)[0]) => {
    if (plan.monthlyPrice === 0) return 0;
    const yearlyEquivalent = plan.monthlyPrice * 12;
    return yearlyEquivalent - plan.yearlyPrice;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Logo size="sm" />

            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                About
              </Link>
              <Link
                to="/how-it-works"
                className="text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                How It Works
              </Link>
              <Link
                to="/pricing"
                className="text-sm font-medium text-royal-blue"
              >
                Pricing
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-royal-blue font-semibold">
                Log In
              </Button>
              <Button className="bg-teal hover:bg-teal-light text-white font-semibold px-6">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
            <span className="text-white">Pricing</span>
          </nav>

          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Choose Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
                Plan
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Unlock more features and get hired faster. Start free, upgrade
              when you're ready.
            </p>
          </div>
        </div>
      </section>

      {/* 2. BILLING TOGGLE */}
      <section className="py-8 bg-white sticky top-[72px] z-40 border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-4 bg-slate-100 rounded-xl p-1.5">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300",
                  billingCycle === "monthly"
                    ? "bg-white text-navy shadow-md"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={cn(
                  "px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 relative",
                  billingCycle === "yearly"
                    ? "bg-white text-navy shadow-md"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                Yearly
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-teal text-white text-xs font-bold rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRICING CARDS */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <AnimatedSection key={plan.name} delay={idx * 100}>
                <div
                  className={cn(
                    "relative bg-white rounded-3xl p-8 transition-all duration-500 h-full flex flex-col",
                    plan.highlighted
                      ? "border-2 shadow-2xl shadow-teal/10 md:-mt-4 md:mb-4"
                      : "border shadow-sm hover:shadow-xl",
                    plan.borderColor,
                  )}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-bold",
                          plan.badge.color,
                        )}
                      >
                        {plan.badge.text}
                      </span>
                    </div>
                  )}

                  {/* Plan Icon */}
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
                      plan.name === "Free"
                        ? "bg-slate-100"
                        : plan.name === "Pro"
                          ? "bg-teal/10"
                          : "bg-gold/10",
                    )}
                  >
                    {plan.name === "Free" && (
                      <Zap className="text-slate-500" size={28} />
                    )}
                    {plan.name === "Pro" && (
                      <Sparkles className="text-teal" size={28} />
                    )}
                    {plan.name === "Premium" && (
                      <Crown className="text-gold" size={28} />
                    )}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-navy mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-navy">
                        ₹{getPrice(plan).toLocaleString()}
                      </span>
                      <span className="text-slate-500">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    {billingCycle === "yearly" && getSavings(plan) > 0 && (
                      <p className="text-teal text-sm font-medium mt-1">
                        Save ₹{getSavings(plan).toLocaleString()}/year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check
                            size={18}
                            className="text-teal flex-shrink-0 mt-0.5"
                          />
                        ) : (
                          <X
                            size={18}
                            className="text-slate-300 flex-shrink-0 mt-0.5"
                          />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            feature.included
                              ? "text-slate-700"
                              : "text-slate-400",
                          )}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={cn(
                      "w-full py-6 font-semibold text-base",
                      plan.buttonClass,
                    )}
                    variant={plan.buttonVariant}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 4. COMPARISON TABLE */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                Compare Plans
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                See all features side by side to choose the right plan for you
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-4 px-6 text-left text-navy font-semibold">
                      Features
                    </th>
                    <th className="py-4 px-6 text-center">
                      <div className="text-navy font-semibold">Free</div>
                      <div className="text-slate-500 text-sm">₹0</div>
                    </th>
                    <th className="py-4 px-6 text-center bg-teal/5 rounded-t-2xl">
                      <div className="text-navy font-semibold">Pro</div>
                      <div className="text-teal text-sm font-medium">
                        ₹499/mo
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center">
                      <div className="text-navy font-semibold">Premium</div>
                      <div className="text-gold text-sm font-medium">
                        ₹999/mo
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-4 px-6 text-slate-700">
                        {feature.name}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {typeof feature.free === "boolean" ? (
                          feature.free ? (
                            <Check size={20} className="text-teal mx-auto" />
                          ) : (
                            <X size={20} className="text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-slate-600 font-medium">
                            {feature.free}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center bg-teal/5">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <Check size={20} className="text-teal mx-auto" />
                          ) : (
                            <X size={20} className="text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-teal font-medium">
                            {feature.pro}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {typeof feature.premium === "boolean" ? (
                          feature.premium ? (
                            <Check size={20} className="text-teal mx-auto" />
                          ) : (
                            <X size={20} className="text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-gold font-medium">
                            {feature.premium}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 5. PAYMENT METHODS */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="text-teal" size={24} />
                <h2 className="text-2xl font-bold text-navy">
                  Secure Payments Powered By
                </h2>
              </div>
              <p className="text-slate-500">
                All transactions are encrypted and secure
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {/* Razorpay */}
              <div className="bg-white px-8 py-4 rounded-xl shadow-sm border border-slate-100">
                <div className="text-2xl font-bold text-royal-blue">
                  Razorpay
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100">
                  <CreditCard size={20} className="text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">
                    Cards
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100">
                  <Smartphone size={20} className="text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">
                    UPI
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100">
                  <Building size={20} className="text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">
                    Net Banking
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
                <Star size={14} className="inline mr-1 fill-current" />
                Success Stories
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                Loved by Freelancers
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                See how our paid plans helped freelancers grow their business
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="bg-slate-50 rounded-2xl p-8 h-full flex flex-col">
                  {/* Plan Badge */}
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold w-fit mb-6",
                      testimonial.plan === "Pro"
                        ? "bg-teal/10 text-teal"
                        : "bg-gold/10 text-gold",
                    )}
                  >
                    {testimonial.plan === "Pro" ? (
                      <Sparkles size={12} />
                    ) : (
                      <Crown size={12} />
                    )}
                    {testimonial.plan} Plan
                  </div>

                  {/* Quote */}
                  <p className="text-slate-700 text-lg leading-relaxed mb-8 flex-1">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-navy">
                        {testimonial.author}
                      </div>
                      <div className="text-slate-500 text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-royal-blue/10 text-royal-blue rounded-full text-sm font-semibold mb-4">
                <HelpCircle size={14} className="inline mr-1" />
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                Pricing Questions
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Everything you need to know about our pricing and plans
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
        </div>
      </section>

      {/* 8. CTA */}
      <section className="py-24 bg-gradient-to-br from-royal-blue to-navy relative overflow-hidden">
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
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Still Have Questions?
              </h2>
              <p className="text-white/80 text-xl mb-10 leading-relaxed">
                Our team is here to help you choose the right plan for your
                needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button
                    size="lg"
                    className="bg-white text-royal-blue hover:bg-slate-100 font-bold text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                  >
                    <MessageSquare size={20} className="mr-2" />
                    Contact Us
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-bold text-lg px-10 py-7 rounded-xl"
                >
                  Start Free Trial
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-navy text-white pt-20 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-lg">
                  C
                </div>
                <div>
                  <span className="text-lg font-bold">ConnectMeIndia</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The premier marketplace for creative professionals in Telangana
                and Andhra Pradesh.
              </p>
              <div className="flex gap-3">
                {[Twitter, Linkedin].map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-teal flex items-center justify-center transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "For Clients",
                links: ["Find Talent", "Post Project", "Pricing", "Enterprise"],
              },
              {
                title: "For Freelancers",
                links: [
                  "Create Profile",
                  "Browse Jobs",
                  "Subscription",
                  "Resources",
                ],
              },
              {
                title: "Support",
                links: ["Contact Us", "Help Center", "Privacy Policy", "Terms"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-lg mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-slate-400 hover:text-teal transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 ConnectMeIndia. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin size={14} />
              <span>Made with ❤️ in Hyderabad</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
