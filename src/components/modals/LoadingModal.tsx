import React from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  message = "Loading...",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="w-[200px] sm:w-[200px] border-none shadow-none bg-transparent flex flex-col items-center justify-center p-0 gap-4 [&>button]:hidden outline-none"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Loading</DialogTitle>
        </VisuallyHidden.Root>

        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-teal" />
          <p className="text-sm font-medium text-text-primary">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
