import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format, startOfDay, isAfter } from "date-fns";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export const CustomDatePicker = ({
  value,
  onChange,
  minDate,
}: {
  value: string;
  onChange: (date: string) => void;
  minDate?: Date;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse current value
  const selectedDate = value ? new Date(value + "T00:00:00") : undefined;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (day: Date | undefined) => {
    if (!day) return;
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  };

  const today = minDate || startOfDay(new Date());

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full h-12 px-4 flex items-center gap-3 rounded-xl border text-left transition-all",
          "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5",
          "text-navy dark:text-white",
          open && "border-teal ring-2 ring-teal/20",
          !value && "text-slate-400 dark:text-slate-500"
        )}
      >
        <CalendarDays size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
        <span className={value ? "text-navy dark:text-white" : "text-slate-400 dark:text-slate-500"}>
          {value ? format(new Date(value + "T00:00:00"), "dd MMM yyyy") : "Pick a date"}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-14 left-0 bg-white dark:bg-[#0D1B2E] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-3 animate-in slide-in-from-top-2 duration-150">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date) => !isAfter(date, today) && date.toDateString() !== today.toDateString()}
            startMonth={today}
            classNames={{
              root: "rdp-custom",
              months: "flex",
              month: "space-y-3",
              month_caption: "flex justify-center items-center relative h-9",
              caption_label: "text-sm font-semibold text-navy dark:text-white",
              nav: "flex items-center gap-1",
              button_previous: cn(
                "h-7 w-7 rounded-lg flex items-center justify-center",
                "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors",
                "absolute left-1"
              ),
              button_next: cn(
                "h-7 w-7 rounded-lg flex items-center justify-center",
                "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors",
                "absolute right-1"
              ),
              month_grid: "w-full border-collapse",
              weekdays: "flex",
              weekday: "text-slate-400 dark:text-slate-500 text-xs font-medium w-9 text-center py-1",
              week: "flex w-full mt-1",
              day: "w-9 text-center text-sm p-0",
              day_button: cn(
                "h-9 w-9 rounded-lg font-medium transition-all text-sm",
                "text-navy dark:text-white hover:bg-teal/10 dark:hover:bg-teal/20",
                "focus:outline-none focus:ring-2 focus:ring-teal"
              ),
              selected: "!bg-teal !text-white hover:!bg-teal/90 shadow-md shadow-teal/20",
              today: "text-teal font-bold border border-teal/40",
              outside: "text-slate-300 dark:text-slate-700 opacity-50",
              disabled: "text-slate-300 dark:text-slate-700 opacity-40 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent",
            }}
            components={{
              Chevron: (props) => {
                if (props.orientation === "left") return <ChevronLeft size={16} />;
                return <ChevronRight size={16} />;
              },
            }}
          />
        </div>
      )}
    </div>
  );
};
