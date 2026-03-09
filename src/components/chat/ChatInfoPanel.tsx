import { Link } from "react-router-dom";
import {
  Star,
  Verified,
  BadgeCheck,
  ExternalLink,
  User,
  CreditCard,
  Ban,
  Building2,
  FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatAvatar } from "./index";

export interface InfoPanelParticipant {
  userId: string;
  name: string;
  avatar?: string;
  verified: boolean;
  rating: number;
  reviews: number;
  online: boolean;
  title?: string;
  company?: string;
  location?: string;
}

export interface InfoPanelProject {
  id: string;
  title: string;
}

interface ChatInfoPanelProps {
  participant: InfoPanelParticipant;
  project?: InfoPanelProject | null;
  role: "client" | "freelancer";
  className?: string;
}

const ChatInfoPanel = ({
  participant,
  project,
  role,
  className,
}: ChatInfoPanelProps) => {
  const VerifyIcon = role === "client" ? Verified : BadgeCheck;

  return (
    <div
      className={cn(
        "bg-white border-l border-slate-200 flex-col flex-shrink-0 overflow-y-auto",
        className,
      )}
    >
      {/* Profile Header */}
      <div className="p-6 text-center border-b border-slate-100">
        <ChatAvatar
          name={participant.name}
          size="xl"
          online={false}
          showOnlineIndicator={false}
          className="mx-auto mb-3"
        />
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h3 className="font-bold text-navy">{participant.name}</h3>
          {participant.verified && (
            <VerifyIcon size={16} className="text-teal" />
          )}
        </div>
        {participant.title && (
          <p className="text-sm text-slate-500 mb-3">{participant.title}</p>
        )}
        <div className="flex items-center justify-center gap-3 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-gold fill-gold" />
            <span className="font-semibold text-navy">
              {participant.rating}
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{participant.reviews} reviews</span>
        </div>
      </div>

      {/* Company / Details (freelancer viewing client) */}
      {role === "freelancer" &&
        (participant.company || participant.location) && (
          <div className="p-5 border-b border-slate-100">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Client Details
            </h4>
            <div className="space-y-3">
              {participant.company && (
                <div className="flex items-start gap-3">
                  <Building2 size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Company</p>
                    <p className="text-sm font-medium text-navy">
                      {participant.company}
                    </p>
                  </div>
                </div>
              )}
              {participant.location && (
                <div className="flex items-start gap-3">
                  <Building2 size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="text-sm font-medium text-navy">
                      {participant.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Project Reference */}
      {project && (
        <div className="p-5 border-b border-slate-100">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Related Project
          </h4>
          <Link
            to={
              role === "client" ? `/client/project/${project.id}` : `/projects`
            }
            className="block p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <p className="font-medium text-navy text-sm mb-1">
              {project.title}
            </p>
            <span className="text-xs text-teal flex items-center gap-1">
              <ExternalLink size={12} /> View Project
            </span>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-5 space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h4>
        {role === "client" ? (
          <>
            <Link to={`/freelancer/${participant.userId}`} className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9 text-sm border-slate-200"
              >
                <User size={14} className="mr-2" /> View Profile
              </Button>
            </Link>
            <Button
              size="sm"
              className="w-full justify-start h-9 text-sm bg-teal hover:bg-teal-light text-white"
            >
              <CreditCard size={14} className="mr-2" /> Hire Freelancer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-9 text-sm text-red-500 hover:bg-red-50"
            >
              <Ban size={14} className="mr-2" /> Block User
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-full justify-start border-slate-200"
            >
              <ExternalLink size={16} className="mr-2" /> View Project
            </Button>
            <Button className="w-full justify-start bg-teal hover:bg-teal-light text-white">
              <FileSignature size={16} className="mr-2" /> Send Proposal
            </Button>
          </>
        )}
      </div>

      {/* Online Status Footer */}
      <div className="mt-auto p-5 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            {participant.online && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            )}
            <span
              className={cn(
                "relative inline-flex rounded-full h-3 w-3 border-2 border-white",
                participant.online ? "bg-green-500" : "bg-slate-300",
              )}
            ></span>
          </div>
          <span className="text-sm font-medium text-slate-600">
            {participant.online ? "Online now" : "Last seen recently"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInfoPanel;
