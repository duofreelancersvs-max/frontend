import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProPlanBadge } from "@/components/shared/ProPlanBadge";

describe("ProPlanBadge", () => {
  it("renders 'PRO' text", () => {
    render(<ProPlanBadge />);
    expect(screen.getByText("PRO")).toBeInTheDocument();
  });

  it("applies correct styling", () => {
    render(<ProPlanBadge />);
    const badge = screen.getByText("PRO");
    expect(badge).toHaveClass("inline-flex");
    expect(badge).toHaveClass("bg-gradient-to-r");
    expect(badge).toHaveClass("from-teal");
    expect(badge).toHaveClass("to-teal-light");
    expect(badge).toHaveClass("text-white");
    expect(badge).toHaveClass("uppercase");
    expect(badge).toHaveClass("rounded");
  });

  it("applies custom className", () => {
    render(<ProPlanBadge className="custom-badge" />);
    const badge = screen.getByText("PRO");
    expect(badge).toHaveClass("custom-badge");
  });

  it("has small text size", () => {
    render(<ProPlanBadge />);
    const badge = screen.getByText("PRO");
    expect(badge).toHaveClass("text-xxs");
  });

  it("has font-black weight", () => {
    render(<ProPlanBadge />);
    const badge = screen.getByText("PRO");
    expect(badge).toHaveClass("font-black");
  });
});
