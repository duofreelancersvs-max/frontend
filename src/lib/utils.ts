import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBudget(min?: number, max?: number): string {
  const minAmt = min || 0;
  const maxAmt = max || 0;
  
  if (minAmt === maxAmt) {
    return `₹${minAmt.toLocaleString()}`;
  }
  
  return `₹${minAmt.toLocaleString()} - ₹${maxAmt.toLocaleString()}`;
}
