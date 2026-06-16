import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { TermsModal } from "@/components/modals/TermsModal";

describe("TermsModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onAgree: vi.fn(),
  };

  const renderModal = (props = defaultProps) => {
    return render(
      <MemoryRouter>
        <TermsModal {...props} />
      </MemoryRouter>
    );
  };

  it("renders when isOpen is true", () => {
    renderModal();
    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
  });

  it("displays terms content", () => {
    renderModal();
    expect(screen.getByText(/1\. Platform Nature/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Payments & Agreements/i)).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    renderModal();
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("disables agree button when checkbox is not checked", () => {
    renderModal();
    const agreeButton = screen.getByRole("button", { name: /i agree/i });
    expect(agreeButton).toBeDisabled();
  });

  it("enables agree button after checking checkbox", async () => {
    renderModal();
    
    // Click on the checkbox container using a regex match on the actual text
    const checkboxContainer = screen.getByText(/I agree with the/i).parentElement;
    if (checkboxContainer) {
      await userEvent.click(checkboxContainer);
    }
    
    const agreeButton = screen.getByRole("button", { name: /i agree/i });
    // After clicking checkbox, button should be enabled
    expect(agreeButton).not.toBeDisabled();
  });

  it("calls onAgree when agree button is clicked", async () => {
    renderModal();
    
    // First check the checkbox
    const checkboxContainer = screen.getByText(/I agree with the/i).parentElement;
    if (checkboxContainer) {
      await userEvent.click(checkboxContainer);
    }
    
    // Then click agree
    const agreeButton = screen.getByRole("button", { name: /i agree/i });
    await userEvent.click(agreeButton);
    
    expect(defaultProps.onAgree).toHaveBeenCalledTimes(1);
  });

  it("displays last updated date", () => {
    renderModal();
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });
});
