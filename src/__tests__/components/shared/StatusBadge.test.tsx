import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/shared/StatusBadge";

describe("StatusBadge", () => {
  describe("Project Status", () => {
    it("renders 'Open' project status with correct styling", () => {
      render(<StatusBadge status="Open" type="project" />);
      const badge = screen.getByText("Open");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-teal/10");
      expect(badge).toHaveClass("text-teal");
    });

    it("renders 'In Progress' project status", () => {
      render(<StatusBadge status="In Progress" type="project" />);
      const badge = screen.getByText("In Progress");
      expect(badge).toHaveClass("bg-royal-blue/10");
    });

    it("renders 'Completed' project status", () => {
      render(<StatusBadge status="Completed" type="project" />);
      const badge = screen.getByText("Completed");
      expect(badge).toHaveClass("bg-success-green/10");
    });

    it("renders 'Cancelled' project status", () => {
      render(<StatusBadge status="Cancelled" type="project" />);
      const badge = screen.getByText("Cancelled");
      expect(badge).toHaveClass("bg-red-100");
    });

    it("renders 'Draft' project status", () => {
      render(<StatusBadge status="Draft" type="project" />);
      const badge = screen.getByText("Draft");
      expect(badge).toHaveClass("bg-slate-100");
    });

    it("defaults to 'Draft' styling for unknown project status", () => {
      render(<StatusBadge status="Unknown" type="project" />);
      const badge = screen.getByText("Unknown");
      expect(badge).toHaveClass("bg-slate-100");
    });
  });

  describe("Application Status", () => {
    it("renders 'Pending' application status", () => {
      render(<StatusBadge status="Pending" type="application" />);
      const badge = screen.getByText("Pending");
      expect(badge).toHaveClass("bg-gold/10");
    });

    it("renders 'Viewed' application status", () => {
      render(<StatusBadge status="Viewed" type="application" />);
      const badge = screen.getByText("Viewed");
      expect(badge).toHaveClass("bg-sky-blue/10");
    });

    it("renders 'Shortlisted' application status", () => {
      render(<StatusBadge status="Shortlisted" type="application" />);
      const badge = screen.getByText("Shortlisted");
      expect(badge).toHaveClass("bg-teal/10");
    });

    it("renders 'Hired' application status", () => {
      render(<StatusBadge status="Hired" type="application" />);
      const badge = screen.getByText("Hired");
      expect(badge).toHaveClass("bg-success-green/10");
    });

    it("renders 'Rejected' application status", () => {
      render(<StatusBadge status="Rejected" type="application" />);
      const badge = screen.getByText("Rejected");
      expect(badge).toHaveClass("bg-red-100");
    });

    it("defaults to 'Pending' styling for unknown application status", () => {
      render(<StatusBadge status="Unknown" type="application" />);
      const badge = screen.getByText("Unknown");
      expect(badge).toHaveClass("bg-gold/10");
    });
  });

  describe("User Status", () => {
    it("renders 'Active' user status with dot indicator", () => {
      const { container } = render(<StatusBadge status="Active" type="user" />);
      const badge = screen.getByText("Active");
      expect(badge).toBeInTheDocument();
      // For user type, check that the wrapper div has the correct class
      const wrapper = container.querySelector(".text-success-green");
      expect(wrapper).toBeInTheDocument();
    });

    it("renders 'Suspended' user status", () => {
      const { container } = render(<StatusBadge status="Suspended" type="user" />);
      const badge = screen.getByText("Suspended");
      expect(badge).toBeInTheDocument();
      const wrapper = container.querySelector(".text-red-600");
      expect(wrapper).toBeInTheDocument();
    });

    it("renders 'Pending' user status", () => {
      const { container } = render(<StatusBadge status="Pending" type="user" />);
      const badge = screen.getByText("Pending");
      expect(badge).toBeInTheDocument();
      const wrapper = container.querySelector(".text-gold");
      expect(wrapper).toBeInTheDocument();
    });

    it("defaults to 'Pending' styling for unknown user status", () => {
      const { container } = render(<StatusBadge status="Unknown" type="user" />);
      const badge = screen.getByText("Unknown");
      expect(badge).toBeInTheDocument();
      const wrapper = container.querySelector(".text-gold");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Default Type", () => {
    it("defaults to project type when type not specified", () => {
      render(<StatusBadge status="Open" />);
      const badge = screen.getByText("Open");
      expect(badge).toHaveClass("bg-teal/10");
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      render(<StatusBadge status="Open" className="custom-badge" />);
      const badge = screen.getByText("Open");
      expect(badge).toHaveClass("custom-badge");
    });
  });
});
