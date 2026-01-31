import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectCard from "@/components/cards/ProjectCard";

describe("ProjectCard", () => {
  const defaultProps = {
    title: "Website Development",
    description: "Looking for a skilled developer to build a responsive website",
    status: "Open" as const,
    budget: "₹50,000",
    applicationCount: 12,
    deadline: "2024-12-31",
    skills: ["React", "Node.js", "MongoDB", "TypeScript"],
    onViewProject: vi.fn(),
  };

  it("renders project card with all content", () => {
    render(<ProjectCard {...defaultProps} />);
    
    expect(screen.getByText("Website Development")).toBeInTheDocument();
    expect(screen.getByText(/Looking for a skilled developer/i)).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("₹50,000")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("2024-12-31")).toBeInTheDocument();
  });

  it("displays correct status colors", () => {
    const { rerender } = render(<ProjectCard {...defaultProps} status="Open" />);
    const openBadge = screen.getByText("Open");
    expect(openBadge).toHaveClass("bg-teal/10");

    rerender(<ProjectCard {...defaultProps} status="In Progress" />);
    const inProgressBadge = screen.getByText("In Progress");
    expect(inProgressBadge).toHaveClass("bg-royal-blue/10");

    rerender(<ProjectCard {...defaultProps} status="Completed" />);
    const completedBadge = screen.getByText("Completed");
    expect(completedBadge).toHaveClass("bg-success-green/10");
  });

  it("displays up to 3 skills and shows count for remaining", () => {
    render(<ProjectCard {...defaultProps} />);
    
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("MongoDB")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("calls onViewProject when button is clicked", async () => {
    render(<ProjectCard {...defaultProps} />);
    const button = screen.getByRole("button", { name: /view details/i });
    await userEvent.click(button);
    expect(defaultProps.onViewProject).toHaveBeenCalledTimes(1);
  });

  it("displays budget with IndianRupee icon", () => {
    render(<ProjectCard {...defaultProps} />);
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("₹50,000")).toBeInTheDocument();
  });

  it("displays application count with Users icon", () => {
    render(<ProjectCard {...defaultProps} />);
    expect(screen.getByText("Apps")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("displays deadline with Clock icon", () => {
    render(<ProjectCard {...defaultProps} />);
    expect(screen.getByText("Deadline")).toBeInTheDocument();
    expect(screen.getByText("2024-12-31")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<ProjectCard {...defaultProps} className="custom-card" />);
    expect(container.firstChild).toHaveClass("custom-card");
  });

  it("truncates long titles", () => {
    const longTitle = "This is a very long project title that should be truncated".repeat(3);
    render(<ProjectCard {...defaultProps} title={longTitle} />);
    const title = screen.getByText(longTitle);
    expect(title).toHaveClass("line-clamp-1");
  });

  it("handles empty skills array", () => {
    render(<ProjectCard {...defaultProps} skills={[]} />);
    expect(screen.getByText("Website Development")).toBeInTheDocument();
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it("handles exactly 3 skills without showing + count", () => {
    render(<ProjectCard {...defaultProps} skills={["React", "Node.js", "MongoDB"]} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("MongoDB")).toBeInTheDocument();
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });
});
