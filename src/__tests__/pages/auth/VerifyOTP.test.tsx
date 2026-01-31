import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import VerifyOTP from "@/pages/auth/VerifyOTP";

// Mock lucide-react icons
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
  return {
    ...actual,
    ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    Smartphone: () => <svg data-testid="smartphone-icon" />,
  };
});

// Mock window.location
const mockHref = vi.fn();
Object.defineProperty(window, "location", {
  writable: true,
  configurable: true,
  value: { href: mockHref },
});

describe("VerifyOTP", () => {
  it("renders page with branding", () => {
    renderWithRouter(<VerifyOTP />);
    expect(screen.getAllByText(/connectme/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/india/i).length).toBeGreaterThan(0);
  });

  it("renders left side branding content", () => {
    renderWithRouter(<VerifyOTP />);
    expect(screen.getByText(/almost there!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/we've sent a verification code to your phone/i)
    ).toBeInTheDocument();
  });

  it("renders secure verification note", () => {
    renderWithRouter(<VerifyOTP />);
    expect(screen.getByText(/secure verification/i)).toBeInTheDocument();
    expect(
      screen.getByText(/your phone number helps us keep your account secure/i)
    ).toBeInTheDocument();
  });

  it("renders verify form with title", () => {
    renderWithRouter(<VerifyOTP />);
    expect(screen.getByText(/verify your phone/i)).toBeInTheDocument();
    expect(
      screen.getByText(/enter the 6-digit code sent to/i)
    ).toBeInTheDocument();
  });

  it("displays masked phone number", () => {
    renderWithRouter(<VerifyOTP />);
    expect(screen.getByText(/\+91 xxxxxx1234/i)).toBeInTheDocument();
  });

  it("renders 6 OTP input fields", () => {
    renderWithRouter(<VerifyOTP />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBe(6);
  });

  it("allows entering OTP digits", async () => {
    renderWithRouter(<VerifyOTP />);
    const inputs = screen.getAllByRole("textbox");
    await userEvent.type(inputs[0], "1");
    await userEvent.type(inputs[1], "2");
    await userEvent.type(inputs[2], "3");
    expect(inputs[0]).toHaveValue("1");
    expect(inputs[1]).toHaveValue("2");
    expect(inputs[2]).toHaveValue("3");
  });

  it("renders verify button", () => {
    renderWithRouter(<VerifyOTP />);
    expect(screen.getByRole("button", { name: /verify/i })).toBeInTheDocument();
  });

  it("verify button is disabled when OTP is incomplete", () => {
    renderWithRouter(<VerifyOTP />);
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    expect(verifyButton).toBeDisabled();
  });

  it("renders back button to register page", () => {
    renderWithRouter(<VerifyOTP />);
    const backLink = screen.getByRole("link", { name: /back/i });
    expect(backLink).toHaveAttribute("href", "/register");
  });

  it("renders resend code section", () => {
    renderWithRouter(<VerifyOTP />);
    expect(screen.getByText(/didn't receive code/i)).toBeInTheDocument();
    expect(screen.getByText(/resend in/i)).toBeInTheDocument();
  });

  it("shows countdown timer initially", () => {
    renderWithRouter(<VerifyOTP />);
    expect(screen.getByText(/30s/i)).toBeInTheDocument();
  });

  it("renders change phone number link", () => {
    renderWithRouter(<VerifyOTP />);
    const changePhoneLink = screen.getByRole("link", { name: /change phone number/i });
    expect(changePhoneLink).toHaveAttribute("href", "/register");
  });

  it("allows completing OTP entry", async () => {
    renderWithRouter(<VerifyOTP />);
    const inputs = screen.getAllByRole("textbox");
    for (let i = 0; i < 6; i++) {
      await userEvent.type(inputs[i], String(i + 1));
    }
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    expect(verifyButton).not.toBeDisabled();
  });

  it("shows loading state when verifying", async () => {
    renderWithRouter(<VerifyOTP />);
    const inputs = screen.getAllByRole("textbox");
    for (let i = 0; i < 6; i++) {
      await userEvent.type(inputs[i], String(i + 1));
    }
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    await userEvent.click(verifyButton);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /verifying/i })
      ).toBeInTheDocument();
    });
  });

  it("shows loading state when submitting", async () => {
    renderWithRouter(<VerifyOTP />);
    const inputs = screen.getAllByRole("textbox");
    for (let i = 0; i < 6; i++) {
      await userEvent.type(inputs[i], String(i + 1));
    }
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    await userEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /verifying/i })
      ).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("has correct input type for OTP fields", () => {
    renderWithRouter(<VerifyOTP />);
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("inputmode", "numeric");
      expect(input).toHaveAttribute("maxlength", "1");
    });
  });
});
