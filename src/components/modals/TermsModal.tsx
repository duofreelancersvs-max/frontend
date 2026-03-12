import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAgree,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] sm:h-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-text-primary">
            Terms & Conditions
          </DialogTitle>
          <DialogDescription>
            Please read and accept our terms to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-page-bg text-sm text-text-secondary leading-relaxed pr-2 h-[400px]">
          <h4 className="font-bold text-text-primary mb-2">1. Introduction</h4>
          <p className="mb-4">
            Welcome to ConnectMeIndia. By accessing our website, you agree to be bound
            by these Terms and Conditions...
          </p>

          <h4 className="font-bold text-text-primary mb-2">
            2. User Obligations
          </h4>
          <p className="mb-4">
            You agree to provide accurate and complete information when creating
            an account. You are responsible for maintaining the confidentiality
            of your account...
          </p>

          <h4 className="font-bold text-text-primary mb-2">
            3. Intellectual Property
          </h4>
          <p className="mb-4">
            All content on this platform is the property of ConnectMeIndia or its
            content suppliers...
          </p>

          <h4 className="font-bold text-text-primary mb-2">4. Payment Terms</h4>
          <p className="mb-4">
            Payments are processed securely through our verified payment
            partners...
          </p>

          <h4 className="font-bold text-text-primary mb-2">5. Termination</h4>
          <p className="mb-4">
            We reserve the right to terminate or suspend your account at any
            time...
          </p>

          <p className="mt-8 text-xs text-slate-400">Last updated: Oct 2024</p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
          <div
            className="flex items-center space-x-2 mr-auto cursor-pointer"
            onClick={() => setIsChecked(!isChecked)}
          >
            <div
              className={cn(
                "w-5 h-5 border rounded flex items-center justify-center transition-colors",
                isChecked
                  ? "bg-teal border-teal text-white"
                  : "border-slate-300 bg-white",
              )}
            >
              {isChecked && <Check size={14} />}
            </div>
            <span className="text-sm font-medium text-text-secondary select-none">
              I agree to the Terms and Conditions
            </span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={onAgree}
              disabled={!isChecked}
              className={cn(
                "flex-1 sm:flex-none bg-teal hover:bg-teal/90",
                !isChecked && "opacity-50 cursor-not-allowed",
              )}
            >
              I Agree
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
