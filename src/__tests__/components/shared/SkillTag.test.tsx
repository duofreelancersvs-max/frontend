import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillTag } from "@/components/shared/SkillTag";

describe("SkillTag", () => {
  it("renders skill label", () => {
    render(<SkillTag label="React" />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("applies default styling", () => {
    render(<SkillTag label="JavaScript" />);
    const tag = screen.getByText("JavaScript");
    expect(tag).toHaveClass("inline-flex");
    expect(tag).toHaveClass("bg-teal/10");
    expect(tag).toHaveClass("text-teal");
    expect(tag).toHaveClass("rounded-full");
  });

  it("does not show remove button when onRemove not provided", () => {
    render(<SkillTag label="React" />);
    const removeButton = screen.queryByLabelText(/remove/i);
    expect(removeButton).not.toBeInTheDocument();
  });

  it("shows remove button when onRemove is provided", () => {
    render(<SkillTag label="React" onRemove={() => {}} />);
    const removeButton = screen.getByLabelText("Remove React");
    expect(removeButton).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const handleRemove = vi.fn();
    render(<SkillTag label="React" onRemove={handleRemove} />);
    const removeButton = screen.getByLabelText("Remove React");
    await userEvent.click(removeButton);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it("applies hover styling when onRemove is provided", () => {
    render(<SkillTag label="React" onRemove={() => {}} />);
    // Find the span that wraps the tag (the parent of the text node)
    const tag = screen.getByText("React").closest("span");
    expect(tag).toHaveClass("pr-1");
    expect(tag).toHaveClass("hover:bg-teal/20");
  });

  it("applies custom className", () => {
    render(<SkillTag label="React" className="custom-skill" />);
    const tag = screen.getByText("React");
    expect(tag).toHaveClass("custom-skill");
  });

  it("stops event propagation when remove button is clicked", async () => {
    const parentClick = vi.fn();
    const handleRemove = vi.fn();
    
    render(
      <div onClick={parentClick}>
        <SkillTag label="React" onRemove={handleRemove} />
      </div>
    );
    
    const removeButton = screen.getByLabelText("Remove React");
    await userEvent.click(removeButton);
    
    expect(handleRemove).toHaveBeenCalled();
    expect(parentClick).not.toHaveBeenCalled();
  });
});
