import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("handles text input correctly", async () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Hello World");
    expect(input).toHaveValue("Hello World");
  });

  it("handles different input types", () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");

    rerender(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);
    // Password inputs don't have role="textbox"
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-class");
  });

  it("handles placeholder text", () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("handles onChange events", async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");
    expect(handleChange).toHaveBeenCalled();
  });

  it("forwards additional props", () => {
    render(<Input data-testid="test-input" maxLength={10} />);
    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("handles default value", () => {
    render(<Input defaultValue="default text" />);
    expect(screen.getByRole("textbox")).toHaveValue("default text");
  });

  it("applies focus styles", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("focus-visible:ring-2");
    expect(input).toHaveClass("focus-visible:ring-teal/20");
    expect(input).toHaveClass("focus-visible:border-teal");
  });
});
