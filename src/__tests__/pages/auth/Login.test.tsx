import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import Login from "../../../pages/auth/Login";

vi.mock("lucide-react", () => ({
  Eye: () => <svg data-testid="eye-icon" />,
  EyeOff: () => <svg data-testid="eye-off-icon" />,
  Mail: () => <svg data-testid="mail-icon" />,
  Lock: () => <svg data-testid="lock-icon" />,
  ArrowRight: () => <svg data-testid="arrow-right-icon" />,
  Quote: () => <svg data-testid="quote-icon" />,
}));

describe("Login", () => {
  it("renders login form with all fields", () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in$/i })).toBeInTheDocument();
  });

  it("allows entering email and password", () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("toggles password visibility", () => {
    renderWithRouter(<Login />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole("button", { name: "" });
    
    expect(passwordInput).toHaveAttribute("type", "password");
    
    fireEvent.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("handles remember me checkbox", () => {
    renderWithRouter(<Login />);
    
    const rememberCheckbox = screen.getByRole("checkbox");
    expect(rememberCheckbox).not.toBeChecked();
    
    fireEvent.click(rememberCheckbox);
    
    expect(rememberCheckbox).toBeChecked();
  });

  it("has link to forgot password page", () => {
    renderWithRouter(<Login />);
    
    const forgotPasswordLink = screen.getByRole("link", { name: /forgot password/i });
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  it("has link to register page", () => {
    renderWithRouter(<Login />);
    
    const registerLink = screen.getByRole("link", { name: /sign up/i });
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("displays loading state when submitting", async () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in$/i });
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /signing in/i })).toBeInTheDocument();
    });
  });

  it("displays Google sign in button", () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
  });

  it("displays logo and branding", () => {
    renderWithRouter(<Login />);
    
    // Check for branding elements - there are multiple instances of the logo
    const connectMeElements = screen.getAllByText("ConnectMe");
    expect(connectMeElements.length).toBeGreaterThanOrEqual(1);
    
    const indiaElements = screen.getAllByText("India");
    expect(indiaElements.length).toBeGreaterThanOrEqual(1);
  });

  it("disables submit button when loading", async () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in$/i });
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
