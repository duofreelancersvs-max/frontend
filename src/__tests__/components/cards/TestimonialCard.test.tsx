import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TestimonialCard from "@/components/cards/TestimonialCard";

describe("TestimonialCard", () => {
  const defaultProps = {
    quote: "Great experience working with this platform!",
    authorName: "John Doe",
    authorTitle: "CEO, TechCorp",
    authorImage: "https://example.com/avatar.jpg",
    rating: 5,
  };

  it("renders testimonial card with all content", () => {
    render(<TestimonialCard {...defaultProps} />);
    
    expect(screen.getByText(/Great experience/i)).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("CEO, TechCorp")).toBeInTheDocument();
  });

  it("displays author image with correct alt text", () => {
    render(<TestimonialCard {...defaultProps} />);
    const image = screen.getByAltText("John Doe");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("displays correct number of filled stars based on rating", () => {
    const { container } = render(<TestimonialCard {...defaultProps} rating={4} />);
    const stars = container.querySelectorAll(".text-gold");
    expect(stars.length).toBe(4);
  });

  it("displays all 5 stars when no rating specified (default)", () => {
    const { container } = render(<TestimonialCard {...defaultProps} rating={undefined} />);
    const filledStars = container.querySelectorAll(".text-gold");
    expect(filledStars.length).toBe(5);
  });

  it("displays quote icon", () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);
    const quoteIcon = container.querySelector("svg");
    expect(quoteIcon).toBeInTheDocument();
  });

  it("applies correct styling", () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);
    const card = container.firstChild;
    expect(card).toHaveClass("bg-white");
    expect(card).toHaveClass("rounded-xl");
    expect(card).toHaveClass("shadow-sm");
  });

  it("applies custom className", () => {
    const { container } = render(<TestimonialCard {...defaultProps} className="custom-testimonial" />);
    expect(container.firstChild).toHaveClass("custom-testimonial");
  });

  it("handles low ratings correctly", () => {
    const { container } = render(<TestimonialCard {...defaultProps} rating={2} />);
    const filledStars = container.querySelectorAll(".text-gold");
    const emptyStars = container.querySelectorAll(".text-slate-200");
    expect(filledStars.length).toBe(2);
    expect(emptyStars.length).toBe(3);
  });

  it("handles zero rating", () => {
    const { container } = render(<TestimonialCard {...defaultProps} rating={0} />);
    const filledStars = container.querySelectorAll(".text-gold");
    expect(filledStars.length).toBe(0);
  });

  it("displays author title in smaller text", () => {
    render(<TestimonialCard {...defaultProps} />);
    const title = screen.getByText("CEO, TechCorp");
    expect(title).toHaveClass("text-xs");
  });
});
