import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImagePreviewModal } from "@/components/modals/ImagePreviewModal";

describe("ImagePreviewModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    initialIndex: 0,
  };

  it("renders when isOpen is true", () => {
    render(<ImagePreviewModal {...defaultProps} />);
    const img = screen.getByAltText("Preview 1");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image1.jpg");
  });

  it("displays current image index", () => {
    render(<ImagePreviewModal {...defaultProps} caption="Gallery" />);
    // Caption and counter are in the same element, so check for both
    const captionElement = screen.getByText(/Gallery.*\(1.*\/.*2\)/);
    expect(captionElement).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    render(<ImagePreviewModal {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    // Close button is the first one
    await userEvent.click(buttons[0]);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("navigates to next image when next button is clicked", async () => {
    render(<ImagePreviewModal {...defaultProps} />);
    
    const nextButton = screen.getAllByRole("button")[2]; // Next button
    await userEvent.click(nextButton);
    
    const img = screen.getByAltText("Preview 2");
    expect(img).toHaveAttribute("src", "https://example.com/image2.jpg");
  });

  it("navigates to previous image when prev button is clicked", async () => {
    render(<ImagePreviewModal {...defaultProps} initialIndex={1} />);
    
    const prevButton = screen.getAllByRole("button")[1]; // Prev button
    await userEvent.click(prevButton);
    
    const img = screen.getByAltText("Preview 1");
    expect(img).toHaveAttribute("src", "https://example.com/image1.jpg");
  });

  it("does not show navigation buttons when only one image", () => {
    const { container } = render(<ImagePreviewModal {...defaultProps} images={["https://example.com/image1.jpg"]} />);
    // Check that prev and next buttons are not present by looking for the chevron icons
    const prevButton = container.querySelector("button .lucide-chevron-left");
    const nextButton = container.querySelector("button .lucide-chevron-right");
    expect(prevButton).not.toBeInTheDocument();
    expect(nextButton).not.toBeInTheDocument();
  });

  it("returns null when images array is empty", () => {
    const { container } = render(<ImagePreviewModal {...defaultProps} images={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays caption when provided", () => {
    render(<ImagePreviewModal {...defaultProps} caption="My Gallery" />);
    // Caption and counter are rendered together, so check with regex
    expect(screen.getByText(/My Gallery/)).toBeInTheDocument();
  });
});
