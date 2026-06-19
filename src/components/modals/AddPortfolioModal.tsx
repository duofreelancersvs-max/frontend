import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CATEGORY_STYLES } from "@/lib/category-styles";

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    projectUrl: string;
    categories: string[];
    thumbnail: string;
  }) => Promise<void>;
  categories: string[];
  editItem?: {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    projectUrl?: string;
    skills?: string[];
  } | null;
}

export const AddPortfolioModal: React.FC<AddPortfolioModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editItem,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [category, setCategory] = useState(categories[1] || "Product Videos");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem && isOpen) {
      setTitle(editItem.title || "");
      setDescription(editItem.description || "");
      setProjectUrl(editItem.projectUrl || "");
      setCategory(editItem.skills?.[0] || categories[1] || "Product Videos");
    } else if (!editItem && isOpen) {
      resetForm();
    }
  }, [editItem, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        projectUrl,
        categories: [category],
        thumbnail: `gradient:${category}`,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error submitting project:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setProjectUrl("");
    setCategory(categories[1] || "Product Videos");
  };

  const Style = CATEGORY_STYLES[category] || CATEGORY_STYLES["Default"];
  const Icon = Style.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto overscroll-contain">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy dark:text-white">
            {editItem ? "Edit Project" : "Add New Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Modern Brand Identity"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-slate-200 focus:border-teal focus:ring-teal/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all duration-200 shadow-sm"
                >
                  {categories.filter(c => c !== "All").map((cat) => (
                    <option key={cat} value={cat} className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Project Link (Optional)</Label>
                <Input
                  id="url"
                  placeholder="https://behance.net/..."
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  className="border-slate-200 focus:border-teal focus:ring-teal/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Thumbnail Preview</Label>
              <div className={cn(
                "aspect-video md:aspect-square rounded-xl flex flex-col items-center justify-center text-white shadow-inner bg-gradient-to-br",
                Style.gradient
              )}>
                <Icon size={48} className="mb-2 opacity-90" />
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">{category}</span>
                <p className="mt-2 px-4 text-center font-bold text-sm line-clamp-2">{title || "Your Project Title"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</Label>
            <Textarea
              id="desc"
              placeholder="Describe your role and what you achieved..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] border-slate-200 focus:border-teal focus:ring-teal/20"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 dark:border-white/10 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title}
              className="bg-teal hover:bg-teal-light text-white min-w-[120px]"
            >
              {loading 
                ? (editItem ? "Updating..." : "Adding...") 
                : (editItem ? "Save Changes" : "Add to Portfolio")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
