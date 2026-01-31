import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import { LoginForm } from "@/components/forms/LoginForm";

describe("LoginForm", () => {
  const mockAlert = vi.fn();
  const mockConsoleLog = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("alert", mockAlert);
    vi.stubGlobal("console", { ...console, log: mockConsoleLog });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockAlert.mockClear();
    mockConsoleLog.mockClear();
  });

  it("renders login form with all fields", () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("displays form description", () => {
    renderWithRouter(<LoginForm />);
    expect(screen.getByText(/enter your credentials/i)).toBeInTheDocument();
  });

  it("allows entering username", async () => {
    renderWithRouter(<LoginForm />);
    const usernameInput = screen.getByLabelText(/username/i);
    await userEvent.type(usernameInput, "testuser");
    expect(usernameInput).toHaveValue("testuser");
  });

  it("allows entering email", async () => {
    renderWithRouter(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("shows validation error for short username", async () => {
    renderWithRouter(<LoginForm />);
    const usernameInput = screen.getByLabelText(/username/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });
    
    await userEvent.type(usernameInput, "a");
    await userEvent.click(submitButton);
    
    const errorMessage = await screen.findByText(/username must be at least 2 characters/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    renderWithRouter(<LoginForm />);
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });
    
    await userEvent.type(usernameInput, "validuser");
    await userEvent.type(emailInput, "invalid-email");
    await userEvent.click(submitButton);
    
    const errorMessage = await screen.findByText(/invalid email/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    renderWithRouter(<LoginForm />);
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });
    
    await userEvent.type(usernameInput, "validuser");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(submitButton);
    
    expect(mockConsoleLog).toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalled();
  });

  it("renders within a card component", () => {
    renderWithRouter(<LoginForm />);
    const card = document.querySelector("[class*='rounded-lg']");
    expect(card).toBeInTheDocument();
  });

  it("has submit button with full width", () => {
    renderWithRouter(<LoginForm />);
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toHaveClass("w-full");
  });
});
