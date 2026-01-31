import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import ProjectDetails from "@/pages/client/ProjectDetails";

// Mock useParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
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
    ChevronRight: () => <svg data-testid="chevron-right-icon" />,
    Edit2: () => <svg data-testid="edit-icon" />,
    Share2: () => <svg data-testid="share-icon" />,
    XCircle: () => <svg data-testid="x-circle-icon" />,
    Download: () => <svg data-testid="download-icon" />,
    FileText: () => <svg data-testid="file-text-icon" />,
    Clock: () => <svg data-testid="clock-icon" />,
    Calendar: () => <svg data-testid="calendar-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    Briefcase: () => <svg data-testid="briefcase-icon" />,
    Users: () => <svg data-testid="users-icon" />,
    MessageSquare: () => <svg data-testid="message-square-icon" />,
    Heart: () => <svg data-testid="heart-icon" />,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    Eye: () => <svg data-testid="eye-icon" />,
    ThumbsUp: () => <svg data-testid="thumbs-up-icon" />,
    ThumbsDown: () => <svg data-testid="thumbs-down-icon" />,
    Send: () => <svg data-testid="send-icon" />,
    Award: () => <svg data-testid="award-icon" />,
    TrendingUp: () => <svg data-testid="trending-up-icon" />,
    Verified: () => <svg data-testid="verified-icon" />,
  };
});

describe("ProjectDetails", () => {
  it("renders project title", () => {
    renderWithRouter(<ProjectDetails />);
    expect(
      screen.getAllByText(/e-commerce product video/i).length
    ).toBeGreaterThan(0);
  });

  it("renders project status badge", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getByText(/open for applications/i)).toBeInTheDocument();
  });

  it("renders project category", () => {
    renderWithRouter(<ProjectDetails />);
    expect(
      screen.getAllByText(/video editing/i).length
    ).toBeGreaterThan(0);
  });

  it("renders project description", () => {
    renderWithRouter(<ProjectDetails />);
    expect(
      screen.getByText(/looking for a skilled video editor/i)
    ).toBeInTheDocument();
  });

  it("renders budget information", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getAllByText(/15,000/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/25,000/i).length).toBeGreaterThan(0);
  });

  it("renders project duration", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getByText(/1-4 weeks/i)).toBeInTheDocument();
  });

  it("renders experience level", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
  });

  it("renders location preference", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getByText(/remote/i)).toBeInTheDocument();
  });

  it("renders required skills", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getAllByText(/adobe premiere pro/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/after effects/i).length).toBeGreaterThan(0);
  });

  it("renders applications count", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getAllByText(/12/i).length).toBeGreaterThan(0);
  });

  it("renders posted date", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getAllByText(/3 days ago/i).length).toBeGreaterThan(0);
  });

  it("renders sidebar navigation", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/my projects/i).length).toBeGreaterThan(0);
  });

  it("renders edit project button", () => {
    renderWithRouter(<ProjectDetails />);
    const editButtons = screen.getAllByRole("button").filter((btn) =>
      btn.textContent?.toLowerCase().includes("edit")
    );
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it("renders applications section", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getAllByText(/applications/i).length).toBeGreaterThan(0);
  });

  it("renders project deliverables section", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getByText(/deliverables/i)).toBeInTheDocument();
  });

  it("renders project activity section", () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getByText(/activity log/i)).toBeInTheDocument();
  });
});
