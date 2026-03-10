import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  FolderOpen,
  Menu,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Play,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { freelancerService } from "@/services";
import type { PortfolioItem } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { useUnreadStore } from "@/stores/unread.store";
import { AddPortfolioModal } from "@/components/modals/AddPortfolioModal";
import { getCategoryStyle } from "@/lib/category-styles";
import { toast } from "react-toastify";

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

const categories = [
  "All",
  "Product Videos",
  "Motion Graphics",
  "Wedding Videos",
  "Social Media",
  "Intros & Outros",
  "Real Estate",
];

const FreelancerPortfolio = () => {
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [portfolioItemsState, setPortfolioItems] = useState<
    PortfolioDisplayItem[]
  >([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioDisplayItem | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
    category: string;
    thumbnail: string;
  }) => {
    try {
      if (editingItem) {
        const itemId = editingItem._id || editingItem.id || "";
        const updatedProfile = await freelancerService.updatePortfolio(itemId, {
          title: data.title,
          description: data.description,
          projectUrl: data.projectUrl,
          skills: [data.category],
          thumbnail: data.thumbnail,
        });
        setPortfolioItems(updatedProfile.portfolio || []);
        toast.success("Project updated successfully!");
      } else {
        const updatedProfile = await freelancerService.addPortfolio({
          title: data.title,
          description: data.description,
          projectUrl: data.projectUrl,
          skills: [data.category],
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
    <div className="w-full bg-slate-50">
      <div className="w-full">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-navy">
                  My Portfolio
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Showcase your best work to attract clients
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <Link
                to="/freelancer/messages"
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex"
              >
                <MessageSquare size={20} />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white" />
                )}
              </Link>
              
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-teal hover:bg-teal-light text-white hidden sm:flex"
              >
                <Plus size={18} className="mr-2" />
                Add Project
              </Button>

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                    {user?.fullName
                      ? user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : (user?.email?.[0] || "U").toUpperCase()}
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-slate-500 hidden sm:block"
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-navy">
                        {user?.fullName || user?.email?.split("@")[0] || "Freelancer"}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/freelancer/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/freelancer/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <hr className="my-2 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-8 space-y-6">
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
                    : "bg-white text-slate-600 border border-slate-200 hover:border-teal hover:text-teal",
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500 mb-1">Total Projects</p>
              <p className="text-2xl font-bold text-navy">
                {portfolioItemsState.length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500 mb-1">Total Views</p>
              <p className="text-2xl font-bold text-navy">
                {portfolioItemsState
                  .reduce((acc, item) => acc + (item.views || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500 mb-1">Portfolio Rating</p>
              <p className="text-2xl font-bold text-navy">
                NA
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500 mb-1">Categories</p>
              <p className="text-2xl font-bold text-navy">
                {categories.length - 1}
              </p>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id || item.id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all"
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
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
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
                      className="p-2 bg-white rounded-full text-navy hover:bg-teal hover:text-white transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingItem(item);
                        setIsAddModalOpen(true);
                      }}
                      className="p-2 bg-white rounded-full text-navy hover:bg-teal hover:text-white transition-colors"
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
                        className="p-1.5 bg-white/90 rounded-lg text-slate-600 hover:bg-white transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === (item._id || item.id) && (
                        <div
                          className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            onClick={() => {
                              setEditingItem(item);
                              setIsAddModalOpen(true);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleShareProject(item)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                          >
                            <ExternalLink size={14} /> Share
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(item._id || item.id || "")}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50"
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
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-medium mb-2">
                    {item.skills?.[0] || item.category || "General"}
                  </span>
                  <h3 className="font-semibold text-navy mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500">
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
              <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-2">
                No projects in this category
              </h3>
              <p className="text-slate-500 mb-4">
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
