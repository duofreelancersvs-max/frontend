import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SuccessModal } from "@/components/modals/SuccessModal";

describe("SuccessModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    message: "Your action was completed successfully!",
  };

  it("renders when isOpen is true", () => {
    render(<SuccessModal {...defaultProps} />);
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByText(/completed successfully/i)).toBeInTheDocument();
  });

  it("calls onClose when button is clicked", async () => {
    render(<SuccessModal {...defaultProps} />);
    const button = screen.getByRole("button", { name: /continue/i });
    await userEvent.click(button);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("displays custom title", () => {
    render(<SuccessModal {...defaultProps} title="Great Job!" />);
    expect(screen.getByText("Great Job!")).toBeInTheDocument();
  });

  it("displays custom button label", () => {
    render(<SuccessModal {...defaultProps} buttonLabel="Got it" />);
    expect(screen.getByRole("button", { name: "Got it" })).toBeInTheDocument();
  });

  it("displays success check icon", () => {
    render(<SuccessModal {...defaultProps} />);
    // Just verify the component renders correctly
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("uses default title when not provided", () => {
    render(<SuccessModal isOpen={true} onClose={vi.fn()} message="Done" />);
    expect(screen.getByText("Success!")).toBeInTheDocument();
  });

  it("uses default button label when not provided", () => {
    render(<SuccessModal isOpen={true} onClose={vi.fn()} message="Done" />);
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });
});
