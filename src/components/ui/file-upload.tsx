import * as React from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  accept = "image/*,.pdf",
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.slice(0, maxFiles - files.length);
    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-2",
          isDragging
            ? "border-teal bg-teal/5"
            : "border-slate-200 hover:border-teal/50 hover:bg-slate-50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept={accept}
          onChange={handleFileInput}
        />
        <div className="w-12 h-12 rounded-full bg-page-bg flex items-center justify-center text-text-secondary mb-2">
          <Upload size={24} />
        </div>
        <p className="text-sm font-medium text-text-primary">
          <span className="text-teal hover:underline">Click to upload</span> or
          drag and drop
        </p>
        <p className="text-xs text-text-secondary">
          SVG, PNG, JPG or PDF (max. 800x400px)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                  {file.type.includes("image") ? (
                    <ImageIcon size={20} />
                  ) : (
                    <FileText size={20} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
