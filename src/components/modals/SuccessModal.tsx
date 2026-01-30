import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonLabel?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Success!",
  message,
  buttonLabel = "Continue",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-green/10 animate-in zoom-in duration-300">
            <Check className="h-8 w-8 text-success-green" strokeWidth={3} />
          </div>
          <DialogTitle className="text-xl font-bold text-text-primary">
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-text-secondary">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 sm:justify-center">
          <Button
            onClick={onClose}
            className="w-full bg-success-green hover:bg-success-green/90 sm:w-32"
          >
            {buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
