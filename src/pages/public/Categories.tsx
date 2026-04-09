import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  Film,
  Sparkles,
  Layers,
  Monitor,
  Palette,
  Layout,
  Smartphone,
  MousePointer2,
  FileText,
  Megaphone,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Custom hook for intersection observer animations
const useInView = (options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1, ...options },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
};

// Animated section wrapper
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
      className={cn(
        "transition-all duration-700",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const categoryGroups = [
  {
    title: "Post-Production & VFX",
    description: "Connect with world-class editors and visual effects artists.",
    categories: [
      {
        name: "Editing",
        icon: Film,
        count: "840+",
        color: "from-blue-500 to-blue-600",
        desc: "Professional video editing, trimming & narrative assembly.",
      },
      {
        name: "VFX",
        icon: Sparkles,
        count: "420+",
        color: "from-purple-500 to-pink-500",
        desc: "High-end visual effects, CGI integration & matte painting.",
      },
      {
        name: "3D Design",
        icon: Layers,
        count: "310+",
        color: "from-teal to-emerald-500",
        desc: "3D modeling, texturing, rigging & environmental design.",
      },
      {
        name: "Motion Graphics",
        icon: Monitor,
        count: "270+",
        color: "from-orange-500 to-red-500",
        desc: "Animated graphics, kinetic typography & visual storytelling.",
      },
      {
        name: "Color Grading",
        icon: Palette,
        count: "150+",
        color: "from-indigo-500 to-purple-600",
        desc: "Professional color correction & cinematic grade for films.",
      },
    ],
  },
  {
    title: "Digital Development",
    description: "Launch your presence with elite developers and designers.",
    categories: [
      {
        name: "Web Development",
        icon: Layout,
        count: "1,200+",
        color: "from-cyan-500 to-blue-600",
        desc: "Full-stack web apps, e-commerce & high-performance sites.",
      },
      {
        name: "Mobile Development",
        icon: Smartphone,
        count: "680+",
        color: "from-teal-500 to-emerald-600",
        desc: "Native and cross-platform mobile apps for iOS & Android.",
      },
      {
        name: "UI/UX Design",
        icon: MousePointer2,
        count: "540+",
        color: "from-pink-500 to-rose-600",
        desc: "User-centric design, prototyping & professional interfaces.",
      },
    ],
  },
  {
    title: "Marketing & Strategy",
    description: "Scale your reach with strategic storytellers and growth experts.",
    categories: [
      {
        name: "Content Writing",
        icon: FileText,
        count: "950+",
        color: "from-orange-500 to-amber-600",
        desc: "SEO writing, copywriting, scripts & professional storytelling.",
      },
      {
        name: "Digital Marketing",
        icon: Megaphone,
        count: "780+",
        color: "from-blue-600 to-indigo-600",
        desc: "Performance marketing, social media ads & growth strategy.",
      },
    ],
  },
];

const Categories = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar dark />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white dark:bg-background border-b border-slate-200 dark:border-white/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-royal-blue/5 dark:bg-royal-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-left">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-xs font-bold text-teal dark:text-teal-light mb-8 uppercase tracking-widest">
              Explore Talent
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-navy dark:text-white">
              Every Expertise to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">Build Your Future</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 leading-relaxed">
              Browse through our curated list of professional categories and find the elite talent your mission-critical projects deserve.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-32">
            {categoryGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-12">
                <AnimatedSection>
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-white/5 pb-8">
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-bold text-navy dark:text-white mb-4">{group.title}</h2>
                      <p className="text-slate-500 dark:text-slate-400">{group.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-teal">
                      <Zap size={16} />
                      {group.categories.length} Specilities
                    </div>
                  </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {group.categories.map((cat, catIdx) => (
                    <AnimatedSection key={catIdx} delay={catIdx * 100}>
                      <Link
                        to={`/freelancers?category=${encodeURIComponent(cat.name)}`}
                        className="group bg-white dark:bg-white/5 p-8 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-teal/20 dark:hover:border-teal/20 hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] block h-full shadow-sm dark:shadow-none"
                      >
                        <div
                          className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg bg-gradient-to-br transition-all group-hover:scale-110 group-hover:-rotate-3",
                            cat.color,
                          )}
                        >
                          <cat.icon size={32} />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-bold text-navy dark:text-white group-hover:text-teal transition-colors">
                            {cat.name}
                          </h3>
                          <span className="text-xs font-black bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400">
                            {cat.count}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                          {cat.desc}
                        </p>
                        <div className="flex items-center text-teal font-bold text-sm">
                          Browse Specialists{" "}
                          <ArrowRight
                            size={16}
                            className="ml-2 group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </Link>
                    </AnimatedSection>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 bg-slate-100 dark:bg-white/5 border-y border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto py-12">
            {[
              { icon: TrendingUp, label: "Market Growth", value: "85%", desc: "Increase in creative demand" },
              { icon: Award, label: "Vetted Pros", value: "10,000+", desc: "Verified mission-critical talent" },
              { icon: Zap, label: "Speed to Hire", value: "24h", desc: "Average placement timeline" },
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 150} className="text-center group">
                <div className="w-16 h-16 bg-white dark:bg-navy rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-slate-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                  <stat.icon size={28} className="text-teal" />
                </div>
                <div className="text-4xl font-black text-navy dark:text-white mb-2">{stat.value}</div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                <p className="text-xs text-slate-400">{stat.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-plus-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-6xl font-bold mb-10 text-navy dark:text-white">Ready to hire your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">Elite Partner</span>?</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register?role=client">
                <Button size="lg" className="h-16 px-12 rounded-2xl bg-teal text-white font-bold text-lg hover:bg-teal-light transition-all hover:scale-105 shadow-2xl shadow-teal/20">
                  Hire Elite Talent
                </Button>
              </Link>
              <Link to="/freelancers">
                <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl border-slate-300 text-slate-700 dark:border-white/20 dark:text-white font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  Browse All Artists
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Categories;
