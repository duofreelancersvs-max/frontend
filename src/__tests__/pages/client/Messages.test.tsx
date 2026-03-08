import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import Messages from "@/pages/client/Messages";

// Mock scrollIntoView for tests
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      _id: "user-1",
      fullName: "Rajesh Kumar",
      email: "rajesh@test.com",
      role: "client",
    },
  }),
}));

// Mock useSocket hook
vi.mock("@/hooks/useSocket", () => ({
  useSocket: () => ({
    isConnected: true,
    onlineUsers: new Set<string>(),
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
  }),
}));

// Mock conversation service
vi.mock("@/services", async () => {
  const actual = await vi.importActual("@/services");
  return {
    ...actual,
    conversationService: {
      getAll: vi.fn().mockResolvedValue({
        conversations: [
          {
            id: "conv-1",
            participantIds: ["user-1", "user-2"],
            participants: [
              { id: "user-1", fullName: "Rajesh Kumar", role: "client" },
              { id: "user-2", fullName: "Arun Kumar", role: "freelancer" },
            ],
            lastMessage: {
              content: "Sure, I can deliver the first draft",
              createdAt: new Date().toISOString(),
            },
            unreadCount: 2,
            projectId: "proj-1",
            project: { id: "proj-1", title: "E-Commerce Product Video" },
            termsAccepted: {
              clientAccepted: true,
              freelancerAccepted: true,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }),
      getMessages: vi.fn().mockResolvedValue({
        messages: [
          {
            id: "msg-1",
            conversationId: "conv-1",
            senderId: "user-2",
            content: "Hello, I'm interested in the project",
            read: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: "msg-2",
            conversationId: "conv-1",
            senderId: "user-1",
            content: "Sure, I can deliver the first draft",
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }),
      acceptTerms: vi.fn().mockResolvedValue({}),
    },
  };
});

// Mock useOutletContext
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useOutletContext: () => ({
      setSidebarOpen: vi.fn(),
    }),
  };
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
    BadgeCheck: () => <svg data-testid="badge-check-icon" />,
    ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
    Building2: () => <svg data-testid="building2-icon" />,
    FileSignature: () => <svg data-testid="file-signature-icon" />,
  };
});

describe("Messages", () => {
  it("renders messages page header", async () => {
    renderWithRouter(<Messages />);
    await waitFor(() => {
      expect(screen.getAllByText(/messages/i).length).toBeGreaterThan(0);
    });
  });

  it("renders search conversations input", async () => {
    renderWithRouter(<Messages />);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/search conversations/i),
      ).toBeInTheDocument();
    });
  });

  it("renders conversations list filter pills", async () => {
    renderWithRouter(<Messages />);
    await waitFor(() => {
      expect(screen.getByText(/all/i)).toBeInTheDocument();
      expect(screen.getByText(/unread/i)).toBeInTheDocument();
    });
  });

  it("renders freelancer names in conversation list", async () => {
    renderWithRouter(<Messages />);
    await waitFor(() => {
      expect(screen.getAllByText(/arun kumar/i).length).toBeGreaterThan(0);
    });
  });

  it("renders project title in conversation", async () => {
    renderWithRouter(<Messages />);
    await waitFor(() => {
      expect(
        screen.getAllByText(/e-commerce product video/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it("renders chat input area when terms accepted", async () => {
    renderWithRouter(<Messages />);
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/type a message/i);
      expect(input).toBeInTheDocument();
    });
  });

  it("renders send button", async () => {
    renderWithRouter(<Messages />);
    await waitFor(() => {
      const sendButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("[data-testid='send-icon']"));
      expect(sendButtons.length).toBeGreaterThan(0);
    });
  });

  it("renders mobile menu button", async () => {
    renderWithRouter(<Messages />);
    await waitFor(() => {
      const menuButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("[data-testid='menu-icon']"));
      expect(menuButtons.length).toBeGreaterThan(0);
    });
  });
});
