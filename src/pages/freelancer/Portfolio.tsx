import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FolderOpen,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { freelancerService } from "@/services";
import { publicService } from "@/services/public.service";
import type { PortfolioItem } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { AddPortfolioModal } from "@/components/modals/AddPortfolioModal";
import { getCategoryStyle } from "@/lib/category-styles";
import { toast } from "react-toastify";
import DashboardHeader from "@/components/layouts/DashboardHeader";

// Extended type for display purposes with optional UI fields
interface PortfolioDisplayItem extends PortfolioItem {
  id?: string;
  views?: number;
  likes?: number;
  thumbnail?: string;
  type?: string;
  category?: string;
  client?: string;
}

// Categories will be fetched dynamically from the backend

const FreelancerPortfolio = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [portfolioItemsState, setPortfolioItems] = useState<
    PortfolioDisplayItem[]
  >([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioDisplayItem | null>(null);

  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await publicService.getCategoriesWithSkills();
        const catNames = data.map((c: any) => c.name);
        setCategories(["All", ...catNames]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const profile = await freelancerService.getMyProfile();
        // Since the backend PortfolioItem lacks properties needed for UI (views, likes, thumbnail)
        // we'd typically map that data here. For now we just coerce to any.
        setPortfolioItems(profile.portfolio || []);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    };
    fetchPortfolio();
  }, []);

  const handleProjectSubmit = async (data: {
    title: string;
    description: string;
    projectUrl: string;
    categories: string[];
    thumbnail: string;
  }) => {
    try {
      if (editingItem) {
        const itemId = editingItem._id || editingItem.id || "";
        const updatedProfile = await freelancerService.updatePortfolio(itemId, {
          title: data.title,
          description: data.description,
          projectUrl: data.projectUrl,
          skills: data.categories,
          thumbnail: data.thumbnail,
        });
        setPortfolioItems(updatedProfile.portfolio || []);
        toast.success("Project updated successfully!");
      } else {
        const updatedProfile = await freelancerService.addPortfolio({
          title: data.title,
          description: data.description,
          projectUrl: data.projectUrl,
          skills: data.categories,
          thumbnail: data.thumbnail,
        });
        setPortfolioItems(updatedProfile.portfolio || []);
        toast.success("Project added successfully!");
      }
      setEditingItem(null);
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("Failed to save project. Please try again.");
      throw error;
    }
  };

  const handleDeleteProject = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const updatedProfile = await freelancerService.removePortfolio(itemId);
      setPortfolioItems(updatedProfile.portfolio || []);
      setOpenMenuId(null);
      toast.success("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project.");
    }
  };

  const handleShareProject = (item: PortfolioDisplayItem) => {
    const url = item.projectUrl || window.location.href;
    navigator.clipboard.writeText(url);
    toast.info("Project link copied to clipboard!");
    setOpenMenuId(null);
  };

  const filteredItems =
    selectedCategory === "All"
      ? portfolioItemsState
      : portfolioItemsState.filter((item) => (item.skills?.[0] || item.category) === selectedCategory);

  return (
    <div className="w-full bg-slate-50 dark:bg-background flex-1 h-full overflow-y-auto transition-colors duration-300">
      <div className="w-full">
        <DashboardHeader
          title="My Portfolio"
          onMenuClick={() => setSidebarOpen(true)}
        >
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-teal hover:bg-teal-light text-white hidden sm:flex ml-auto"
          >
            <Plus size={18} className="mr-2" />
            Add Project
          </Button>
        </DashboardHeader>

        {/* Main Content Area */}
        <main className="dashboard-content">
          {/* Category Filter */}
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === category
                    ? "bg-teal text-white"
                    : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-teal hover:text-teal",
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-4 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Projects</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {portfolioItemsState.length}
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-4 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Views</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {portfolioItemsState
                  .reduce((acc, item) => acc + (item.views || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-4 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Portfolio Rating</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                NA
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-4 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Categories</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {categories.length - 1}
              </p>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id || item.id}
                className="group bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video">
                  {(item.thumbnail?.startsWith("gradient:") || !item.thumbnail) ? (
                    (() => {
                      const category = item.skills?.[0] || (item.thumbnail?.startsWith("gradient:") ? item.thumbnail.split(":")[1] : "Default") || "Default";
                      const style = getCategoryStyle(category);
                      const Icon = style.icon;
                      return (
                        <div className={cn(
                          "w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br",
                          style.gradient
                        )}>
                          <Icon size={40} className="mb-2 opacity-80" />
                          <span className="text-xxs font-bold uppercase tracking-wider opacity-60">
                            {category}
                          </span>
                        </div>
                      );
                    })()
                  ) : (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover bg-slate-100"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleShareProject(item)}
                      className="p-2 bg-white dark:bg-[#1A2333] rounded-full text-navy dark:text-white hover:bg-teal hover:text-white transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingItem(item);
                        setIsAddModalOpen(true);
                      }}
                      className="p-2 bg-white dark:bg-[#1A2333] rounded-full text-navy dark:text-white hover:bg-teal hover:text-white transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                  {item.type === "video" && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      <Play size={12} />
                      Video
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentId = item._id || item.id;
                          setOpenMenuId(
                            openMenuId === currentId ? null : (currentId as string),
                          );
                        }}
                        className="p-1.5 bg-white/90 dark:bg-[#1A2333]/90 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-[#1A2333] transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === (item._id || item.id) && (
                        <div
                          className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1A2333] rounded-lg shadow-lg border border-slate-100 dark:border-white/5 py-1 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            onClick={() => {
                              setEditingItem(item);
                              setIsAddModalOpen(true);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleShareProject(item)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            <ExternalLink size={14} /> Share
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(item._id || item.id || "")}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded text-xs font-medium mb-2">
                    {item.skills?.[0] || item.category || "General"}
                  </span>
                  <h3 className="font-semibold text-navy dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye size={14} /> {(item.views ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-navy dark:text-white mb-2">
                No projects in this category
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Start adding your work to build your portfolio
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-teal hover:bg-teal-light text-white"
              >
                <Plus size={18} className="mr-2" />
                Add Your First Project
              </Button>
            </div>
          )}
        </main>
      </div>

      <AddPortfolioModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleProjectSubmit}
        categories={categories}
        editItem={editingItem}
      />
    </div>
  );
};

export default FreelancerPortfolio;
