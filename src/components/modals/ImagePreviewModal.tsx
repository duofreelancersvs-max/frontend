import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  caption?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  caption,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  React.useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images.length) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] h-[90vh] bg-transparent border-none shadow-none p-0 flex flex-col items-center justify-center outline-none">
        <VisuallyHidden.Root>
          <DialogTitle>Image Preview</DialogTitle>
        </VisuallyHidden.Root>

        {/* Close Button Override */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-50"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-50"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* Image */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          <img
            src={images[currentIndex]}
            alt={`Preview ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
          />
        </div>

        {/* Caption */}
        {caption && (
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              {caption}{" "}
              {images.length > 1 && `(${currentIndex + 1} / ${images.length})`}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
