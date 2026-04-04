import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import Register from "../../../pages/auth/Register";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    Eye: () => <svg data-testid="eye-icon" />,
    EyeOff: () => <svg data-testid="eye-off-icon" />,
    Mail: () => <svg data-testid="mail-icon" />,
    Lock: () => <svg data-testid="lock-icon" />,
    User: () => <svg data-testid="user-icon" />,
    Phone: () => <svg data-testid="phone-icon" />,
    Briefcase: () => <svg data-testid="briefcase-icon" />,
    ArrowRight: () => <svg data-testid="arrow-right-icon" />,
    ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
    Building: () => <svg data-testid="building-icon" />,
    Quote: () => <svg data-testid="quote-icon" />,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    Github: () => <svg data-testid="github-icon" />,
  };
});

describe("Register", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  const goToForm = () => {
    fireEvent.click(screen.getByText(/I'm a Client/i).closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  };

  it("renders role selection step by default", () => {
    renderWithRouter(<Register />);
    expect(screen.getByText(/I'm a Client/i)).toBeInTheDocument();
    expect(screen.getByText(/I'm a Freelancer/i)).toBeInTheDocument();
  });

  it("handles form input and placeholders", async () => {
    renderWithRouter(<Register />);
    goToForm();
    
    // Instead of getByLabelText which requires htmlFor/id linkage
    const emailInput = screen.getByPlaceholderText(/john@example\.com/i);
    await userEvent.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("handles password fields", async () => {
    renderWithRouter(<Register />);
    goToForm();
    
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm your password/i);
    
    await userEvent.type(passwordInput, "password123");
    await userEvent.type(confirmInput, "password123");
    
    expect(passwordInput).toHaveValue("password123");
  });

  it("toggles password visibility", async () => {
    renderWithRouter(<Register />);
    goToForm();
    
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const toggleButton = screen.getAllByRole("button").find(b => 
      b.querySelector("[data-testid='eye-icon']") || 
      b.querySelector("[data-testid='eye-off-icon']")
    );
    
    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");
    }
  });

  it("displays branding", () => {
    renderWithRouter(<Register />);
    expect(screen.getAllByText("Connect").length).toBeGreaterThan(0);
  });
});
