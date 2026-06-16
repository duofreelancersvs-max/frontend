import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { SEO } from '@/components/SEO/SEO';
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  Shield,
  CreditCard,
  Scale,
  Search,
  Gavel,
  MapPin,
  Ban,
  MessageSquare,
  Copyright,
  Star,
  Info,
  RefreshCw,
  BadgeCheck,
  AlertTriangle,
  PenLine,
  Lock,
  ChevronRight,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { publicService, type LegalContent, type LegalSection } from "@/services/public.service";

// ─── Icon map ──────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  bridge: Shield,
  payment: CreditCard,
  shield: Scale,
  search: Search,
  gavel: Gavel,
  map: MapPin,
  ban: Ban,
  message: MessageSquare,
  copyright: Copyright,
  star: Star,
  info: Info,
  refund: RefreshCw,
  badge: BadgeCheck,
  prohibited: AlertTriangle,
  edit: PenLine,
  lock: Lock,
};

const getIcon = (key?: string): React.ElementType =>
  (key && ICON_MAP[key]) || Shield;

// ─── Intersection observer hook ────────────────────────────────────────────────
const useInView = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setIsInView(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, isInView };
};

// ─── Animated section ─────────────────────────────────────────────────────────
const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── Section card ─────────────────────────────────────────────────────────────
const SectionCard = ({
  section,
  idx,
}: {
  section: LegalSection;
  idx: number;
}) => {
  const [open, setOpen] = useState(idx < 3); // First 3 open by default
  const Icon = getIcon(section.icon);

  const accentColors = [
    "from-teal to-emerald-500",
    "from-royal-blue to-sky-blue",
    "from-purple-500 to-pink-500",
    "from-amber-500 to-orange-500",
    "from-red-500 to-rose-600",
    "from-indigo-500 to-violet-500",
    "from-cyan-500 to-teal",
    "from-green-500 to-emerald-400",
  ];
  const accent = accentColors[idx % accentColors.length];

  return (
    <AnimatedSection delay={idx * 60}>
      <div
        className={`group bg-white dark:bg-transparent dark:glass-card rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-none hover:border-teal/30 dark:hover:border-white/20`}
      >
        {/* Card Header */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-5 px-7 py-6 text-left focus:outline-none group-hover:bg-slate-50 dark:group-hover:bg-white/5 transition-colors"
          aria-expanded={open}
        >
          {/* Number badge */}
          <span className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-300">
            {String(section.sectionNumber).padStart(2, "0")}
          </span>

          {/* Icon */}
          <span
            className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon size={20} />
          </span>

          {/* Title */}
          <h2 className="flex-1 text-lg md:text-xl font-bold text-navy dark:text-white leading-tight">
            {section.title}
          </h2>

          {/* Chevron */}
          <ChevronRight
            size={20}
            className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
          />
        </button>

        {/* Collapsible body */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${open ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="px-7 pb-8 space-y-4">
            {/* Divider */}
            <div className="h-px bg-slate-100 dark:bg-white/5 mb-2" />

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              {section.content}
            </p>

            {section.bulletPoints && section.bulletPoints.length > 0 && (
              <ul className="space-y-2 mt-3">
                {section.bulletPoints.map((bp, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`mt-1.5 shrink-0 w-2 h-2 rounded-full bg-gradient-to-br ${accent}`} />
                    <span className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {bp}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

// ─── Safety Tips Banner ───────────────────────────────────────────────────────
const SafetyTipsBanner = ({ tips }: { tips: string[] }) => (
  <AnimatedSection>
    <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/15 border border-amber-200 dark:border-amber-500/30 rounded-3xl p-8 md:p-10 overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-300/40 flex items-center justify-center">
            <ShieldAlert className="text-amber-600 dark:text-amber-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">
              Safety Tips for Users
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">
              Protect yourself
            </p>
          </div>
        </div>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
              <span className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </AnimatedSection>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 p-7 animate-pulse">
    <div className="flex items-center gap-5">
      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10" />
      <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-white/10" />
      <div className="flex-1 h-5 rounded bg-slate-200 dark:bg-white/10 max-w-md" />
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const LegalPage = ({ defaultSlug }: { defaultSlug?: string }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = paramSlug || defaultSlug;
  const navigate = useNavigate();
  const [data, setData] = useState<LegalContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setData(null); // Clear previous data to avoid flickering
        setError(null);
        const result = await publicService.getLegalContent(slug);
        if (!result) {
          setError("Legal page not found.");
        } else {
          setData(result);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load legal content.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const formattedDate = data?.lastUpdated
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(data.lastUpdated))
    : null;


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <SEO 
        title={data?.pageTitle ? `${data.pageTitle} | ConnectMeIndia` : "Legal | ConnectMeIndia"} 
        description={data?.subtitle || "Read the legal agreements, terms, and policies for ConnectMeIndia."} 
        canonical={`/legal/${slug}`} 
      />
      <PublicNavbar dark />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-white dark:bg-transparent border-b border-slate-200 dark:border-white/5">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-teal/5 dark:bg-teal/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-royal-blue/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-10">
            <Link to="/" className="hover:text-teal transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{data?.pageTitle || "Legal"}</span>
          </nav>

          <AnimatedSection>
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-sm font-bold text-teal dark:text-teal-light mb-8 uppercase tracking-widest">
                <Scale size={15} />
                Legal Agreement
              </span>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-navy dark:text-white">
                {data?.pageTitle ? (
                  <>
                    {data.pageTitle.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">
                      {data.pageTitle.split(' ').slice(-1)}
                    </span>
                  </>
                ) : (
                  "Legal Page"
                )}
              </h1>

              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                {data?.subtitle ??
                  "Please read these terms carefully. By accessing our platform, you agree to the following terms."}
              </p>

              {formattedDate && (
                <div className="mt-8 flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <PenLine size={14} className="text-teal" />
                    <span>Last Updated: <strong className="text-slate-700 dark:text-slate-300">{formattedDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Info size={14} className="text-royal-blue" />
                    <span>Version: <strong className="text-slate-700 dark:text-slate-300">{data?.version}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-5">

            {/* Loading state */}
            {loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
                  <Loader2 size={22} className="animate-spin text-teal" />
                  <span className="text-sm font-medium">Loading {slug?.replace(/-/g, ' ')}…</span>
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                  <AlertCircle size={28} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-white">Failed to Load</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">{error}</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-2 px-6 py-3 rounded-xl bg-teal text-white font-semibold hover:bg-teal-600 transition-colors"
                >
                  Go Back Home
                </button>
              </div>
            )}

            {/* Loaded state */}
            {!loading && !error && data && (
              <>
                {/* Safety Tips — prominent placement above sections */}
                {data.safetyTips && data.safetyTips.length > 0 && (
                  <SafetyTipsBanner tips={data.safetyTips} />
                )}

                {/* Section cards */}
                {data.sections.map((section, idx) => (
                  <SectionCard key={section.sectionNumber} section={section} idx={idx} />
                ))}

                {/* Footer note */}
                <AnimatedSection delay={200}>
                  <div className="mt-12 p-8 bg-gradient-to-br from-teal/5 to-royal-blue/5 dark:from-teal/10 dark:to-royal-blue/10 rounded-3xl border border-teal/20 dark:border-teal/30 text-center space-y-3">
                    <Shield size={32} className="mx-auto text-teal" />
                    <h3 className="text-xl font-bold text-navy dark:text-white">
                      Questions or Concerns?
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
                      If you have any questions about our {data.pageTitle.toLowerCase()}, please reach out via our contact page.
                    </p>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 mt-2 px-8 py-3 bg-teal text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal/20"
                    >
                      Contact Us
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </AnimatedSection>
              </>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default LegalPage;
