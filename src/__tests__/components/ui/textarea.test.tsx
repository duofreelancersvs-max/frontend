import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
  it("renders textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("handles text input correctly", async () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "Hello World");
    expect(textarea).toHaveValue("Hello World");
  });

  it("applies custom className", () => {
    render(<Textarea className="custom-class" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("custom-class");
  });

  it("handles placeholder text", () => {
    render(<Textarea placeholder="Enter your message" />);
    expect(screen.getByPlaceholderText("Enter your message")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("handles onChange events", async () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "a");
    expect(handleChange).toHaveBeenCalled();
  });

  it("forwards additional props", () => {
    render(<Textarea data-testid="test-textarea" maxLength={200} rows={5} />);
    const textarea = screen.getByTestId("test-textarea");
    expect(textarea).toHaveAttribute("maxLength", "200");
    expect(textarea).toHaveAttribute("rows", "5");
  });

  it("has default minimum height", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("min-h-[120px]");
  });

  it("is resizable vertically", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("resize-y");
  });

  it("applies focus styles", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("focus-visible:ring-2");
    expect(textarea).toHaveClass("focus-visible:ring-teal");
  });

  it("handles multi-line text", async () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    const multiLineText = "Line 1\nLine 2\nLine 3";
    await userEvent.type(textarea, multiLineText);
    expect(textarea).toHaveValue(multiLineText);
  });
});
