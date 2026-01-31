import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  billingPeriod?: string;
  features: string[];
  isPopular?: boolean;
  ctaLabel?: string;
  onSelectPlan?: () => void;
  className?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  billingPeriod = "/month",
  features,
  isPopular = false,
  ctaLabel = "Get Started",
  onSelectPlan,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-8 relative transition-all duration-300",
        isPopular
          ? "border-2 border-teal shadow-xl scale-105 z-10"
          : "border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md",
        className,
      )}
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal text-white px-4 py-1 rounded-full text-sm font-semibold shadow-sm whitespace-nowrap">
          Most Popular
        </div>
      )}

      <div className="text-center mb-6">
        <h3
          className={cn(
            "text-lg font-bold mb-2",
            isPopular ? "text-teal" : "text-text-primary",
          )}
        >
          {name}
        </h3>
        <div className="flex items-baseline justify-center gap-0.5">
          <span className="text-4xl font-bold text-text-primary tracking-tight">
            {price}
          </span>
          <span className="text-text-secondary text-sm font-medium">
            {billingPeriod}
          </span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, idx) => (
          <li
            key={idx}
            className="flex items-start gap-3 text-sm text-text-secondary"
          >
            <div
              className={cn(
                "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                isPopular
                  ? "bg-teal/10 text-teal"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className={cn(
          "w-full h-11 font-semibold text-base transition-all",
          isPopular
            ? "bg-teal hover:bg-teal/90 text-white shadow-lg shadow-teal/20"
            : "bg-navy hover:bg-royal-blue text-white",
        )}
        onClick={onSelectPlan}
      >
        {ctaLabel}
      </Button>
    </div>
  );
};

export default PricingCard;
