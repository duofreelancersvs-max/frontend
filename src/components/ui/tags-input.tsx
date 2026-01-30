import * as React from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export function TagsInput({
  value = [],
  onChange,
  placeholder = "Add tags...",
  suggestions = [],
  className,
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [tags, setTags] = React.useState<string[]>(value);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // Sync internal state with props
  React.useEffect(() => {
    setTags(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setInputValue("");
      onChange?.(newTags);
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    onChange?.(newTags);
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      !tags.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div className={cn("w-full relative", className)}>
      <div className="flex flex-wrap gap-2 p-2 min-h-[48px] border border-slate-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-teal focus-within:border-teal transition-all shadow-sm">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center gap-1 bg-teal/10 text-teal px-2 py-1 rounded-md text-sm font-medium animate-in fade-in zoom-in duration-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-teal/20 rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-text-primary placeholder:text-text-secondary py-1"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="w-full text-left px-4 py-2 text-sm hover:bg-page-bg text-text-secondary flex items-center justify-between group"
              onClick={() => {
                addTag(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion}
              <Plus
                size={14}
                className="opacity-0 group-hover:opacity-100 text-slate-400"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
