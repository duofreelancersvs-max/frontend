import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FolderOpen,
  Star,
  Menu,
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
import type { PortfolioItem } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";

// Extended type for display purposes with optional UI fields
interface PortfolioDisplayItem extends PortfolioItem {
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
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [portfolioItemsState, setPortfolioItems] = useState<
    PortfolioDisplayItem[]
  >([]);

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

  const filteredItems =
    selectedCategory === "All"
      ? portfolioItemsState
      : portfolioItemsState.filter((item) => item.title === selectedCategory);

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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

            <Button className="bg-teal hover:bg-teal-light text-white">
              <Plus size={18} className="mr-2" />
              Add Project
            </Button>
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
              <p className="text-sm text-slate-500 mb-1">Total Likes</p>
              <p className="text-2xl font-bold text-navy">
                {portfolioItemsState.reduce(
                  (acc, item) => acc + (item.likes || 0),
                  0,
                )}
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
                key={item.id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-100">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-2 bg-white rounded-full text-navy hover:bg-teal hover:text-white transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 bg-white rounded-full text-navy hover:bg-teal hover:text-white transition-colors">
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
                          setOpenMenuId(
                            openMenuId === item.id ? null : item.id,
                          );
                        }}
                        className="p-1.5 bg-white/90 rounded-lg text-slate-600 hover:bg-white transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === item.id && (
                        <div
                          className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <Edit2 size={14} /> Edit
                          </button>
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <ExternalLink size={14} /> Share
                          </button>
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
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
                    {item.category}
                  </span>
                  <h3 className="font-semibold text-navy mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">
                    Client: {item.client}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye size={14} /> {(item.views ?? 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={14} /> {item.likes}
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
              <Button className="bg-teal hover:bg-teal-light text-white">
                <Plus size={18} className="mr-2" />
                Add Your First Project
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FreelancerPortfolio;
