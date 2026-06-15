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
          <h4 className="font-bold text-text-primary mb-2">1. Platform Nature</h4>
          <p className="mb-2">ConnectMeIndia (CMI) is a direct-connect platform that helps Clients and Freelancers find and connect with each other.</p>
          <p className="mb-4">CMI only facilitates communication and networking between users. We do not participate in project execution, negotiations, contracts, or payments.</p>

          <h4 className="font-bold text-text-primary mb-2">2. Payments & Agreements</h4>
          <p className="mb-2">All payments happen directly between Clients and Freelancers.</p>
          <p className="mb-2">CMI does not process, hold, secure, or guarantee payments.</p>
          <p className="mb-2">Users must independently agree on payment terms, milestones, deliverables, and deadlines before starting any project.</p>
          <p className="mb-4">CMI is not responsible for payment disputes, delayed payments, non-payments, chargebacks, or fraud.</p>

          <h4 className="font-bold text-text-primary mb-2">3. User Verification</h4>
          <p className="mb-2">Users are solely responsible for verifying the identity, credibility, experience, and reliability of the other party before entering into any project or financial arrangement.</p>
          <p className="mb-4">A profile on CMI should not be considered a guarantee of trustworthiness, quality, or future performance.</p>

          <h4 className="font-bold text-text-primary mb-2">4. Stay Safe</h4>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Never pay anyone to obtain a project.</li>
            <li>Never share OTPs, passwords, bank PINs, or sensitive financial information.</li>
            <li>Always verify project details before making or accepting payments.</li>
            <li>Report suspicious activity immediately to our support team.</li>
          </ul>

          <h4 className="font-bold text-text-primary mb-2">5. User Responsibility</h4>
          <p className="mb-2">By using ConnectMeIndia, you agree that all project-related decisions, agreements, payments, deadlines, deliverables, and communications are your sole responsibility.</p>
          <p className="mb-4">Both Clients and Freelancers must act professionally, honestly, and in compliance with applicable laws.</p>

          <h4 className="font-bold text-text-primary mb-2">6. Disclaimer</h4>
          <p className="mb-2">ConnectMeIndia is only a connecting platform.</p>
          <p className="mb-2">CMI shall not be liable for:</p>
          <ul className="list-disc pl-5 mb-2 space-y-1">
            <li>Payment disputes</li>
            <li>Fraud or scams</li>
            <li>Project failures</li>
            <li>Missed deadlines</li>
            <li>Poor quality work</li>
            <li>Financial losses</li>
            <li>Contract breaches</li>
            <li>Any dispute between Clients and Freelancers</li>
          </ul>
          <p className="mb-4">Users use the platform at their own discretion and risk.</p>

          <h4 className="font-bold text-text-primary mb-2">7. Acceptance</h4>
          <p className="mb-2">By clicking "I Agree", you acknowledge that:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>ConnectMeIndia only connects Clients and Freelancers.</li>
            <li>You are responsible for verifying users before working with them.</li>
            <li>All payments and agreements are solely between users.</li>
            <li>CMI is not responsible for transactions, disputes, or financial losses.</li>
          </ul>

          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <strong>Note:-</strong> Never move communication outside CMI (like WhatsApp or Telegram) with unknown users, as it drastically increases the risk of fraud.
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
          <div
            className="flex items-start space-x-2 mr-auto cursor-pointer max-w-[85%]"
            onClick={() => setIsChecked(!isChecked)}
          >
            <div
              className={cn(
                "w-5 h-5 border rounded flex items-center justify-center transition-colors shrink-0 mt-0.5",
                isChecked
                  ? "bg-teal border-teal text-white"
                  : "border-slate-300 bg-white",
              )}
            >
              {isChecked && <Check size={14} />}
            </div>
            <span className="text-sm font-medium text-text-secondary select-none leading-tight">
              I understand that ConnectMeIndia only connects Clients and Freelancers. I am responsible for verifying users, making agreements, and handling payments at my own discretion and risk.
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
