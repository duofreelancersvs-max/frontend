import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatingStars } from "../../../components/shared/RatingStars";

describe("RatingStars", () => {
  it("renders with default props and displays rating when showCount is true", () => {
    render(<RatingStars rating={3} showCount={true} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("displays correct number of full stars", () => {
    const { container } = render(<RatingStars rating={4} />);
    const stars = container.querySelectorAll(".fill-gold");
    expect(stars.length).toBe(4);
  });

  it("displays half star for decimal ratings >= 0.5", () => {
    const { container } = render(<RatingStars rating={3.5} />);
    // Check for StarHalf component which uses fill-gold class
    const stars = container.querySelectorAll(".fill-gold");
    expect(stars.length).toBeGreaterThanOrEqual(3);
  });

  it("displays correct rating number with showCount", () => {
    render(<RatingStars rating={4.5} showCount={true} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("shows count when provided", () => {
    render(<RatingStars rating={4} count={42} />);
    expect(screen.getByText("(42)")).toBeInTheDocument();
  });

  it("shows count and rating when showCount is true", () => {
    render(<RatingStars rating={3.5} showCount={true} count={10} />);
    expect(screen.getByText("3.5")).toBeInTheDocument();
    expect(screen.getByText("(10)")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<RatingStars rating={5} className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles zero rating", () => {
    const { container } = render(<RatingStars rating={0} />);
    const stars = container.querySelectorAll(".fill-gold");
    expect(stars.length).toBe(0);
  });

  it("handles full 5-star rating", () => {
    const { container } = render(<RatingStars rating={5} />);
    const filledStars = container.querySelectorAll(".fill-gold");
    expect(filledStars.length).toBe(5);
  });

  it("does not show count when count is undefined and showCount is false", () => {
    const { container } = render(<RatingStars rating={4} />);
    const countElement = container.querySelector(".text-xs");
    expect(countElement).not.toBeInTheDocument();
  });
});
