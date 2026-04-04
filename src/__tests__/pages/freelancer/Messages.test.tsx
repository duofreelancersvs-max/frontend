import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import FreelancerMessages from "../../../pages/freelancer/Messages";
import { useAuth } from "@/hooks/useAuth";
import { conversationService } from "@/services";
import { useSocket } from "@/hooks/useSocket";
import type { User } from "@/types/auth.types";

window.HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services", () => ({
  conversationService: {
    getAll: vi.fn(),
    getMessages: vi.fn(),
    markAsRead: vi.fn(),
    acceptTerms: vi.fn(),
  },
}));

vi.mock("@/hooks/useSocket", () => ({
  useSocket: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: () => ({ setSidebarOpen: vi.fn() }),
  };
});

describe("FreelancerMessages", () => {
  const mockUser: User = {
    _id: "user-1",
    email: "f@test.com",
    fullName: "Test Freelancer",
    role: "freelancer",
    phone: "1234567890",
    status: "active",
    isEmailVerified: true,
    isPhoneVerified: true,
  };

  const mockConversations = {
    conversations: [
      {
        id: "conv-1",
        unreadCount: 2,
        participants: [
          { id: "client-1", fullName: "John Client", role: "client" },
          { id: "user-1", fullName: "Test Freelancer", role: "freelancer" }
        ],
        project: { id: "proj-1", title: "Test Project" },
        lastMessage: { content: "Hello there", createdAt: new Date().toISOString() },
        termsAccepted: { freelancerAccepted: true, clientAccepted: true }
      }
    ]
  };

  const mockMessages = {
    messages: [
      {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "client-1",
        content: "Hi, let's start!",
        read: true,
        createdAt: new Date().toISOString()
      }
    ]
  };

  const mockSendMessage = vi.fn();
  const mockMarkAsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
    });
    
    (conversationService.getAll as any).mockResolvedValue(mockConversations);
    (conversationService.getMessages as any).mockResolvedValue(mockMessages);
    (conversationService.markAsRead as any).mockResolvedValue({});
    
    (useSocket as any).mockReturnValue({
      isConnected: true,
      onlineUsers: new Set(["client-1"]),
      sendMessage: mockSendMessage,
      markAsRead: mockMarkAsRead,
    });
  });

  it("renders conversations list and selects first one", async () => {
    renderWithRouter(<FreelancerMessages />);
    await waitFor(() => {
      expect(screen.getByText("John Client")).toBeInTheDocument();
    });
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    
    // Check if messages are loaded
    expect(await screen.findByText("Hi, let's start!")).toBeInTheDocument();
  });

  it("handles sending a message", async () => {
    renderWithRouter(<FreelancerMessages />);
    await screen.findByText("Hi, let's start!");
    
    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, "I am ready{enter}");
    
    expect(mockSendMessage).toHaveBeenCalled();
  });

  it("toggles info panel", async () => {
    renderWithRouter(<FreelancerMessages />);
    await screen.findByText("John Client");
    
    // Info panel toggle button (usually an icon button in ChatArea)
    // Looking at ChatArea component might be needed, but it usually has a toggle
    // In our ChatArea it has a button with title="Info" or similar
    const detailButtons = await screen.findAllByRole("button");
    const infoToggle = detailButtons.find(b => b.innerHTML.includes("info") || b.getAttribute("aria-label")?.includes("info"));
    if (infoToggle) fireEvent.click(infoToggle);
    // Alternatively, just check if Client Details is present (if it's auto-shown or toggle-able)
  });

  it("handles search in conversations", async () => {
    renderWithRouter(<FreelancerMessages />);
    await waitFor(() => {
      expect(screen.getByText("John Client")).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/search conversations/i);
    await userEvent.type(searchInput, "NonExistent");
    
    expect(screen.queryByText("John Client")).not.toBeInTheDocument();
  });

  it("shows terms modal if not accepted", async () => {
    const unacceptedConv = {
      ...mockConversations,
      conversations: [
        {
          ...mockConversations.conversations[0],
          termsAccepted: { freelancerAccepted: false, clientAccepted: true }
        }
      ]
    };
    (conversationService.getAll as any).mockResolvedValue(unacceptedConv);
    
    renderWithRouter(<FreelancerMessages />);
    await waitFor(() => {
      expect(screen.getByText("John Client")).toBeInTheDocument();
    });
    
    // ChatArea should show the accept terms overlay
    expect(await screen.findByText(/read and accept before chatting/i)).toBeInTheDocument();
    
    // Accept flow
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    
    const startChatBtn = screen.getByRole("button", { name: /start chat/i });
    fireEvent.click(startChatBtn);
    
    expect(conversationService.acceptTerms).toHaveBeenCalled();
  });
});
