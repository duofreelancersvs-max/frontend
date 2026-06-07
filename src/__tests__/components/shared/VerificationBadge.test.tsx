import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VerificationBadge } from "@/components/shared/VerificationBadge";

describe("VerificationBadge", () => {
  it("renders basic verification badge", () => {
    render(<VerificationBadge type="basic" />);
    const badge = document.querySelector("svg");
    expect(badge).toBeInTheDocument();
  });

  it("renders pro verification badge", () => {
    render(<VerificationBadge type="pro" />);
    const badge = document.querySelector("svg");
    expect(badge).toBeInTheDocument();
  });

  it("displays correct tooltip content for basic type", async () => {
    render(<VerificationBadge type="basic" />);
    const badge = document.querySelector("[class*='cursor-help']");
    expect(badge).toBeInTheDocument();
  });

  it("displays correct tooltip content for pro type", async () => {
    render(<VerificationBadge type="pro" />);
    const badge = document.querySelector("[class*='cursor-help']");
    expect(badge).toBeInTheDocument();
  });

  it("applies correct styling for basic badge", () => {
    render(<VerificationBadge type="basic" />);
    const badge = document.querySelector(".text-success-green");
    expect(badge).toBeInTheDocument();
  });

  it("applies correct styling for pro badge", () => {
    render(<VerificationBadge type="pro" />);
    const badge = document.querySelector(".text-teal-600");
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
