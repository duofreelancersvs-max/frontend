import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import ForgotPassword from "@/pages/auth/ForgotPassword";

describe("ForgotPassword", () => {
  it("renders forgot password form initially", () => {
    renderWithRouter(<ForgotPassword />);
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it("renders email input field", () => {
    renderWithRouter(<ForgotPassword />);
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("allows entering email address", async () => {
    renderWithRouter(<ForgotPassword />);
    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("has submit button", () => {
    renderWithRouter(<ForgotPassword />);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("displays loading state when submitting", async () => {
    renderWithRouter(<ForgotPassword />);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    
    await userEvent.type(emailInput, "test@example.com");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sending/i })).toBeInTheDocument();
    });
  });

  it("shows success state after form submission", async () => {
    renderWithRouter(<ForgotPassword />);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    
    await userEvent.type(emailInput, "test@example.com");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("displays entered email in success message", async () => {
    renderWithRouter(<ForgotPassword />);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    
    await userEvent.type(emailInput, "test@example.com");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("has back to login link", () => {
    renderWithRouter(<ForgotPassword />);
    const backLink = screen.getByRole("link", { name: /back to login/i });
    expect(backLink).toHaveAttribute("href", "/login");
  });

  it("has sign in link at bottom", () => {
    renderWithRouter(<ForgotPassword />);
    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toHaveAttribute("href", "/login");
  });

  it("displays ConnectMe branding", () => {
    renderWithRouter(<ForgotPassword />);
    expect(screen.getAllByText("ConnectMe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("India").length).toBeGreaterThan(0);
  });

  it("has try again button in success state", async () => {
    renderWithRouter(<ForgotPassword />);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    
    await userEvent.type(emailInput, "test@example.com");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const tryAgainButton = screen.getByRole("button", { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("has back to login button in success state", async () => {
    renderWithRouter(<ForgotPassword />);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    
    await userEvent.type(emailInput, "test@example.com");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const backButton = screen.getByRole("button", { name: /back to login/i });
      expect(backButton).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
