import { describe, it, expect, vi, beforeAll } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import Messages from "@/pages/client/Messages";

// Mock scrollIntoView for tests
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

// Mock lucide-react icons
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
  return {
    ...actual,
    Home: () => <svg data-testid="home-icon" />,
    Folder: () => <svg data-testid="folder-icon" />,
    PlusCircle: () => <svg data-testid="plus-circle-icon" />,
    Search: () => <svg data-testid="search-icon" />,
    Mail: () => <svg data-testid="mail-icon" />,
    CreditCard: () => <svg data-testid="credit-card-icon" />,
    Star: () => <svg data-testid="star-icon" />,
    Settings: () => <svg data-testid="settings-icon" />,
    Bell: () => <svg data-testid="bell-icon" />,
    ChevronDown: () => <svg data-testid="chevron-down-icon" />,
    LogOut: () => <svg data-testid="logout-icon" />,
    User: () => <svg data-testid="user-icon" />,
    X: () => <svg data-testid="x-icon" />,
    Menu: () => <svg data-testid="menu-icon" />,
    Send: () => <svg data-testid="send-icon" />,
    Paperclip: () => <svg data-testid="paperclip-icon" />,
    MoreVertical: () => <svg data-testid="more-vertical-icon" />,
    Phone: () => <svg data-testid="phone-icon" />,
    Video: () => <svg data-testid="video-icon" />,
    Check: () => <svg data-testid="check-icon" />,
    CheckCheck: () => <svg data-testid="check-check-icon" />,
    Image: () => <svg data-testid="image-icon" />,
    Smile: () => <svg data-testid="smile-icon" />,
    MessageSquare: () => <svg data-testid="message-square-icon" />,
    ExternalLink: () => <svg data-testid="external-link-icon" />,
    Shield: () => <svg data-testid="shield-icon" />,
    Ban: () => <svg data-testid="ban-icon" />,
    Verified: () => <svg data-testid="verified-icon" />,
    ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
  };
});

describe("Messages", () => {
  it("renders messages page header", () => {
    renderWithRouter(<Messages />);
    expect(screen.getAllByText(/messages/i).length).toBeGreaterThan(0);
  });

  it("renders conversations list sidebar", () => {
    renderWithRouter(<Messages />);
    expect(screen.getByText(/all/i)).toBeInTheDocument();
    expect(screen.getByText(/unread/i)).toBeInTheDocument();
  });

  it("renders freelancer names in conversation list", () => {
    renderWithRouter(<Messages />);
    expect(screen.getAllByText(/arun kumar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/priya sharma/i).length).toBeGreaterThan(0);
  });

  it("renders freelancer titles/roles", () => {
    renderWithRouter(<Messages />);
    expect(
      screen.getAllByText(/senior video editor/i).length
    ).toBeGreaterThan(0);
  });

  it("renders message preview text", () => {
    renderWithRouter(<Messages />);
    expect(
      screen.getAllByText(/sure, i can deliver the first draft/i).length
    ).toBeGreaterThan(0);
  });

  it("renders chat input area", () => {
    renderWithRouter(<Messages />);
    const input = screen.getByPlaceholderText(/type a message/i);
    expect(input).toBeInTheDocument();
  });

  it("renders send button", () => {
    renderWithRouter(<Messages />);
    const sendButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='send-icon']")
    );
    expect(sendButtons.length).toBeGreaterThan(0);
  });

  it("renders attachment button", () => {
    renderWithRouter(<Messages />);
    const attachButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='paperclip-icon']")
    );
    expect(attachButtons.length).toBeGreaterThan(0);
  });

  it("renders project context in chat header", () => {
    renderWithRouter(<Messages />);
    expect(
      screen.getAllByText(/e-commerce product video/i).length
    ).toBeGreaterThan(0);
  });

  it("renders message timestamps", () => {
    renderWithRouter(<Messages />);
    expect(screen.getByText(/2 min ago/i)).toBeInTheDocument();
  });

  it("displays unread message count", () => {
    renderWithRouter(<Messages />);
    expect(screen.getAllByText(/2/i).length).toBeGreaterThan(0);
  });

  it("renders sidebar navigation", () => {
    renderWithRouter(<Messages />);
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/messages/i).length).toBeGreaterThan(0);
  });

  it("renders user profile in sidebar", () => {
    renderWithRouter(<Messages />);
    expect(screen.getByText(/rajesh kumar/i)).toBeInTheDocument();
  });

  it("renders search conversations input", () => {
    renderWithRouter(<Messages />);
    expect(
      screen.getByPlaceholderText(/search conversations/i)
    ).toBeInTheDocument();
  });

  it("renders mobile menu button", () => {
    renderWithRouter(<Messages />);
    const menuButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("[data-testid='menu-icon']"));
    expect(menuButtons.length).toBeGreaterThan(0);
  });
});
