import { useState, useEffect } from "react";
import {
  Link,
  useParams,
  useOutletContext,
} from "react-router-dom";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import {
  CreditCard,
  FileText,
  Clock,
  Calendar,
  MapPin,
  Users,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { projectService } from "@/services";
import type { Project } from "@/services";
import DashboardHeader from "@/components/layouts/DashboardHeader";

const ProjectDetails = () => {
  const { id } = useParams();
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await projectService.getById(id);
        setProject(res);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-background flex flex-col items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">{error || "Project not found"}</p>
        <Link to="/freelancer/projects">
          <Button variant="outline" className="dark:border-white/10 dark:text-white dark:hover:bg-white/5">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "open":
        return "bg-teal/10 text-teal border-teal/20";
      case "in-progress":
        return "bg-royal-blue/10 text-royal-blue border-royal-blue/20";
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30";
      default:
        return "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open for Applications";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled/Closed";
      default:
        return status;
    }
  };

  const formatDeadline = (deadline: string) => {
    try {
      return new Date(deadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return deadline;
    }
  };

   return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-background font-sans">
      <DashboardHeader
        title="Project Details"
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main className="px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-semibold border",
                    getStatusStyles(project.status),
                  )}
                >
                   {getStatusLabel(project.status)}
                </span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium">
                  {project.category}
                </span>
              </div>
               <h1 className="text-2xl lg:text-3xl font-bold text-navy dark:text-white">
                {project.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                   <Clock size={14} />
                  Posted{" "}
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                 <div className="flex items-center gap-1">
                  <Users size={14} />
                  {project.applications || 0} applications
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/freelancer/projects">
                <Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 dark:hover:bg-white/5">
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
                <FileText size={24} className="text-teal" />
                About the Project
              </h2>

              <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                <p className="text-lg whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
                <Award size={24} className="text-teal" />
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {(project.requiredSkills || []).map((skill: string) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-400 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

           <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-navy dark:text-white mb-6 border-b border-slate-100 dark:border-white/10 pb-4">
                Project Details
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between w-full min-w-0">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                      <CreditCard size={18} />
                    </div>
                    <span className="text-sm font-medium">Budget</span>
                  </div>
                  <span className="font-bold text-navy dark:text-white text-right">
                    ₹{(project.budget?.minAmount || 0).toLocaleString()} - ₹
                    {(project.budget?.maxAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between w-full min-w-0">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                      <MapPin size={18} />
                    </div>
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <span className="font-semibold text-navy dark:text-white">
                    {project.location?.type || "Remote"}
                  </span>
                </div>

                <div className="flex items-center justify-between w-full min-w-0">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                      <Calendar size={18} />
                    </div>
                    <span className="text-sm font-medium">Deadline</span>
                  </div>
                  <span className="font-semibold text-navy dark:text-white">
                    {formatDeadline(project.deadline)}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                  <div className="p-4 bg-teal/5 dark:bg-teal/10 rounded-xl border border-teal/10 dark:border-teal/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-teal font-semibold uppercase tracking-wider mb-1">
                        Total Applications
                      </p>
                      <p className="text-2xl font-bold text-navy dark:text-white">
                        {project.applications || 0}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-white dark:bg-[#121A2A] rounded-full flex items-center justify-center text-teal shadow-sm">
                      <Users size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
