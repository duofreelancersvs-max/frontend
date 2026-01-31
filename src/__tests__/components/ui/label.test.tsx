import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders label element", () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null as HTMLLabelElement | null };
    render(<Label ref={ref}>Label with ref</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it("applies default styling", () => {
    render(<Label>Default Style</Label>);
    const label = screen.getByText("Default Style");
    expect(label).toHaveClass("text-sm");
    expect(label).toHaveClass("font-medium");
  });

  it("applies custom className", () => {
    render(<Label className="custom-label">Custom Class</Label>);
    const label = screen.getByText("Custom Class");
    expect(label).toHaveClass("custom-label");
  });

  it("forwards htmlFor attribute", () => {
    render(<Label htmlFor="input-id">Label for Input</Label>);
    const label = screen.getByText("Label for Input");
    expect(label).toHaveAttribute("for", "input-id");
  });

  it("applies peer-disabled styles", () => {
    render(<Label>Peer Disabled Label</Label>);
    const label = screen.getByText("Peer Disabled Label");
    expect(label).toHaveClass("peer-disabled:cursor-not-allowed");
    expect(label).toHaveClass("peer-disabled:opacity-70");
  });
});
