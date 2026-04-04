import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

describe("Card Components", () => {
  describe("Card", () => {
    it("renders card element", () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("forwards ref correctly", () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("applies custom className", () => {
      render(<Card className="custom-card">Content</Card>);
      expect(screen.getByText("Content")).toHaveClass("custom-card");
    });

    it("has default card styling", () => {
      render(<Card>Content</Card>);
      const card = screen.getByText("Content");
      expect(card).toHaveClass("rounded-2xl");
      expect(card).toHaveClass("border");
      expect(card).toHaveClass("shadow-sm");
    });
  });

  describe("CardHeader", () => {
    it("renders header element", () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText("Header Content")).toBeInTheDocument();
    });

    it("applies correct styling", () => {
      render(<CardHeader>Header</CardHeader>);
      const header = screen.getByText("Header");
      expect(header).toHaveClass("flex");
      expect(header).toHaveClass("flex-col");
      expect(header).toHaveClass("p-6");
    });
  });

  describe("CardTitle", () => {
    it("renders title element", () => {
      render(<CardTitle>Card Title</CardTitle>);
      expect(screen.getByText("Card Title")).toBeInTheDocument();
    });

    it("applies correct styling", () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText("Title");
      expect(title).toHaveClass("text-2xl");
      expect(title).toHaveClass("font-semibold");
    });
  });

  describe("CardDescription", () => {
    it("renders description element", () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("applies correct styling", () => {
      render(<CardDescription>Desc</CardDescription>);
      const desc = screen.getByText("Desc");
      expect(desc).toHaveClass("text-sm");
    });
  });

  describe("CardContent", () => {
    it("renders content element", () => {
      render(<CardContent>Content area</CardContent>);
      expect(screen.getByText("Content area")).toBeInTheDocument();
    });

    it("applies correct styling", () => {
      render(<CardContent>Content</CardContent>);
      const content = screen.getByText("Content");
      expect(content).toHaveClass("p-6");
      expect(content).toHaveClass("pt-0");
    });
  });

  describe("CardFooter", () => {
    it("renders footer element", () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    it("applies flex layout styling", () => {
      render(<CardFooter>Footer</CardFooter>);
      const footer = screen.getByText("Footer");
      expect(footer).toHaveClass("flex");
      expect(footer).toHaveClass("items-center");
    });
  });

  describe("Card Composition", () => {
    it("renders complete card with all sections", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>Main content goes here</CardContent>
          <CardFooter>Footer actions</CardFooter>
        </Card>
      );

      expect(screen.getByText("Test Card")).toBeInTheDocument();
      expect(screen.getByText("This is a test card")).toBeInTheDocument();
      expect(screen.getByText("Main content goes here")).toBeInTheDocument();
      expect(screen.getByText("Footer actions")).toBeInTheDocument();
    });
  });
});
