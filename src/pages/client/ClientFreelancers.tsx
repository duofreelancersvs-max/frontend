import { useState, useEffect } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Briefcase,
  Star,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { freelancerService } from "@/services";
import type { FreelancerProfile } from "@/services";
import DashboardHeader from "@/components/layouts/DashboardHeader";

const categories = [
  "Editing",
  "VFX",
  "3D Design",
  "Motion Graphics",
  "Color Grading",
  "Admin & support",
  "Design & creative",
  "Marketing",
  "Writing & content",
  "AI & emerging tech",
  "Development & tech",
  "Video, audio & animation",
];

const skillOptions = [
  "Adobe Premiere Pro",
  "DaVinci Resolve",
  "Final Cut Pro",
  "Avid Media Composer",
  "After Effects",
  "Nuke",
  "Mocha",
  "Blender",
  "Cinema 4D",
  "Maya",
  "After Effects Motion Graphics",
  "3D Motion Design",
  "Color Grading",
  "Web designers",
  "Graphic designers",
  "UX designers",
  "Web developers",
  "Python developers",
  "Software developers",
  "Mobile app developers",
];

const FreelancerCard = ({ freelancer }: { freelancer: FreelancerProfile }) => {
  const navigate = useNavigate();
  return (
     <div 
      onClick={() => navigate(`/client/freelancer/${freelancer._id || freelancer.id}`)}
      className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all p-5 cursor-pointer hover:border-teal/30 dark:hover:border-teal/50 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-lg">
          {(freelancer.displayName || freelancer.firstName || "F")
            .charAt(0)
            .toUpperCase()}
        </div>
        {freelancer.availability === "available" && (
          <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-medium">
            Available
          </span>
        )}
      </div>

       <h3 className="font-semibold text-navy dark:text-white mb-1 line-clamp-1 group-hover:text-teal transition-colors">
        {freelancer.displayName ||
          `${freelancer.firstName || ""} ${freelancer.lastName || ""}`.trim() ||
          "Freelancer"}
      </h3>
       <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
        <MapPin size={14} />
        {freelancer.headline || "Remote"}
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        {(freelancer.skills || []).slice(0, 3).map((skill, index) => (
          <span
            key={
              typeof skill === "string"
                ? skill
                : skill.skillId || skill.name || index
            }
             className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded text-xs"
          >
            {typeof skill === "string" ? skill : skill.name}
          </span>
        ))}
      </div>

       <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-1">
           <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-navy dark:text-white">
            {freelancer.averageRating || 0}
          </span>
           <span className="text-slate-400 dark:text-slate-500 text-xs">
            ({freelancer.reviewCount || 0})
          </span>
        </div>
      </div>
    </div>
  );
};

const ClientFreelancers = () => {
  const navigate = useNavigate();
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [totalFreelancers, setTotalFreelancers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  useAuth();


  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          limit: 12,
        };
        if (searchQuery) params.search = searchQuery;
        if (selectedCategories.length) params.category = selectedCategories[0];
        if (selectedSkills.length) params.skills = selectedSkills.join(",");

        const data = await freelancerService.search(params);
        setFreelancers(data.profiles || []);
        setTotalFreelancers(data.pagination?.totalItems || 0);
      } catch (error) {
        console.error("Error fetching freelancers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, [searchQuery, selectedCategories, selectedSkills, currentPage]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setCurrentPage(1);
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSkills([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasFilters =
    selectedCategories.length > 0 || selectedSkills.length > 0 || searchQuery;

   return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-background font-sans">
       {/* MAIN CONTENT */}
      <div>
        <DashboardHeader
          title="Find Freelancers"
          onMenuClick={() => setSidebarOpen(true)}
        >
          <Link to="/client/post-project">
            <Button className="bg-teal hover:bg-teal-light text-white hidden sm:flex">
              <PlusCircle size={18} className="mr-2" />
              Post New Project
            </Button>
          </Link>
        </DashboardHeader>

        {/* Main Content Area */}
        <main className="px-6 lg:px-8 py-6 lg:py-8">
          {/* SEARCH & FILTERS */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                 <Input
                  placeholder="Search freelancers by name, skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                   className={viewMode === "grid" ? "bg-navy dark:bg-white dark:text-navy" : "dark:text-slate-400"}
                >
                  <Grid3X3 size={18} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                   className={viewMode === "list" ? "bg-navy dark:bg-white dark:text-navy" : "dark:text-slate-400"}
                >
                  <List size={18} />
                </Button>
              </div>
            </div>

            {/* Filter Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <span
                  key={category}
                   className="inline-flex items-center gap-1 px-3 py-1 bg-teal/10 dark:bg-teal/20 text-teal rounded-full text-sm"
                >
                  {category}
                  <button onClick={() => handleCategoryToggle(category)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                   className="inline-flex items-center gap-1 px-3 py-1 bg-royal-blue/10 dark:bg-royal-blue/20 text-royal-blue rounded-full text-sm"
                >
                  {skill}
                  <button onClick={() => handleSkillToggle(skill)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Category & Skill Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
             {/* Categories */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4 lg:p-6">
              <h3 className="font-semibold text-navy dark:text-white mb-4 flex items-center gap-2">
                <Briefcase size={18} />
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                       selectedCategories.includes(category)
                        ? "bg-teal text-white"
                        : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20",
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

             {/* Skills */}
            <div className="lg:col-span-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4 lg:p-6">
              <h3 className="font-semibold text-navy dark:text-white mb-4 flex items-center gap-2">
                <Star size={18} />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                       selectedSkills.includes(skill)
                        ? "bg-royal-blue text-white"
                        : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20",
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
            </div>
          ) : freelancers.length === 0 ? (
            <div className="text-center py-20">
              <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
               <h3 className="text-lg font-semibold text-navy dark:text-white mb-2">
                No freelancers found
              </h3>
               <p className="text-slate-500 dark:text-slate-400 mb-4">
                Try adjusting your filters or search query
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {freelancers.map((freelancer) => (
                    <FreelancerCard
                      key={freelancer._id || freelancer.id}
                      freelancer={freelancer}
                    />
                  ))}
                </div>
               ) : (
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-navy dark:text-white">
                            Freelancer
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-navy dark:text-white">
                            Skills
                          </th>

                          <th className="text-left px-6 py-4 text-sm font-semibold text-navy dark:text-white">
                            Rating
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-navy dark:text-white">
                            Projects
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {freelancers.map((freelancer) => (
                           <tr
                            key={freelancer._id || freelancer.id}
                            className="hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group"
                            onClick={() => navigate(`/client/freelancer/${freelancer._id || freelancer.id}`)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold">
                                  {(
                                    freelancer.displayName ||
                                    freelancer.firstName ||
                                    "F"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div>
                                   <p className="font-medium text-navy dark:text-white">
                                    {freelancer.displayName ||
                                      `${freelancer.firstName || ""} ${freelancer.lastName || ""}`.trim() ||
                                      "Freelancer"}
                                  </p>
                                   <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {freelancer.headline || "Remote"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {(freelancer.skills || [])
                                  .slice(0, 3)
                                  .map((skill, index) => (
                                    <span
                                      key={
                                        typeof skill === "string"
                                          ? skill
                                          : skill.skillId || skill.name || index
                                      }
                                       className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded text-xs"
                                    >
                                      {typeof skill === "string"
                                        ? skill
                                        : skill.name}
                                    </span>
                                  ))}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <Star
                                  size={14}
                                  className="text-yellow-400 fill-yellow-400"
                                />
                                 <span className="font-medium text-navy dark:text-white">
                                  {freelancer.averageRating || 0}
                                </span>
                                 <span className="text-slate-400 dark:text-slate-500 text-sm">
                                  ({freelancer.reviewCount || 0})
                                </span>
                              </div>
                            </td>
                             <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                              {freelancer.totalProjects || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing{" "}
                  {totalFreelancers > 0 ? (currentPage - 1) * 12 + 1 : 0} to{" "}
                  {Math.min(currentPage * 12, totalFreelancers)} of{" "}
                  {totalFreelancers} freelancers
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="px-3 py-1 bg-teal text-white rounded-lg text-sm">
                    {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={
                      currentPage >= Math.ceil(totalFreelancers / 12) ||
                      totalFreelancers === 0
                    }
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientFreelancers;
