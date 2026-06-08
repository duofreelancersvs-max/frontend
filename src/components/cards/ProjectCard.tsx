import React from "react";
import { MoreHorizontal, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Completed";

  applicationCount: number;
  deadline: string;
  skills: string[];
  onViewProject?: () => void;
  className?: string;
}

const statusColors = {
  Open: "bg-teal/10 text-teal border-teal/20",
  "In Progress": "bg-royal-blue/10 text-royal-blue border-royal-blue/20",
  Completed: "bg-success-green/10 text-success-green border-success-green/20",
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  status,

  applicationCount,
  deadline,
  skills,
  onViewProject,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-[320px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-md transition-shadow duration-300 flex flex-col p-5 border border-transparent hover:border-slate-100",
        className,
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold border",
            statusColors[status],
          )}
        >
          {status}
        </span>
        <button className="text-slate-400 hover:text-navy transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <h3
        className="text-lg font-bold text-text-primary mb-2 line-clamp-1"
        title={title}
      >
        {title}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-2 h-10">
        {description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="px-2 py-1 bg-page-bg text-text-secondary text-xs rounded border border-slate-100"
          >
            {skill}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="px-2 py-1 text-xs text-text-secondary">
            +{skills.length - 3}
          </span>
        )}
      </div>

      <div className="flex-grow"></div>

      {/* Footer Info */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 mb-4">
        <div className="flex flex-col">
          <span className="text-xs text-text-secondary flex items-center gap-1">
            <Users size={10} /> Apps
          </span>
          <span className="text-sm font-semibold text-text-primary mt-0.5">
            {applicationCount}
          </span>
        </div>
        <div className="flex flex-col border-l border-slate-100 pl-3">
          <span className="text-xs text-text-secondary flex items-center gap-1">
            <Clock size={10} /> Deadline
          </span>
          <span
            className="text-sm font-semibold text-text-primary mt-0.5 truncate"
            title={deadline}
          >
            {deadline}
          </span>
        </div>
      </div>

      {/* Action */}
      <Button
        className="w-full bg-white border border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white transition-all font-medium"
        onClick={onViewProject}
      >
        View Details
      </Button>
    </div>
  );
};

export default ProjectCard;
