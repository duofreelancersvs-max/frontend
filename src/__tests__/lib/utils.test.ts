import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges tailwind classes correctly", () => {
    const result = cn("px-4", "py-2");
    expect(result).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("px-4", isActive && "bg-blue-500", !isActive && "hidden");
    expect(result).toBe("px-4 bg-blue-500");
  });

  it("deduplicates conflicting tailwind classes", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("handles undefined and null values", () => {
    const result = cn("px-4", undefined, null, "py-2");
    expect(result).toBe("px-4 py-2");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles complex class merging", () => {
    const result = cn(
      "bg-slate-100",
      "hover:bg-slate-200",
      "dark:bg-slate-800",
      { "text-red-500": true, "text-blue-500": false }
    );
    expect(result).toContain("bg-slate-100");
    expect(result).toContain("hover:bg-slate-200");
    expect(result).toContain("dark:bg-slate-800");
    expect(result).toContain("text-red-500");
    expect(result).not.toContain("text-blue-500");
  });
});
