import React from "react";
import { cn } from "@/lib/utils";

type ProjectStatus =
  | "Open"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Draft";
type ApplicationStatus =
  | "Pending"
  | "Viewed"
  | "Shortlisted"
  | "Hired"
  | "Rejected";
type UserStatus = "Active" | "Suspended" | "Pending";

interface StatusBadgeProps {
  status: string;
  type?: "project" | "application" | "user";
  className?: string;
}

const projectStatusConfig: Record<ProjectStatus, string> = {
  Open: "bg-teal/10 text-teal border-teal/20",
  "In Progress": "bg-royal-blue/10 text-royal-blue border-royal-blue/20",
  Completed: "bg-success-green/10 text-success-green border-success-green/20",
  Cancelled: "bg-red-100 text-red-600 border-red-200",
  Draft: "bg-slate-100 text-text-secondary border-slate-200",
};

const applicationStatusConfig: Record<ApplicationStatus, string> = {
  Pending: "bg-gold/10 text-gold border-gold/20",
  Viewed: "bg-sky-blue/10 text-royal-blue border-sky-blue/20",
  Shortlisted: "bg-teal/10 text-teal border-teal/20",
  Hired: "bg-success-green/10 text-success-green border-success-green/20",
  Rejected: "bg-red-100 text-red-600 border-red-200",
};

const userStatusConfig: Record<UserStatus, { color: string; dot: string }> = {
  Active: { color: "text-success-green", dot: "bg-success-green" },
  Suspended: { color: "text-red-600", dot: "bg-red-500" },
  Pending: { color: "text-gold", dot: "bg-gold" },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "project",
  className,
}) => {
  if (type === "user") {
    const config =
      userStatusConfig[status as UserStatus] || userStatusConfig["Pending"];
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 shadow-sm",
          config.color,
          className,
        )}
      >
        <span className={cn("w-2 h-2 rounded-full", config.dot)} />
        {status}
      </div>
    );
  }

  let classes = "";
  if (type === "project") {
    classes =
      projectStatusConfig[status as ProjectStatus] ||
      projectStatusConfig["Draft"];
  } else {
    classes =
      applicationStatusConfig[status as ApplicationStatus] ||
      applicationStatusConfig["Pending"];
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold border",
        classes,
        className,
      )}
    >
      {status}
    </span>
  );
};
