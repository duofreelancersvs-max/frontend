import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotificationBadge } from "@/components/shared/NotificationBadge";

describe("NotificationBadge", () => {
  it("renders count when greater than 0", () => {
    render(<NotificationBadge count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("returns null when count is 0", () => {
    const { container } = render(<NotificationBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when count is negative", () => {
    const { container } = render(<NotificationBadge count={-1} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays '9+' when count is greater than 9", () => {
    render(<NotificationBadge count={15} />);
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("displays single digit correctly", () => {
    render(<NotificationBadge count={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("applies correct styling", () => {
    render(<NotificationBadge count={5} />);
    const badge = screen.getByText("5");
    expect(badge).toHaveClass("absolute");
    expect(badge).toHaveClass("top-0");
    expect(badge).toHaveClass("right-0");
    expect(badge).toHaveClass("bg-red-500");
    expect(badge).toHaveClass("text-white");
    expect(badge).toHaveClass("rounded-full");
  });

  it("applies custom className", () => {
    render(<NotificationBadge count={5} className="custom-badge" />);
    const badge = screen.getByText("5");
    expect(badge).toHaveClass("custom-badge");
  });

  it("displays count at boundary of 9 correctly", () => {
    render(<NotificationBadge count={9} />);
    expect(screen.getByText("9")).toBeInTheDocument();
  });
});
