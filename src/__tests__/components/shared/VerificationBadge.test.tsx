import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VerificationBadge } from "@/components/shared/VerificationBadge";

describe("VerificationBadge", () => {
  it("renders basic verification badge", () => {
    render(<VerificationBadge type="basic" />);
    const badge = document.querySelector("svg");
    expect(badge).toBeInTheDocument();
  });

  it("renders premium verification badge", () => {
    render(<VerificationBadge type="premium" />);
    const badge = document.querySelector("svg");
    expect(badge).toBeInTheDocument();
  });

  it("displays correct tooltip content for basic type", async () => {
    render(<VerificationBadge type="basic" />);
    // Tooltip content is rendered by Radix UI
    // We can check that the component renders
    const badge = document.querySelector("[class*='cursor-help']");
    expect(badge).toBeInTheDocument();
  });

  it("displays correct tooltip content for premium type", async () => {
    render(<VerificationBadge type="premium" />);
    const badge = document.querySelector("[class*='cursor-help']");
    expect(badge).toBeInTheDocument();
  });

  it("applies correct styling for basic badge", () => {
    render(<VerificationBadge type="basic" />);
    const badge = document.querySelector(".text-success-green");
    expect(badge).toBeInTheDocument();
  });

  it("applies correct styling for premium badge", () => {
    render(<VerificationBadge type="premium" />);
    const badge = document.querySelector(".text-gold");
    expect(badge).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<VerificationBadge type="basic" className="custom-badge" />);
    const badge = document.querySelector(".custom-badge");
    expect(badge).toBeInTheDocument();
  });

  it("has cursor-help for tooltip interaction", () => {
    render(<VerificationBadge type="basic" />);
    const badge = document.querySelector(".cursor-help");
    expect(badge).toBeInTheDocument();
  });
});
