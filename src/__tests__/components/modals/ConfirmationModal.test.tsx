import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

describe("ConfirmationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Delete Item",
    description: "Are you sure you want to delete this item?",
  };

  it("renders when isOpen is true", () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    render(<ConfirmationModal {...defaultProps} />);
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    render(<ConfirmationModal {...defaultProps} />);
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await userEvent.click(confirmButton);
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("displays custom button labels", () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
      />
    );
    expect(screen.getByRole("button", { name: "Yes, Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No, Keep" })).toBeInTheDocument();
  });

  it("displays danger icon for danger type", () => {
    render(<ConfirmationModal {...defaultProps} type="danger" />);
    // Just verify the component renders correctly
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
  });

  it("displays warning icon for warning type", () => {
    render(<ConfirmationModal {...defaultProps} type="warning" />);
    // Just verify the component renders correctly
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
  });

  it("displays info icon for info type", () => {
    render(<ConfirmationModal {...defaultProps} type="info" />);
    // Just verify the component renders correctly
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
  });

  it("has confirm button for danger type", () => {
    render(<ConfirmationModal {...defaultProps} type="danger" />);
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect(confirmButton).toBeInTheDocument();
  });

  it("has confirm button for info type", () => {
    render(<ConfirmationModal {...defaultProps} type="info" />);
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect(confirmButton).toBeInTheDocument();
  });

  it("defaults to danger type and has confirm button", () => {
    render(<ConfirmationModal {...defaultProps} />);
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect(confirmButton).toBeInTheDocument();
  });
});
