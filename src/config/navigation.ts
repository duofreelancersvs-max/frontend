import type { LucideIcon } from "lucide-react";
import {
  Home,
  Folder,
  PlusCircle,
  Search,
  Mail,
  Star,
  Settings,
  User,
  FolderOpen,
  FileText,
  CreditCard,
} from "lucide-react";

export type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  id?: string;
  shortLabel?: string;
};

export const clientSidebarNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/client/dashboard", shortLabel: "Home" },
  { icon: Folder, label: "My Projects", href: "/client/projects", shortLabel: "Projects" },
  { icon: PlusCircle, label: "Post Project", href: "/client/post-project", shortLabel: "Post" },
  { icon: Search, label: "Find Freelancers", href: "/client/freelancers", shortLabel: "Find" },
  { icon: Mail, label: "Messages", href: "/client/messages", id: "messages", shortLabel: "Messages" },
  { icon: Star, label: "Reviews", href: "/client/reviews", shortLabel: "Reviews" },
  { icon: Settings, label: "Settings", href: "/client/settings", shortLabel: "Settings" },
];

export const clientBottomNavItems: NavItem[] = [
  clientSidebarNavItems[0],
  clientSidebarNavItems[1],
  clientSidebarNavItems[2],
  clientSidebarNavItems[4],
  clientSidebarNavItems[6],
];

export const freelancerSidebarNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/freelancer/dashboard", shortLabel: "Home" },
  { icon: User, label: "My Profile", href: "/freelancer/profile", shortLabel: "Profile" },
  { icon: FolderOpen, label: "Portfolio", href: "/freelancer/portfolio", shortLabel: "Portfolio" },
  { icon: Search, label: "Find Work", href: "/freelancer/projects", shortLabel: "Find Work" },
  { icon: FileText, label: "My Applications", href: "/freelancer/applications", shortLabel: "Applied" },
  { icon: Mail, label: "Messages", href: "/freelancer/messages", id: "messages", shortLabel: "Messages" },
  { icon: CreditCard, label: "Subscription", href: "/freelancer/subscription", shortLabel: "Plan" },
  { icon: Star, label: "Reviews", href: "/freelancer/reviews", shortLabel: "Reviews" },
  { icon: Settings, label: "Settings", href: "/freelancer/settings", shortLabel: "Settings" },
];

export const freelancerBottomNavItems: NavItem[] = [
  freelancerSidebarNavItems[0],
  freelancerSidebarNavItems[3],
  freelancerSidebarNavItems[4],
  freelancerSidebarNavItems[5],
  freelancerSidebarNavItems[1],
];
