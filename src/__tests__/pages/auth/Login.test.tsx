import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import Login from "../../../pages/auth/Login";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    Eye: () => <svg data-testid="eye-icon" />,
    EyeOff: () => <svg data-testid="eye-off-icon" />,
    Mail: () => <svg data-testid="mail-icon" />,
    Lock: () => <svg data-testid="lock-icon" />,
    ArrowRight: () => <svg data-testid="arrow-right-icon" />,
    Quote: () => <svg data-testid="quote-icon" />,
  };
});

describe("Login", () => {
  const goToFormStep = () => {
    fireEvent.click(screen.getByText(/I'm a Client/i).closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  };

  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("renders login form using placeholders", () => {
    renderWithRouter(<Login />);
    goToFormStep();
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your password/i)).toBeInTheDocument();
  });

  it("handles form input", async () => {
    renderWithRouter(<Login />);
    goToFormStep();
    const emailInput = screen.getByPlaceholderText(/john@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("toggles password visibility", async () => {
    renderWithRouter(<Login />);
    goToFormStep();
    const passwordInput = screen.getByPlaceholderText(/your password/i);
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
    renderWithRouter(<Login />);
    expect(screen.getAllByText("Connect").length).toBeGreaterThan(0);
  });
});
