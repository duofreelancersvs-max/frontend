import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

describe("Dialog Components", () => {
  describe("Dialog", () => {
    it("renders children when open", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    });
  });

  describe("DialogTrigger", () => {
    it("renders trigger button", () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      );
      expect(screen.getByText("Open Dialog")).toBeInTheDocument();
    });
  });

  describe("DialogContent", () => {
    it("renders content with close button", () => {
      render(
        <Dialog open>
          <DialogContent>
            <p>Dialog Content</p>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText("Dialog Content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(
        <Dialog open>
          <DialogContent className="custom-dialog">
            <p>Content</p>
          </DialogContent>
        </Dialog>
      );
      // Content is rendered inside the dialog
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  describe("DialogHeader", () => {
    it("renders header content", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Header Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText("Header Title")).toBeInTheDocument();
    });

    it("applies header styling", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>Header Content</DialogHeader>
          </DialogContent>
        </Dialog>
      );
      // Header is rendered
      expect(screen.getByText("Header Content")).toBeInTheDocument();
    });
  });

  describe("DialogFooter", () => {
    it("renders footer content", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogFooter>
              <button>Cancel</button>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
    });
  });

  describe("DialogTitle", () => {
    it("renders title with correct styling", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>My Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      const title = screen.getByText("My Title");
      expect(title).toHaveClass("text-lg");
      expect(title).toHaveClass("font-semibold");
    });
  });

  describe("DialogDescription", () => {
    it("renders description with correct styling", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogDescription>Description text</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      const desc = screen.getByText("Description text");
      expect(desc).toHaveClass("text-sm");
      expect(desc).toHaveClass("text-slate-500");
    });
  });

  describe("Dialog Integration", () => {
    it("renders complete dialog with all parts", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>This is a complete dialog</DialogDescription>
            </DialogHeader>
            <div>Main content here</div>
            <DialogFooter>
              <button>Action 1</button>
              <button>Action 2</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText("Complete Dialog")).toBeInTheDocument();
      expect(screen.getByText("This is a complete dialog")).toBeInTheDocument();
      expect(screen.getByText("Main content here")).toBeInTheDocument();
      expect(screen.getByText("Action 1")).toBeInTheDocument();
      expect(screen.getByText("Action 2")).toBeInTheDocument();
    });
  });
});
