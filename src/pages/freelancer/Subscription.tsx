import { useState, useEffect } from "react";
import { Link,  useOutletContext  } from "react-router-dom";
import {
  Star,
  User,
  X,
  Menu,
  Check,
  Crown,
  Zap,
  Shield,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Lock,
  MessageSquare,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { subscriptionService } from "@/services";
import type { Subscription } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { useUnreadStore } from "@/stores/unread.store";

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
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
    <div className="w-full bg-slate-50">
      <div className="w-full">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-navy">
                  Choose Your Plan
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Unlock premium features and get hired faster
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <Link
                to="/freelancer/messages"
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex"
              >
                <MessageSquare size={20} />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white" />
                )}
              </Link>
              
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                    {user?.fullName
                      ? user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : (user?.email?.[0] || "U").toUpperCase()}
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-slate-500 hidden sm:block"
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-navy">
                        {user?.fullName || user?.email?.split("@")[0] || "Freelancer"}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/freelancer/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <UserIcon size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/freelancer/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <hr className="my-2 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-8 space-y-8">
          {/* CURRENT PLAN CARD (if subscribed) */}
          {currentPlan !== "free" && (
            <section className="bg-gradient-to-r from-teal/10 to-teal-light/10 rounded-2xl border border-teal/20 p-6">
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
                    <h2 className="text-lg font-bold text-navy">
                      Your Current Plan:{" "}
                      <span className="text-teal">{currentPlan}</span>
                    </h2>
                    <p className="text-sm text-slate-500">
                      <Clock size={14} className="inline mr-1" />
                      Renews on {renewalDate}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-teal text-teal hover:bg-teal hover:text-white"
                >
                  Manage Subscription
                </Button>
              </div>
            </section>
          )}

          {/* BILLING TOGGLE */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                  billingPeriod === "monthly"
                    ? "bg-navy text-white"
                    : "text-slate-600 hover:text-navy",
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  billingPeriod === "yearly"
                    ? "bg-navy text-white"
                    : "text-slate-600 hover:text-navy",
                )}
              >
                Yearly
                <span className="px-2 py-0.5 bg-success-green text-white text-xs font-bold rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* PRICING CARDS */}
          <section className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* FREE PLAN */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <User size={20} className="text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-navy">Free</h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-navy">₹0</span>
                  <span className="text-slate-500">/month</span>
                </div>

                <p className="text-sm text-slate-500 mb-6">
                  Get started and explore the platform
                </p>

                {currentPlan === "free" ? (
                  <Button
                    disabled
                    className="w-full bg-slate-100 text-slate-500 cursor-not-allowed"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full border-slate-200">
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
                          item.included ? "text-navy" : "text-slate-400",
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
            <div className="bg-white rounded-2xl border-2 border-teal shadow-lg overflow-hidden relative">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-teal text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                Most Popular
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                    <Zap size={20} className="text-teal" />
                  </div>
                  <h3 className="text-xl font-bold text-navy">Pro</h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-navy">
                    ₹
                    {billingPeriod === "monthly"
                      ? prices.pro.monthly
                      : prices.pro.yearly}
                  </span>
                  <span className="text-slate-500">
                    /{billingPeriod === "monthly" ? "month" : "year"}
                  </span>
                  {billingPeriod === "yearly" && (
                    <p className="text-sm text-success-green mt-1">
                      Save {yearlySavings.pro}% compared to monthly
                    </p>
                  )}
                </div>

                <p className="text-sm text-slate-500 mb-6">
                  For serious freelancers ready to grow
                </p>

                {currentPlan === "pro" ? (
                  <Button
                    disabled
                    className="w-full bg-teal/20 text-teal cursor-not-allowed"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full bg-teal hover:bg-teal-light text-white">
                    {currentPlan === "premium"
                      ? "Downgrade to Pro"
                      : "Upgrade to Pro"}
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
                          item.included ? "text-navy" : "text-slate-400",
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
            <div className="bg-white rounded-2xl border-2 border-gold shadow-lg overflow-hidden relative">
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
                  <h3 className="text-xl font-bold text-navy">Premium</h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-navy">
                    ₹
                    {billingPeriod === "monthly"
                      ? prices.premium.monthly
                      : prices.premium.yearly}
                  </span>
                  <span className="text-slate-500">
                    /{billingPeriod === "monthly" ? "month" : "year"}
                  </span>
                  {billingPeriod === "yearly" && (
                    <p className="text-sm text-success-green mt-1">
                      Save {yearlySavings.premium}% compared to monthly
                    </p>
                  )}
                </div>

                <p className="text-sm text-slate-500 mb-6">
                  For top freelancers who want it all
                </p>

                {currentPlan === "premium" ? (
                  <Button
                    disabled
                    className="w-full bg-gold/20 text-gold cursor-not-allowed"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full bg-gold hover:bg-gold/90 text-white">
                    Go Premium
                  </Button>
                )}

                <div className="mt-8 space-y-3">
                  {planFeatures.premium.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check size={16} className="text-success-green" />
                      <span className="text-sm text-navy">{item.feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FEATURE COMPARISON TABLE */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-navy">
                Compare All Features
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left text-sm font-semibold text-navy px-6 py-4">
                      Feature
                    </th>
                    <th className="text-center text-sm font-semibold text-navy px-6 py-4">
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
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <td className="text-sm text-navy px-6 py-4 font-medium">
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
                          <span className="text-sm text-slate-600">
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
          <section className="bg-gradient-to-r from-navy to-royal-blue rounded-2xl p-6 lg:p-8 text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield size={24} />
              <h3 className="text-lg font-bold">Secure Payment</h3>
            </div>
            <p className="text-white/80 mb-6">
              All payments are securely processed through Razorpay. Your
              financial data is encrypted and protected.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-sm">
                💳 Visa
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-sm">
                💳 Mastercard
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-sm">
                🏦 Net Banking
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-sm">
                📱 UPI
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-sm">
                💰 Paytm
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section>
            <h2 className="text-xl font-bold text-navy mb-6 text-center">
              What Our Pro & Premium Members Say
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < testimonial.rating
                            ? "text-gold fill-gold"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-slate-500">
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
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-navy">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {faqItems.map((item, idx) => (
                <div key={idx} className="p-6">
                  <button
                    onClick={() =>
                      setExpandedFaq(expandedFaq === idx ? null : idx)
                    }
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-navy">
                      {item.question}
                    </span>
                    {expandedFaq === idx ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* CANCELLATION INFO */}
          <section className="bg-slate-50 rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-green/10 flex items-center justify-center">
                  <Check size={20} className="text-success-green" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-navy">Cancel Anytime</p>
                  <p className="text-sm text-slate-500">
                    No long-term commitment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-green/10 flex items-center justify-center">
                  <Lock size={20} className="text-success-green" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-navy">No Hidden Fees</p>
                  <p className="text-sm text-slate-500">
                    What you see is what you pay
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-green/10 flex items-center justify-center">
                  <Shield size={20} className="text-success-green" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-navy">7-Day Guarantee</p>
                  <p className="text-sm text-slate-500">
                    Full refund if not satisfied
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default FreelancerSubscription;
