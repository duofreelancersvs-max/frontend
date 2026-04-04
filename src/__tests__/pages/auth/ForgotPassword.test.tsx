import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import ForgotPassword from "@/pages/auth/ForgotPassword";

vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    Mail: () => <svg data-testid="mail-icon" />,
    ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    KeyRound: () => <svg data-testid="key-round-icon" />,
  };
});

describe("ForgotPassword", () => {
  it("renders forgot password form initially", () => {
    renderWithRouter(<ForgotPassword />);
    // Check for "Reset Password" which is the card title
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john@example\.com/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("handles back to login link", () => {
    renderWithRouter(<ForgotPassword />);
    const backToLoginLink = screen.getByRole("link", { name: /back to login/i });
    expect(backToLoginLink).toHaveAttribute("href", "/login");
  });

  it("displays branding", () => {
    renderWithRouter(<ForgotPassword />);
    expect(screen.getAllByText("Connect").length).toBeGreaterThan(0);
  });
});
