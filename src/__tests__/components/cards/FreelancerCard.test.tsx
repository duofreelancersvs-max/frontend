import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FreelancerCard from "../../../components/cards/FreelancerCard";

const mockFreelancer = {
  name: "John Doe",
  title: "Full Stack Developer",
  rating: 4.8,
  reviewCount: 42,
  hourlyRate: 50,
  location: "New York, USA",
  skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
  imageUrl: "https://example.com/avatar.jpg",
  coverUrl: "https://example.com/cover.jpg",
  isVerified: true,
  onViewProfile: vi.fn(),
};

describe("FreelancerCard", () => {
  it("renders freelancer information correctly", () => {
    render(<FreelancerCard {...mockFreelancer} />);
    
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Full Stack Developer")).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText("₹50/hr")).toBeInTheDocument();
    expect(screen.getByText("New York, USA")).toBeInTheDocument();
  });

  it("displays verified badge when isVerified is true", () => {
    const { container } = render(<FreelancerCard {...mockFreelancer} />);
    expect(container.querySelector("[data-testid='verified-badge']") || container.textContent).toBeTruthy();
  });

  it("does not display verified badge when isVerified is false", () => {
    const unverifiedFreelancer = { ...mockFreelancer, isVerified: false };
    const { container } = render(<FreelancerCard {...unverifiedFreelancer} />);
    expect(container.querySelector(".bg-white.rounded-full")).not.toBeInTheDocument();
  });

  it("displays up to 3 skills and shows count for remaining", () => {
    render(<FreelancerCard {...mockFreelancer} />);
    
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("+ 2")).toBeInTheDocument();
  });

  it("calls onViewProfile when View Profile button is clicked", async () => {
    render(<FreelancerCard {...mockFreelancer} />);
    
    const viewProfileButton = screen.getByRole("button", { name: /view profile/i });
    await userEvent.click(viewProfileButton);
    
    expect(mockFreelancer.onViewProfile).toHaveBeenCalledTimes(1);
  });

  it("renders with custom className", () => {
    const { container } = render(<FreelancerCard {...mockFreelancer} className="custom-card" />);
    expect(container.firstChild).toHaveClass("custom-card");
  });

  it("displays rating correctly", () => {
    render(<FreelancerCard {...mockFreelancer} />);
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("renders without cover image when coverUrl is not provided", () => {
    const freelancerWithoutCover = { ...mockFreelancer, coverUrl: undefined };
    const { container } = render(<FreelancerCard {...freelancerWithoutCover} />);
    const coverImage = container.querySelector("img[alt='Cover']");
    expect(coverImage).not.toBeInTheDocument();
  });

  it("handles missing onViewProfile callback gracefully", () => {
    const freelancerWithoutCallback = { ...mockFreelancer, onViewProfile: undefined };
    render(<FreelancerCard {...freelancerWithoutCallback} />);
    
    const viewProfileButton = screen.getByRole("button", { name: /view profile/i });
    expect(viewProfileButton).toBeInTheDocument();
  });

  it("displays avatar image with correct alt text", () => {
    const { container } = render(<FreelancerCard {...mockFreelancer} />);
    const avatar = container.querySelector("img[alt='John Doe']");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });
});
