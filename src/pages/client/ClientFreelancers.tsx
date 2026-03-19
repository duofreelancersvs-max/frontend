import { useState, useEffect } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import { useUnreadStore } from "@/stores/unread.store";
import {
  PlusCircle,
  Search,
  ChevronDown,
  MessageSquare,
  LogOut,
  X,
  Menu,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Briefcase,
  Star,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { freelancerService } from "@/services";
import type { FreelancerProfile } from "@/services";

const categories = [
  "Editing",
  "VFX",
  "3D Design",
  "Motion Graphics",
  "Color Grading",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Content Writing",
  "Digital Marketing",
];

const skillOptions = [
  "Adobe Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Final Cut Pro",
  "Cinema 4D",
  "Blender",
  "Maya",
  "3ds Max",
  "Nuke",
  "Fusion",
  "Photoshop",
  "Illustrator",
  "Figma",
  "Sketch",
  "Webflow",
  "React",
  "Node.js",
  "Python",
];

const FreelancerCard = ({ freelancer }: { freelancer: FreelancerProfile }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/client/freelancer/${freelancer._id || freelancer.id}`)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 cursor-pointer hover:border-teal/30 group"
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

      <h3 className="font-semibold text-navy mb-1 line-clamp-1 group-hover:text-teal transition-colors">
        {freelancer.displayName ||
          `${freelancer.firstName || ""} ${freelancer.lastName || ""}`.trim() ||
          "Freelancer"}
      </h3>
      <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
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
            className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
          >
            {typeof skill === "string" ? skill : skill.name}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-navy">
            {freelancer.averageRating || 0}
          </span>
          <span className="text-slate-400 text-xs">
            ({freelancer.reviewCount || 0})
          </span>
        </div>
      </div>
    </div>
  );
};

const ClientFreelancers = () => {
  const navigate = useNavigate();
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [totalFreelancers, setTotalFreelancers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 font-sans">
      {/* MAIN CONTENT */}
      <div>
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
                  Find Freelancers
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Discover and hire talented freelancers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <Link to="/client/post-project">
                <Button className="bg-teal hover:bg-teal-light text-white hidden sm:flex">
                  <PlusCircle size={18} className="mr-2" />
                  Post New Project
                </Button>
              </Link>

              <Link
                to="/client/messages"
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex"
              >
                <MessageSquare size={20} />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white" />
                )}
              </Link>

              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

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
                        {user?.fullName || user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/client/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Users size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/client/settings"
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
        <main className="p-4 lg:p-8">
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
                  className="pl-10 border-slate-200"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-navy" : ""}
                >
                  <Grid3X3 size={18} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-navy" : ""}
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
                  className="inline-flex items-center gap-1 px-3 py-1 bg-teal/10 text-teal rounded-full text-sm"
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
                  className="inline-flex items-center gap-1 px-3 py-1 bg-royal-blue/10 text-royal-blue rounded-full text-sm"
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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-6">
              <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
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
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-6">
              <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
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
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
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
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-2">
                No freelancers found
              </h3>
              <p className="text-slate-500 mb-4">
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
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-navy">
                            Freelancer
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-navy">
                            Skills
                          </th>

                          <th className="text-left px-6 py-4 text-sm font-semibold text-navy">
                            Rating
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-navy">
                            Projects
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {freelancers.map((freelancer) => (
                          <tr
                            key={freelancer._id || freelancer.id}
                            className="hover:bg-slate-50 cursor-pointer group"
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
                                  <p className="font-medium text-navy">
                                    {freelancer.displayName ||
                                      `${freelancer.firstName || ""} ${freelancer.lastName || ""}`.trim() ||
                                      "Freelancer"}
                                  </p>
                                  <p className="text-sm text-slate-500">
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
                                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
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
                                <span className="font-medium text-navy">
                                  {freelancer.averageRating || 0}
                                </span>
                                <span className="text-slate-400 text-sm">
                                  ({freelancer.reviewCount || 0})
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
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
                <p className="text-sm text-slate-500">
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
