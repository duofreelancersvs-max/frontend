import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  ChevronDown,
  Check,
  X,
  CreditCard,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "react-toastify";
import { subscriptionService, paymentService } from "@/services";
import { publicService, type SubscriptionPlan } from "@/services/public.service";

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
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [displayPlans, setDisplayPlans] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Fetch dynamic public plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const dbPlans = await publicService.getSubscriptionPlans();
        
        const defaultAesthetics: Record<string, any> = {
          free: {
            description: "Ideal for beginners",
            badge: null,
            borderColor: "border-slate-200 dark:border-white/10",
            highlighted: false,
            buttonVariant: "outline",
            buttonClass: "border-navy/20 dark:border-white/20 text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-white/10",
            buttonText: "Start Free",
          },
          pro: {
            description: "For active professionals",
            badge: { text: "Best For Growth", color: "bg-teal text-white" },
            borderColor: "border-teal/50",
            highlighted: true,
            buttonVariant: "default",
            buttonClass: "bg-teal hover:bg-[#128a7f] text-white shadow-xl shadow-teal/20",
            buttonText: "Go Pro",
          },
        };

        const mappedPlans = dbPlans.map((dbPlan: SubscriptionPlan) => {
          const tier = (dbPlan.tier || "free").toLowerCase();
          const aesthetics = defaultAesthetics[tier] || defaultAesthetics.free;

          return {
            name: dbPlan.name,
            tier: dbPlan.tier,
            description: aesthetics.description,
            monthlyPrice: dbPlan.price,
            yearlyPrice: dbPlan.price * 10,
            badge: aesthetics.badge,
            borderColor: aesthetics.borderColor,
            highlighted: aesthetics.highlighted,
            buttonVariant: aesthetics.buttonVariant,
            buttonClass: aesthetics.buttonClass,
            buttonText: aesthetics.buttonText,
            features: dbPlan.features,
          };
        });

        if (mappedPlans.length > 0) {
          setDisplayPlans(mappedPlans);
        }
      } catch (error) {
        console.error("Error fetching public plans:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Redirection check for clients
  useEffect(() => {
    if (isAuthenticated && user?.role === "client") {
      toast.error("Pricing plans are only available for freelancers.");
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Upgrade, Downgrade & Checkout states
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);

  // Fetch current subscription for freelancer
  useEffect(() => {
    if (isAuthenticated && user?.role === "freelancer") {
      const fetchSub = async () => {
        try {
          const sub = await subscriptionService.getMySubscription();
          setCurrentSubscription(sub);
        } catch (error) {
          console.error("Error fetching subscription:", error);
        }
      };
      fetchSub();
    }
  }, [isAuthenticated, user]);

  const getButtonState = (planName: string) => {
    if (!isAuthenticated) {
      return {
        text: planName.toLowerCase() === "free" ? "Start Free" : "Go Pro",
        disabled: false,
      };
    }
    if (user?.role !== "freelancer") {
      return {
        text: planName.toLowerCase() === "free" ? "Start Free" : "Go Pro",
        disabled: true,
      };
    }

    const currentPlan = (currentSubscription?.plan || "free").toLowerCase();
    const cardPlan = planName.toLowerCase();
    const isCancelled = currentSubscription?.status === "cancelled";

    if (currentPlan === cardPlan) {
      return {
        text: isCancelled ? "Current Plan (Ending)" : "Current Plan",
        disabled: true,
      };
    }

    const planHierarchy = ["free", "pro"];
    const currentIdx = planHierarchy.indexOf(currentPlan);
    const cardIdx = planHierarchy.indexOf(cardPlan);

    if (isCancelled) {
      if (cardPlan === "free") {
        return { text: "Downgrade Pending", disabled: true };
      }
      if (cardIdx < currentIdx) {
        return { text: "Downgrade Plan", disabled: true };
      }
      return {
        text: "Upgrade to Pro",
        disabled: true,
      };
    }

    if (cardIdx > currentIdx) {
      return {
        text: "Upgrade to Pro",
        disabled: false,
      };
    } else {
      return { text: "Downgrade Plan", disabled: false };
    }
  };

  const fallbackPlans = [
    {
      name: "Free",
      description: "Ideal for beginners",
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: null,
      borderColor: "border-slate-200 dark:border-white/10",
      highlighted: false,
      buttonVariant: "outline" as const,
      buttonClass: "border-navy/20 dark:border-white/20 text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-white/10",
      buttonText: "Start Free",
      features: ["3 Portfolio Projects", "Global Reach"],
    },
    {
      name: "Pro",
      description: "For active professionals",
      monthlyPrice: 999,
      yearlyPrice: 9990,
      badge: { text: "Best For Growth", color: "bg-teal text-white" },
      borderColor: "border-teal/50",
      highlighted: true,
      buttonVariant: "default" as const,
      buttonClass: "bg-teal hover:bg-[#128a7f] text-white shadow-xl shadow-teal/20",
      buttonText: "Go Pro",
      features: ["Unlimited Portfolio", "Global Reach", "Project Analytics", "Search Boost", "Custom Profile URL"],
    }
  ];

  // We will use displayPlans if loaded, otherwise fallback to a loading state or nothing
  const plans = displayPlans.length > 0 ? displayPlans : (isLoading ? [
    {
      name: "Loading...",
      description: "Fetching plans",
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: null,
      borderColor: "border-slate-200 dark:border-white/10",
      highlighted: false,
      buttonVariant: "outline" as const,
      buttonClass: "opacity-50 cursor-not-allowed",
      buttonText: "Loading",
      features: ["Please wait..."],
    }
  ] : fallbackPlans);

  const comparisonFeatures = [
    {
      name: "Portfolio Capacity",
      free: "3",
      pro: "Unlimited",
    },
    { name: "Global Reach", free: true, pro: true },
    { name: "Project Analytics", free: false, pro: true },
    { name: "Search Boost", free: false, pro: "Maximum" },
    { name: "Custom Profile URL", free: false, pro: true },
  ];

  const faqs = [
    {
      question: "Can I cancel at any time?",
      answer:
        "Absolutely. You can cancel your subscription from your dashboard settings instantly. You will retain access until the end of your billing cycle.",
    },
    {
      question: "Which plan is right for me?",
      answer:
        "If you're just starting, the Free plan is great. However, professionals looking for consistent work usually choose the Pro plan for unlimited bids and better visibility.",
    },
    {
      question: "Do you offer custom enterprise pricing?",
      answer:
        "Yes, for agencies or large teams looking for bespoke solutions, please contact our support team for a custom quote.",
    },
  ];

  const handlePayment = async (planId: string) => {
    if (isProcessing) return;
    setIsProcessing(planId);
    try {
      const dbPlanId = planId.toLowerCase();
      const order = await paymentService.createOrder(dbPlanId);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Connect Me",
        description: "Freelancer Subscription",
        order_id: order.order_id,
        theme: { color: "#0d9488" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const result = await paymentService.verifyPayment({
              ...response,
              planId: dbPlanId,
            });
            if (result.status === "ok") {
              toast.success("Subscription activated successfully!");
              const sub = await subscriptionService.getMySubscription();
              setCurrentSubscription(sub);
            } else {
              toast.error(
                "Payment verification failed. Please contact support.",
              );
            }
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
          setIsProcessing(null);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setIsProcessing(null);
      });
      rzp.open();
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to initiate payment. Please try again.",
      );
      setIsProcessing(null);
    }
  };

  const handleCancelClick = () => {
    setIsDowngradeModalOpen(true);
  };

  const handleConfirmDowngrade = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      await subscriptionService.cancel();
      toast.success(
        "Subscription cancelled successfully. Your paid benefits remain active until the end of your billing cycle.",
      );
      const sub = await subscriptionService.getMySubscription();
      setCurrentSubscription(sub);
      setIsDowngradeModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to cancel subscription");
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePlanClick = async (planName: string) => {
    if (isAuthenticated && user?.role === "client") {
      toast.error("Subscriptions are only available for freelancers.");
      return;
    }

    if (!isAuthenticated) {
      navigate("/register?role=freelancer");
      return;
    }

    if (currentSubscription?.status === "cancelled") {
      toast.warning("Your subscription is already scheduled for downgrade.");
      return;
    }

    const currentPlan = (currentSubscription?.plan || "free").toLowerCase();
    const cardPlan = planName.toLowerCase();

    if (currentPlan === cardPlan) {
      return;
    }

    // Downgrade flow
    const planHierarchy = ["free", "pro"];
    const currentIdx = planHierarchy.indexOf(currentPlan);
    const cardIdx = planHierarchy.indexOf(cardPlan);

    if (cardPlan === "free") {
      handleCancelClick();
      return;
    }

    if (cardIdx < currentIdx) {
      handleCancelClick();
      return;
    }

    // Normal upgrade / purchase
    await handlePayment(planName);
  };

  const getPrice = (plan: (typeof plans)[0]) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white">
      <PublicNavbar dark />

      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-white dark:bg-transparent border-b border-slate-200 dark:border-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-royal-blue/5 dark:bg-royal-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-xs font-bold text-teal dark:text-teal-light mb-8 uppercase tracking-widest">
              <CreditCard size={14} />
              Flexible Pricing
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-navy dark:text-white">
              Invest in Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">
                Professional Growth
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 px-2">
              Choose the plan that fits your ambition. Scale your creative
              business with the right tools and visibility.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <span
                className={cn(
                  "text-sm font-bold transition-all",
                  billingCycle === "monthly"
                    ? "text-navy dark:text-white"
                    : "text-slate-400 dark:text-slate-500",
                )}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly",
                  )
                }
                className="w-16 h-8 bg-slate-200 dark:bg-white/10 rounded-full p-1 relative transition-all border border-slate-300 dark:border-white/10"
              >
                <div
                  className={cn(
                    "w-6 h-6 bg-teal rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(20,184,166,0.5)]",
                    billingCycle === "yearly"
                      ? "translate-x-8"
                      : "translate-x-0",
                  )}
                />
              </button>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-bold transition-all",
                    billingCycle === "yearly"
                      ? "text-navy dark:text-white"
                      : "text-slate-400 dark:text-slate-500",
                  )}
                >
                  Yearly
                </span>
                <span className="px-2 py-0.5 bg-teal/10 dark:bg-teal/20 text-teal text-xxs font-bold rounded-full border border-teal/20 dark:border-teal/30">
                  Save 20%
                </span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="pb-32 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-end">
            {plans.map((plan, idx) => (
              <AnimatedSection key={plan.name} delay={idx * 100}>
                <div
                  className={cn(
                    "relative bg-white dark:bg-transparent dark:glass-card p-10 rounded-[2.5rem] transition-all duration-500 flex flex-col group border border-slate-200 dark:border-white/5",
                    plan.highlighted
                      ? "border-teal/40 dark:border-teal/40 dark:bg-white/10 bg-white py-14 shadow-xl shadow-teal/5 ring-1 ring-teal/20"
                      : "hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20",
                  )}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-10">
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xxs font-bold uppercase tracking-widest shadow-lg",
                          plan.badge.color,
                        )}
                      >
                        {plan.badge.text}
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-navy dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-navy dark:text-white">
                        ₹{getPrice(plan).toLocaleString()}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-sm font-bold">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-12 flex-1">
                    {plan.features.map((feature: string, fIdx: number) => (
                      <li
                        key={fIdx}
                        className="flex items-center gap-3 text-sm"
                      >
                        <Check size={16} className="text-teal" />
                        <span className="text-slate-600 dark:text-slate-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {(() => {
                    const btnState = getButtonState(plan.name);
                    return (
                      <Button
                        className={cn(
                          "h-14 rounded-2xl font-bold text-base transition-all active:scale-95",
                          plan.buttonClass,
                        )}
                        onClick={() => handlePlanClick(plan.name)}
                        disabled={btnState.disabled}
                      >
                        {btnState.text}
                      </Button>
                    );
                  })()}
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
            <p className="text-slate-500 dark:text-slate-400">
              Pick the perfect plan for your professional needs.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white dark:bg-transparent dark:glass-card shadow-lg dark:shadow-none rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5">
            <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-transparent">
                    <th className="p-8 text-sm font-bold text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                      Features
                    </th>
                    <th className="p-8 text-center font-bold text-navy dark:text-white">
                      Free
                    </th>
                    <th className="p-8 text-center font-bold text-teal">Pro</th>
                  </tr>
                </thead>
              <tbody>
                {comparisonFeatures.map((f, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                  >
                    <td className="p-8 text-slate-700 dark:text-slate-300 font-medium">
                      {f.name}
                    </td>
                    <td className="p-8 text-center">
                      {typeof f.free === "boolean" ? (
                        f.free ? (
                          <Check className="mx-auto text-teal" size={20} />
                        ) : (
                          <X
                            className="mx-auto text-slate-200 dark:text-white/20"
                            size={20}
                          />
                        )
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {f.free}
                        </span>
                      )}
                    </td>
                    <td className="p-8 text-center">
                      {typeof f.pro === "boolean" ? (
                        f.pro ? (
                          <Check className="mx-auto text-teal" size={20} />
                        ) : (
                          <X
                            className="mx-auto text-slate-200 dark:text-white/20"
                            size={20}
                          />
                        )
                      ) : (
                        <span className="text-sm font-bold text-teal">
                          {f.pro}
                        </span>
                      )}
                    </td>
                    <td className="p-8 text-center">
                      {typeof f.pro === "boolean" ? (
                        f.pro ? (
                          <Check className="mx-auto text-teal" size={20} />
                        ) : (
                          <X
                            className="mx-auto text-slate-200 dark:text-white/20"
                            size={20}
                          />
                        )
                      ) : (
                        <span className="text-sm font-bold text-teal">
                          {f.pro}
                        </span>
                      )}
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
              <span className="text-teal font-bold uppercase tracking-widest text-xxs md:text-xs mb-4 block">
                Still Curious?
              </span>
              <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-transparent dark:glass-card shadow-sm dark:shadow-none rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 transition-all"
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
                        openFaq === idx ? "rotate-180 text-teal" : "",
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

      {/* 5. FINAL CTA */}
      <section className="py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/5 dark:from-royal-blue/10 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <AnimatedSection>
            <h2 className="text-5xl md:text-7xl font-bold mb-10 text-navy dark:text-white">
              Ready to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">
                Level Up?
              </span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register?role=freelancer">
                <Button
                  size="lg"
                  className="h-16 px-12 rounded-2xl bg-teal dark:bg-teal-light text-white font-bold text-lg hover:bg-[#128a7f] dark:hover:bg-teal transition-all hover:scale-105 shadow-xl shadow-teal/20 dark:shadow-teal/30"
                >
                  Upgrade Today
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-12 rounded-2xl border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  Talk to Support
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* DOWNGRADE / CANCELLATION CONFIRMATION MODAL */}
      {isDowngradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl rounded-3xl animate-scale-up">
            {/* Background glowing effects */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-[60px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-slate-500/10 rounded-full blur-[60px]" />

            <div className="p-8 relative z-10">
              <button
                onClick={() => setIsDowngradeModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-navy dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                  <X size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-navy dark:text-white">
                    Downgrade Plan
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Cancel or adjust your Pro subscription
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Info Warning Alert Box */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs md:text-sm text-red-500 flex gap-3">
                  <Sparkles size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">
                      Paid Value Fully Protected!
                    </p>
                    <p className="leading-relaxed opacity-90">
                      You will retain all active benefits of your current{" "}
                      <strong className="capitalize">
                        {currentSubscription?.plan || "Pro"}
                      </strong>{" "}
                      plan until the end of your billing cycle on:
                    </p>
                    <p className="font-extrabold mt-2 text-sm">
                      {currentSubscription?.endDate
                        ? new Date(
                            currentSubscription.endDate,
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "the end of your cycle"}
                    </p>
                  </div>
                </div>

                {/* Reset Period Note */}
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                  After your billing cycle concludes, you will automatically
                  transition to the Free plan. You won't be charged again, and
                  you can re-subscribe to a lower plan (like Pro) at any time.
                </p>

                {/* CTA Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl border-slate-200 dark:border-white/10 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                    onClick={() => setIsDowngradeModalOpen(false)}
                  >
                    Keep Pro
                  </Button>
                  <Button
                    className="flex-1 h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold shadow-lg shadow-red-500/20"
                    onClick={handleConfirmDowngrade}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : null}
                    Confirm Downgrade
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
};

export default Pricing;
