import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Star,
  User,
  X,
  Check,
  Crown,
  Zap,
  Shield,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Lock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { subscriptionService, paymentService } from "@/services";
import type { Subscription } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import DashboardHeader from "@/components/layouts/DashboardHeader";

// Plan features
const planFeatures = {
  free: [
    { feature: "Profile Visibility", included: true },
    { feature: "Browse Projects", included: true },
    { feature: "5 Applications/month", included: true },
    { feature: "Basic Search Filters", included: true },
    { feature: "Standard Support", included: true },
    { feature: "Unlimited Applications", included: false },
    { feature: "Priority in Search", included: false },
    { feature: "Featured Badge", included: false },
    { feature: "Direct Messaging", included: false },
    { feature: "Analytics Dashboard", included: false },
    { feature: "Early Access to Projects", included: false },
    { feature: "Dedicated Account Manager", included: false },
  ],
  pro: [
    { feature: "Profile Visibility", included: true },
    { feature: "Browse Projects", included: true },
    { feature: "50 Applications/month", included: true },
    { feature: "Advanced Search Filters", included: true },
    { feature: "Priority Support", included: true },
    { feature: "Unlimited Applications", included: false },
    { feature: "Priority in Search", included: true },
    { feature: "Pro Badge", included: true },
    { feature: "Direct Messaging", included: true },
    { feature: "Analytics Dashboard", included: true },
    { feature: "Early Access to Projects", included: false },
    { feature: "Dedicated Account Manager", included: false },
  ],
  premium: [
    { feature: "Profile Visibility", included: true },
    { feature: "Browse Projects", included: true },
    { feature: "Unlimited Applications", included: true },
    { feature: "Advanced Search Filters", included: true },
    { feature: "24/7 Premium Support", included: true },
    { feature: "Unlimited Applications", included: true },
    { feature: "Top Priority in Search", included: true },
    { feature: "Premium Badge", included: true },
    { feature: "Direct Messaging", included: true },
    { feature: "Advanced Analytics", included: true },
    { feature: "Early Access to Projects", included: true },
    { feature: "Dedicated Account Manager", included: true },
  ],
};

// Comparison table data
const comparisonFeatures = [
  {
    name: "Profile Visibility",
    free: "Basic",
    pro: "Enhanced",
    premium: "Maximum",
  },
  { name: "Monthly Applications", free: "5", pro: "50", premium: "Unlimited" },
  {
    name: "Search Priority",
    free: "Standard",
    pro: "Priority",
    premium: "Top Priority",
  },
  {
    name: "Profile Badge",
    free: "—",
    pro: "Pro Badge",
    premium: "Premium Badge",
  },
  { name: "Direct Messaging", free: false, pro: true, premium: true },
  { name: "Video Calls", free: false, pro: true, premium: true },
  {
    name: "Analytics Dashboard",
    free: false,
    pro: "Basic",
    premium: "Advanced",
  },
  { name: "Early Project Access", free: false, pro: false, premium: true },
  {
    name: "Featured in Directory",
    free: false,
    pro: "Weekly",
    premium: "Daily",
  },
  {
    name: "Skill Endorsements",
    free: "3 max",
    pro: "10 max",
    premium: "Unlimited",
  },
  { name: "Portfolio Projects", free: "5", pro: "20", premium: "Unlimited" },
  {
    name: "Response Time SLA",
    free: "48 hours",
    pro: "24 hours",
    premium: "4 hours",
  },
  { name: "Account Manager", free: false, pro: false, premium: true },
  { name: "Custom Profile URL", free: false, pro: true, premium: true },
];

// FAQ data
const faqItems = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. Your benefits will continue until the end of your billing period. No questions asked, no hidden fees.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI, Net Banking, and popular wallets like Paytm and PhonePe through our secure Razorpay integration.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Absolutely! You can upgrade anytime and the prorated amount will be calculated. For downgrades, changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Is there a free trial for Pro or Premium?",
    answer:
      "Yes! New users get a 7-day free trial of Pro features. No credit card required to start the trial.",
  },
  {
    question: "What happens to my applications if I downgrade?",
    answer:
      "Your existing applications remain active. However, you won't be able to submit new applications beyond your new plan's limit until the next month.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 7-day money-back guarantee for first-time subscribers. If you're not satisfied, contact support within 7 days of purchase for a full refund.",
  },
];

// Testimonials
const testimonials = [
  {
    name: "Priya Sharma",
    role: "Video Editor",
    plan: "Pro",
    quote:
      "Since upgrading to Pro, I've seen a 3x increase in project invitations. The priority search feature really works!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Motion Graphics Artist",
    plan: "Premium",
    quote:
      "The dedicated account manager helped me land my biggest client ever. Premium is worth every rupee.",
    rating: 5,
  },
  {
    name: "Anjali Patel",
    role: "3D Animator",
    plan: "Pro",
    quote:
      "The analytics dashboard helped me understand what clients are looking for. My profile views doubled!",
    rating: 5,
  },
];

const FreelancerSubscription = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSwitchingFromPremium, setIsSwitchingFromPremium] = useState(false);

  // Upgrade Plan specific states
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradePreview, setUpgradePreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);


  const handlePayment = useCallback(async (planId: string) => {
    if (isProcessing) return;
    setIsProcessing(planId);
    try {
      const order = await paymentService.createOrder(planId);

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
              planId,
            });
            if (result.status === "ok") {
              toast.success("Subscription activated successfully!");
              const sub = await subscriptionService.getMySubscription();
              setCurrentSubscription(sub);
            } else {
              toast.error("Payment verification failed. Please contact support.");
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

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setIsProcessing(null);
      });
      rzp.open();
    } catch (error: any) {
      toast.error(error?.message || "Failed to initiate payment. Please try again.");
      setIsProcessing(null);
    }
  }, [isProcessing]);

  const handleCancel = useCallback(async () => {
    if (isCancelling) return;
    if (currentSubscription?.status === "cancelled") {
      toast.warning("Your subscription is already scheduled for downgrade.");
      return;
    }
    setIsCancelling(true);
    try {
      await subscriptionService.cancel();
      toast.success("Subscription cancelled. You are now on the Free plan.");
      const sub = await subscriptionService.getMySubscription();
      setCurrentSubscription(sub);
    } catch {
      toast.error("Failed to cancel subscription");
    }
    setIsCancelling(false);
  }, [isCancelling, currentSubscription]);

  const handleSwitchFromPremiumToPro = useCallback(async () => {
    if (isSwitchingFromPremium) return;
    if (currentSubscription?.status === "cancelled") {
      toast.warning("Your subscription is already scheduled for downgrade.");
      return;
    }
    setIsSwitchingFromPremium(true);
    try {
      await subscriptionService.cancel();
      toast.success("Downgraded from Premium. Click Upgrade to Pro to subscribe.");
      setIsSwitchingFromPremium(false);
      const sub = await subscriptionService.getMySubscription();
      setCurrentSubscription(sub);
    } catch {
      toast.error("Failed to cancel Premium subscription");
      setIsSwitchingFromPremium(false);
    }
  }, [isSwitchingFromPremium, currentSubscription]);

  const handlePaymentClick = useCallback(async (planId: string) => {
    if (currentSubscription?.status === "cancelled") {
      toast.warning("Your subscription is already scheduled for downgrade.");
      return;
    }
    const activePlan = currentSubscription?.plan || "free";
    if (activePlan.toLowerCase() === "pro" && planId.toLowerCase() === "premium") {
      setIsUpgradeModalOpen(true);
      setIsLoadingPreview(true);
      try {
        const preview = await paymentService.getUpgradePreview(planId);
        setUpgradePreview(preview);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load upgrade preview details");
        setIsUpgradeModalOpen(false);
      } finally {
        setIsLoadingPreview(false);
      }
    } else {
      handlePayment(planId);
    }
  }, [currentSubscription, handlePayment]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await subscriptionService.getMySubscription();
        setCurrentSubscription(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };
    fetchSubscription();
  }, []);

  const currentPlan = (currentSubscription?.plan || "free") as
    | "free"
    | "pro"
    | "premium";
  const renewalDate = currentSubscription?.endDate
    ? new Date(currentSubscription.endDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const prices = {
    pro: {
      monthly: 499,
      yearly: 4999,
    },
    premium: {
      monthly: 999,
      yearly: 9999,
    },
  };

  const yearlySavings = {
    pro: Math.round(
      ((prices.pro.monthly * 12 - prices.pro.yearly) /
        (prices.pro.monthly * 12)) *
        100,
    ),
    premium: Math.round(
      ((prices.premium.monthly * 12 - prices.premium.yearly) /
        (prices.premium.monthly * 12)) *
        100,
    ),
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-background">
      <div className="w-full">
        {/* Header Bar */}
        <DashboardHeader
          title="Choose Your Plan"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Main Content Area */}
        <main className="px-6 lg:px-8 py-6 lg:py-8 space-y-8">
          {/* CURRENT PLAN CARD (if subscribed) */}
          {currentPlan !== "free" && (
            <section className="bg-gradient-to-r from-teal/10 to-teal-light/10 dark:from-teal/20 dark:to-teal-light/20 rounded-2xl border border-teal/20 dark:border-teal/30 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal flex items-center justify-center">
                    {currentPlan === "premium" ? (
                      <Crown size={24} className="text-white" />
                    ) : (
                      <Zap size={24} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-navy dark:text-white">
                      Your Current Plan:{" "}
                      <span className="text-teal capitalize">{currentPlan}</span>
                      {currentSubscription?.status === "cancelled" && (
                        <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full">
                          Cancelled
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <Clock size={14} className="inline mr-1" />
                      {currentSubscription?.status === "cancelled"
                        ? `Expires on ${renewalDate}`
                        : `Renews on ${renewalDate}`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className={cn(
                    "border-teal text-teal hover:bg-teal hover:text-white dark:bg-transparent",
                    currentSubscription?.status === "cancelled" && "border-red-500 text-red-500 hover:bg-transparent hover:text-red-500 cursor-not-allowed opacity-60"
                  )}
                  onClick={handleCancel}
                  disabled={isCancelling || currentSubscription?.status === "cancelled"}
                >
                  {isCancelling ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : null}
                  {currentSubscription?.status === "cancelled"
                    ? "Cancellation Pending"
                    : "Cancel Subscription"}
                </Button>
              </div>
            </section>
          )}

          {/* BILLING TOGGLE */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 bg-white dark:bg-white/5 rounded-xl p-1.5 border border-slate-200 dark:border-white/10 shadow-sm">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                  billingPeriod === "monthly"
                    ? "bg-navy dark:bg-teal text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white",
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  billingPeriod === "yearly"
                    ? "bg-navy dark:bg-teal text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white",
                )}
              >
                Yearly
                <span className="px-2 py-0.5 bg-success-green text-white text-[10px] font-bold rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* PRICING CARDS */}
          <section className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* FREE PLAN */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <User size={20} className="text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-navy dark:text-white">Free</h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-navy dark:text-white">₹0</span>
                  <span className="text-slate-500 dark:text-slate-400">/month</span>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Get started and explore the platform
                </p>

                {currentPlan === "free" ? (
                  <Button
                    disabled
                    className="w-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  >
                    Current Plan
                  </Button>
                ) : currentSubscription?.status === "cancelled" ? (
                  <Button
                    disabled
                    className="w-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  >
                    Downgrade Pending
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 dark:border-white/10 dark:text-white"
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : null}
                    Downgrade
                  </Button>
                )}

                <div className="mt-8 space-y-3">
                  {planFeatures.free.slice(0, 8).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {item.included ? (
                        <Check size={16} className="text-success-green" />
                      ) : (
                        <X size={16} className="text-slate-300" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          item.included ? "text-navy dark:text-white" : "text-slate-400 dark:text-white/30",
                        )}
                      >
                        {item.feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PRO PLAN */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border-2 border-teal shadow-lg overflow-hidden relative">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-teal text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                Most Popular
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                    <Zap size={20} className="text-teal" />
                  </div>
                  <h3 className="text-xl font-bold text-navy dark:text-white">Pro</h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-navy dark:text-white">
                    ₹
                    {billingPeriod === "monthly"
                      ? prices.pro.monthly
                      : prices.pro.yearly}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    /{billingPeriod === "monthly" ? "month" : "year"}
                  </span>
                  {billingPeriod === "yearly" && (
                    <p className="text-sm text-success-green mt-1">
                      Save {yearlySavings.pro}% compared to monthly
                    </p>
                  )}
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  For serious freelancers ready to grow
                </p>

                {currentPlan === "pro" ? (
                  <Button
                    disabled
                    className={cn(
                      "w-full bg-teal/20 text-teal cursor-not-allowed",
                      currentSubscription?.status === "cancelled" && "bg-slate-100 dark:bg-white/10 text-slate-500"
                    )}
                  >
                    {currentSubscription?.status === "cancelled" ? "Current Plan (Ending)" : "Current Plan"}
                  </Button>
                ) : currentPlan === "premium" ? (
                  <Button
                    className="w-full bg-teal hover:bg-teal-light text-white font-bold"
                    onClick={handleSwitchFromPremiumToPro}
                    disabled={isSwitchingFromPremium || currentSubscription?.status === "cancelled"}
                  >
                    {isSwitchingFromPremium ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : null}
                    Switch to Pro
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-teal hover:bg-teal-light text-white font-bold"
                    onClick={() => handlePaymentClick("pro")}
                    disabled={isProcessing === "pro" || currentSubscription?.status === "cancelled"}
                  >
                    {isProcessing === "pro" ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : null}
                    Upgrade to Pro
                  </Button>
                )}

                <div className="mt-8 space-y-3">
                  {planFeatures.pro.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {item.included ? (
                        <Check size={16} className="text-success-green" />
                      ) : (
                        <X size={16} className="text-slate-300" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          item.included ? "text-navy dark:text-white" : "text-slate-400 dark:text-white/30",
                        )}
                      >
                        {item.feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PREMIUM PLAN */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border-2 border-gold shadow-lg overflow-hidden relative">
              {/* Best Value Badge */}
              <div className="absolute top-0 right-0 bg-gold text-white text-xs font-bold px-4 py-1 rounded-bl-xl flex items-center gap-1">
                <Sparkles size={12} />
                Best Value
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Crown size={20} className="text-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-navy dark:text-white">Premium</h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-navy dark:text-white">
                    ₹
                    {billingPeriod === "monthly"
                      ? prices.premium.monthly
                      : prices.premium.yearly}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    /{billingPeriod === "monthly" ? "month" : "year"}
                  </span>
                  {billingPeriod === "yearly" && (
                    <p className="text-sm text-success-green mt-1">
                      Save {yearlySavings.premium}% compared to monthly
                    </p>
                  )}
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  For top freelancers who want it all
                </p>

                {currentPlan === "premium" ? (
                  <Button
                    disabled
                    className={cn(
                      "w-full bg-gold/20 text-gold cursor-not-allowed",
                      currentSubscription?.status === "cancelled" && "bg-slate-100 dark:bg-white/10 text-slate-500"
                    )}
                  >
                    {currentSubscription?.status === "cancelled" ? "Current Plan (Ending)" : "Current Plan"}
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-gold hover:bg-gold/90 text-white"
                    onClick={() => handlePaymentClick("premium")}
                    disabled={isProcessing === "premium" || currentSubscription?.status === "cancelled"}
                  >
                    {isProcessing === "premium" ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : null}
                    Go Premium
                  </Button>
                )}

                <div className="mt-8 space-y-3">
                  {planFeatures.premium.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check size={16} className="text-success-green" />
                      <span className="text-sm text-navy dark:text-white">{item.feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FEATURE COMPARISON TABLE */}
          <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/10">
              <h2 className="text-xl font-bold text-navy dark:text-white">
                Compare All Features
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-white/10 sticky top-0">
                  <tr>
                    <th className="text-left text-sm font-semibold text-navy dark:text-white px-6 py-4">
                      Feature
                    </th>
                    <th className="text-center text-sm font-semibold text-navy dark:text-white px-6 py-4">
                      Free
                    </th>
                    <th className="text-center text-sm font-semibold text-teal px-6 py-4">
                      Pro
                    </th>
                    <th className="text-center text-sm font-semibold text-gold px-6 py-4">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-slate-50/50 dark:bg-white/5"}
                    >
                      <td className="text-sm text-navy dark:text-white px-6 py-4 font-medium">
                        {feature.name}
                      </td>
                      <td className="text-center px-6 py-4">
                        {typeof feature.free === "boolean" ? (
                          feature.free ? (
                            <Check
                              size={16}
                              className="mx-auto text-success-green"
                            />
                          ) : (
                            <X size={16} className="mx-auto text-slate-300" />
                          )
                        ) : (
                          <span className="text-sm text-slate-600 dark:text-white/60">
                            {feature.free}
                          </span>
                        )}
                      </td>
                      <td className="text-center px-6 py-4 bg-teal/5">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <Check
                              size={16}
                              className="mx-auto text-success-green"
                            />
                          ) : (
                            <X size={16} className="mx-auto text-slate-300" />
                          )
                        ) : (
                          <span className="text-sm text-teal font-medium">
                            {feature.pro}
                          </span>
                        )}
                      </td>
                      <td className="text-center px-6 py-4 bg-gold/5">
                        {typeof feature.premium === "boolean" ? (
                          feature.premium ? (
                            <Check
                              size={16}
                              className="mx-auto text-success-green"
                            />
                          ) : (
                            <X size={16} className="mx-auto text-slate-300" />
                          )
                        ) : (
                          <span className="text-sm text-gold font-medium">
                            {feature.premium}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* PAYMENT SECTION */}
          <section className="bg-gradient-to-r from-navy to-royal-blue dark:from-[#0f172a] dark:to-royal-blue/30 rounded-2xl p-6 lg:p-8 text-center text-white border border-white/5">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield size={24} />
              <h3 className="text-lg font-bold">Secure Payment</h3>
            </div>
            <p className="text-white/80 mb-6">
              All payments are securely processed through Razorpay. Your
              financial data is encrypted and protected.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur rounded-lg px-4 py-2 text-sm border border-white/10">
                💳 Visa
              </div>
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur rounded-lg px-4 py-2 text-sm border border-white/10">
                💳 Mastercard
              </div>
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur rounded-lg px-4 py-2 text-sm border border-white/10">
                🏦 Net Banking
              </div>
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur rounded-lg px-4 py-2 text-sm border border-white/10">
                📱 UPI
              </div>
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur rounded-lg px-4 py-2 text-sm border border-white/10">
                💰 Paytm
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section>
            <h2 className="text-xl font-bold text-navy dark:text-white mb-6 text-center">
              What Our Pro & Premium Members Say
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < testimonial.rating
                            ? "text-gold fill-gold"
                            : "text-slate-200 dark:text-slate-700"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-navy dark:text-white text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {testimonial.role} •{" "}
                        <span
                          className={
                            testimonial.plan === "Premium"
                              ? "text-gold"
                              : "text-teal"
                          }
                        >
                          {testimonial.plan} Member
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/10">
              <h2 className="text-xl font-bold text-navy dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/10">
              {faqItems.map((item, idx) => (
                <div key={idx} className="p-6">
                  <button
                    onClick={() =>
                      setExpandedFaq(expandedFaq === idx ? null : idx)
                    }
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-navy dark:text-white">
                      {item.question}
                    </span>
                    {expandedFaq === idx ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* CANCELLATION INFO */}
          <section className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 lg:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-green/10 flex items-center justify-center">
                  <Check size={20} className="text-success-green" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-navy dark:text-white">Cancel Anytime</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No long-term commitment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-green/10 flex items-center justify-center">
                  <Lock size={20} className="text-success-green" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-navy dark:text-white">No Hidden Fees</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    What you see is what you pay
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-green/10 flex items-center justify-center">
                  <Shield size={20} className="text-success-green" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-navy dark:text-white">7-Day Guarantee</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Full refund if not satisfied
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* UPGRADE CONFIRMATION MODAL */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl rounded-3xl animate-scale-up">
            {/* Background glowing effects */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal/20 rounded-full blur-[60px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gold/20 rounded-full blur-[60px]" />

            <div className="p-8 relative z-10">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-navy dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center text-gold">
                  <Crown size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-navy dark:text-white">
                    Upgrade to Premium
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Unlock elite features instantly
                  </p>
                </div>
              </div>

              {isLoadingPreview ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={36} className="animate-spin text-gold" />
                  <p className="text-sm text-slate-400">Calculating your prorated price...</p>
                </div>
              ) : upgradePreview ? (
                <div className="space-y-6">
                  {/* Info Alert Box */}
                  <div className="bg-teal/10 border border-teal/20 rounded-2xl p-4 text-xs md:text-sm text-teal dark:text-teal-light flex gap-3">
                    <Sparkles size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1 text-teal dark:text-teal-light">Prorated Credit Applied!</p>
                      <p className="leading-relaxed opacity-90 text-teal dark:text-teal-light">
                        We've calculated the unused value of your current{" "}
                        <strong className="capitalize">{upgradePreview.currentPlan.name}</strong> plan and deducted it from your new subscription.
                      </p>
                    </div>
                  </div>

                  {/* Calculations Details */}
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        New Premium Plan (1 month)
                      </span>
                      <span className="font-semibold text-navy dark:text-white">
                        ₹{upgradePreview.newPlan.price}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm border-b border-dashed border-slate-200 dark:border-white/10 pb-4">
                      <span className="text-success-green flex items-center gap-1.5 font-medium">
                        <Check size={16} /> Prorated Credit ({upgradePreview.proration.remainingDays} days left)
                      </span>
                      <span className="font-bold text-success-green">
                        -₹{upgradePreview.proration.creditAmount}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="font-extrabold text-navy dark:text-white">
                        Amount Payable Today
                      </span>
                      <span className="text-3xl font-extrabold text-gold">
                        ₹{upgradePreview.proration.dueAmount}
                      </span>
                    </div>
                  </div>

                  {/* Reset Period Note */}
                  <p className="text-xs text-slate-400 leading-relaxed text-center px-4">
                    By clicking confirm, your old Pro subscription will end today, and your 1-month Premium benefits will begin immediately. Your billing cycle will reset.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-slate-200 dark:border-white/10 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      onClick={() => setIsUpgradeModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 h-14 rounded-2xl bg-gold hover:bg-gold/90 text-white font-extrabold shadow-lg shadow-gold/20"
                      onClick={() => {
                        setIsUpgradeModalOpen(false);
                        handlePayment("premium");
                      }}
                      disabled={isProcessing === "premium"}
                    >
                      {isProcessing === "premium" ? (
                        <Loader2 size={16} className="animate-spin mr-2" />
                      ) : null}
                      Confirm & Pay
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-red-500">
                  Failed to load upgrade details. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerSubscription;
