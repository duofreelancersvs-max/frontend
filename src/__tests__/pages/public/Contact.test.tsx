import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import Contact from "@/pages/public/Contact";

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

describe("Contact", () => {
  it("renders page header with title", () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText(/get in/i)).toBeInTheDocument();
    expect(screen.getByText(/touch/i)).toBeInTheDocument();
  });

  it("renders contact form", () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText(/send us a message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your message/i)).toBeInTheDocument();
  });

  it("renders contact information sections", () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText(/our office/i)).toBeInTheDocument();
    expect(screen.getByText(/email us/i)).toBeInTheDocument();
    expect(screen.getByText(/call us/i)).toBeInTheDocument();
    expect(screen.getByText(/working hours/i)).toBeInTheDocument();
  });

  it("displays address information", () => {
    renderWithRouter(<Contact />);
    // Use getAllByText since there are multiple instances
    expect(screen.getAllByText(/t-hub/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/hyderabad/i).length).toBeGreaterThan(0);
  });

  it("displays email address", () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText(/hello@connectmeindia.in/i)).toBeInTheDocument();
  });

  it("displays phone number", () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText(/\+91 40 1234 5678/i)).toBeInTheDocument();
  });

  it("displays working hours", () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText(/monday - friday/i)).toBeInTheDocument();
  });

  it("allows entering name in form", async () => {
    renderWithRouter(<Contact />);
    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.type(nameInput, "John Doe");
    expect(nameInput).toHaveValue("John Doe");
  });

  it("allows entering email in form", async () => {
    renderWithRouter(<Contact />);
    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.type(emailInput, "john@example.com");
    expect(emailInput).toHaveValue("john@example.com");
  });

  it("allows entering phone in form", async () => {
    renderWithRouter(<Contact />);
    const phoneInput = screen.getByLabelText(/phone number/i);
    await userEvent.type(phoneInput, "+91 98765 43210");
    expect(phoneInput).toHaveValue("+91 98765 43210");
  });

  it("allows entering message in form", async () => {
    renderWithRouter(<Contact />);
    const messageInput = screen.getByLabelText(/your message/i);
    await userEvent.type(messageInput, "Hello, I need help with...");
    expect(messageInput).toHaveValue("Hello, I need help with...");
  });

  it("has subject dropdown", () => {
    renderWithRouter(<Contact />);
    const subjectSelect = screen.getByLabelText(/subject/i);
    expect(subjectSelect).toBeInTheDocument();
  });

  it("has send message button", () => {
    renderWithRouter(<Contact />);
    const sendButton = screen.getByRole("button", { name: /send message/i });
    expect(sendButton).toBeInTheDocument();
  });

  it("renders FAQ section", () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
    expect(screen.getByText(/what are your support hours/i)).toBeInTheDocument();
  });

  it("allows toggling FAQ items", async () => {
    renderWithRouter(<Contact />);
    const faqButton = screen.getByText(/what are your support hours/i).closest("button");
    if (faqButton) {
      await userEvent.click(faqButton);
      expect(screen.getByText(/monday through friday/i)).toBeInTheDocument();
    }
  });

  it("displays navigation with links", () => {
    renderWithRouter(<Contact />);
    // Use getAllByRole since there are multiple links with same name
    expect(screen.getAllByRole("link", { name: /home/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /about/i }).length).toBeGreaterThan(0);
  });

  it("has breadcrumb navigation", () => {
    renderWithRouter(<Contact />);
    // Use getAllByText since there are multiple instances
    expect(screen.getAllByText(/contact us/i).length).toBeGreaterThan(0);
  });

  it("renders footer with links", () => {
    renderWithRouter(<Contact />);
    // Use getAllByText since there are multiple instances
    expect(screen.getAllByText(/connectmeindia/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2024/i).length).toBeGreaterThan(0);
  });

  it("displays map section", () => {
    renderWithRouter(<Contact />);
    const mapIframe = document.querySelector("iframe");
    expect(mapIframe).toBeInTheDocument();
  });
});
