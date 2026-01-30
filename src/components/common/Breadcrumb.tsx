import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav
      className={cn("flex items-center text-sm text-slate-500", className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/dashboard"
            className="hover:text-navy transition-colors flex items-center"
          >
            <Home size={16} />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <li>
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                {isLast ? (
                  <span className="font-semibold text-navy" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href || "#"}
                    className="hover:text-navy transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
