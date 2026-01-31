import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import Register from "@/pages/auth/Register";

describe("Register", () => {
  it("renders role selection step by default", () => {
    renderWithRouter(<Register />);
    expect(screen.getByText(/join our community/i)).toBeInTheDocument();
    expect(screen.getByText(/i want to:/i)).toBeInTheDocument();
  });

  it("renders client and freelancer role options", () => {
    renderWithRouter(<Register />);
    expect(screen.getByText(/hire talent/i)).toBeInTheDocument();
    expect(screen.getByText(/find work/i)).toBeInTheDocument();
  });

  it("allows selecting client role", async () => {
    renderWithRouter(<Register />);
    const clientButton = screen.getByText(/hire talent/i).closest("button");
    if (clientButton) {
      await userEvent.click(clientButton);
      expect(clientButton).toHaveClass("border-teal");
    }
  });

  it("allows selecting freelancer role", async () => {
    renderWithRouter(<Register />);
    const freelancerButton = screen.getByText(/find work/i).closest("button");
    if (freelancerButton) {
      await userEvent.click(freelancerButton);
      expect(freelancerButton).toHaveClass("border-teal");
    }
  });

  it("disables continue button when no role selected", () => {
    renderWithRouter(<Register />);
    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it("enables continue button after role selection", async () => {
    renderWithRouter(<Register />);
    const clientButton = screen.getByText(/hire talent/i).closest("button");
    if (clientButton) {
      await userEvent.click(clientButton);
    }
    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).not.toBeDisabled();
  });

  it("navigates to client form after selecting client role and clicking continue", async () => {
    renderWithRouter(<Register />);
    const clientButton = screen.getByText(/hire talent/i).closest("button");
    if (clientButton) {
      await userEvent.click(clientButton);
    }
    const continueButton = screen.getByRole("button", { name: /continue/i });
    await userEvent.click(continueButton);
    expect(screen.getByText(/create client account/i)).toBeInTheDocument();
  });

  it("navigates to freelancer form after selecting freelancer role and clicking continue", async () => {
    renderWithRouter(<Register />);
    const freelancerButton = screen.getByText(/find work/i).closest("button");
    if (freelancerButton) {
      await userEvent.click(freelancerButton);
    }
    const continueButton = screen.getByRole("button", { name: /continue/i });
    await userEvent.click(continueButton);
    expect(screen.getByText(/create freelancer account/i)).toBeInTheDocument();
  });

  it("renders client form fields when client role selected", async () => {
    renderWithRouter(<Register />);
    const clientButton = screen.getByText(/hire talent/i).closest("button");
    if (clientButton) {
      await userEvent.click(clientButton);
    }
    const continueButton = screen.getByRole("button", { name: /continue/i });
    await userEvent.click(continueButton);
    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your company/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john@company.com/i)).toBeInTheDocument();
  });

  it("renders freelancer form fields when freelancer role selected", async () => {
    renderWithRouter(<Register />);
    const freelancerButton = screen.getByText(/find work/i).closest("button");
    if (freelancerButton) {
      await userEvent.click(freelancerButton);
    }
    const continueButton = screen.getByRole("button", { name: /continue/i });
    await userEvent.click(continueButton);
    // Check for form inputs by placeholder - getAll since there may be multiple
    expect(screen.getAllByPlaceholderText(/john/i).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/^doe$/i)).toBeInTheDocument();
    // Check for skill select dropdown
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("has back button on form step", async () => {
    renderWithRouter(<Register />);
    const clientButton = screen.getByText(/hire talent/i).closest("button");
    if (clientButton) {
      await userEvent.click(clientButton);
    }
    const continueButton = screen.getByRole("button", { name: /continue/i });
    await userEvent.click(continueButton);
    expect(screen.getByText(/back/i)).toBeInTheDocument();
  });

  it("has link to login page", () => {
    renderWithRouter(<Register />);
    const loginLink = screen.getByRole("link", { name: /sign in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("has link to terms and privacy pages", async () => {
    renderWithRouter(<Register />);
    const clientButton = screen.getByText(/hire talent/i).closest("button");
    if (clientButton) {
      await userEvent.click(clientButton);
    }
    const continueButton = screen.getByRole("button", { name: /continue/i });
    await userEvent.click(continueButton);
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  });

  it("displays ConnectMe branding", () => {
    renderWithRouter(<Register />);
    expect(screen.getAllByText("ConnectMe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("India").length).toBeGreaterThan(0);
  });
});
