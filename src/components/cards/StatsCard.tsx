import React from "react";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColorClass?: string;
  iconBgClass?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  iconColorClass = "text-royal-blue",
  iconBgClass = "bg-royal-blue/10",
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-colors",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            iconBgClass,
            iconColorClass,
          )}
        >
          <Icon size={20} />
        </div>

        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              trend.isPositive
                ? "text-success-green bg-success-green/10"
                : "text-red-600 bg-red-50",
            )}
          >
            {trend.isPositive ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span>{Math.abs(trend.value)}%</span>
            <span className="hidden sm:inline font-normal text-slate-400 ml-1">
              last mo
            </span>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-3xl font-bold text-text-primary tracking-tight">
          {value}
        </h4>
        <p className="text-sm text-text-secondary font-medium mt-1">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
