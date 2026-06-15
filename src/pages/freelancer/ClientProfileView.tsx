import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Building2, MapPin, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clientService } from "@/services";
import type { ClientProfile } from "@/services";
import DashboardHeader from "@/components/layouts/DashboardHeader";

const ClientProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const participant = location.state?.participant;

  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const profileData = await clientService.getByUserId(id);
        setClientProfile(profileData);
      } catch (error) {
        console.error("Error fetching client profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  const name = participant?.name || "Client";
  const title = participant?.title;
  const company = participant?.company;
  const clientLocation = participant?.location;
  const rating = clientProfile?.averageRating || participant?.rating || 0;

  return (
    <div className="flex-1 bg-slate-50 dark:bg-background min-h-screen">
      <DashboardHeader
        title="Client Profile"
        onMenuClick={() => navigate(-1)}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white transition-colors mr-4"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back</span>
        </button>
      </DashboardHeader>

      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 overflow-hidden">
          {/* Header section */}
          <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
              {participant?.avatar ? (
                <img
                  src={participant.avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} />
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">
                {name}
              </h1>
              {title && (
                <p className="text-teal font-medium mb-3">{title}</p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
                {company && (
                  <div className="flex items-center gap-1.5">
                    <Building2 size={16} />
                    <span>{company}</span>
                  </div>
                )}
                {clientLocation && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    <span>{clientLocation}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-navy dark:text-white">
                    {rating}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <Button
                onClick={() => navigate(-1)}
                className="bg-teal hover:bg-teal-light text-white w-full md:w-auto"
              >
                Message Client
              </Button>
            </div>
          </div>

          {/* Stats section */}
          <div className="p-8 bg-slate-50/50 dark:bg-white/5">
            <h2 className="text-lg font-bold text-navy dark:text-white mb-6">
              Client Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-white/5 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Total Projects Posted
                </p>
                <p className="text-3xl font-bold text-navy dark:text-white">
                  {clientProfile?.totalProjectsPosted || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-white/5 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Total Hires
                </p>
                <p className="text-3xl font-bold text-navy dark:text-white">
                  {clientProfile?.totalHires || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-white/5 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Member Since
                </p>
                <p className="text-xl font-bold text-navy dark:text-white mt-2">
                  {clientProfile?.createdAt
                    ? new Date(clientProfile.createdAt).getFullYear()
                    : "Recently"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileView;
