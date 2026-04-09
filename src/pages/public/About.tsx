import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  Target,
  Eye,
  MapPin,
  BadgeCheck,
  Shield,
  Linkedin,
  Twitter,
  Users,
  Briefcase,
  Award,
  Rocket,
  Star,
  ArrowRight,
  Play,
  Sparkles,
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

const About = () => {

  const team = [
    {
      name: "Vikram Reddy",
      role: "Founder & CEO",
      avatar: "VR",
      bio: "10+ years in the creative industry",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Priya Sharma",
      role: "Head of Operations",
      avatar: "PS",
      bio: "Scaling expert with focus on quality",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Arjun Kumar",
      role: "CTO",
      avatar: "AK",
      bio: "Architecting the future of creative work",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Lakshmi Devi",
      role: "Community Lead",
      avatar: "LD",
      bio: "Bringing people together through creativity",
      linkedin: "#",
      twitter: "#",
    },
  ];

  const milestones = [
    {
      year: "2024",
      month: "Jan",
      title: "The Vision",
      desc: "ConnectMeIndia was born to empower South India's creative talent pool.",
    },
    {
      year: "2024",
      month: "Apr",
      title: "Milestone 100",
      desc: "Reached our first 100 verified professionals across AP & Telangana.",
    },
    {
      year: "2024",
      month: "Jul",
      title: "Earning Impact",
      desc: "Facilitated over ₹10 Lakhs in direct earnings for our local creators.",
    },
    {
      year: "2024",
      month: "Oct",
      title: "Scale Reached",
      desc: "500+ projects successfully delivered with 98% client satisfaction.",
    },
    {
      year: "2025",
      month: "Jan",
      title: "The Future",
      desc: "Expanding our platform tools to support 3D and VFX workflows end-to-end.",
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Hyper-Local Focus",
      desc: "Deeply rooted in the creative ecosystem of Southern India.",
      color: "from-blue-500 to-royal-blue",
    },
    {
      icon: BadgeCheck,
      title: "Elite Verification",
      desc: "Rigorous quality checks for every professional on our platform.",
      color: "from-teal to-emerald-500",
    },
    {
      icon: Shield,
      title: "Secure Future",
      desc: "Escrow-protected payments and secure project collaboration.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Sparkles,
      title: "Premium Results",
      desc: "Focus on high-end production value for every single project.",
      color: "from-gold to-orange-500",
    },
  ];

  const stats = [
    { value: "500+", label: "Curated Talents", icon: Users },
    { value: "1.2k+", label: "Success Stories", icon: Briefcase },
    { value: "85+", label: "Enterprise Clients", icon: Award },
    { value: "4.9/5", label: "Global Rating", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar dark />

      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-white dark:bg-transparent border-b border-slate-200 dark:border-none">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-royal-blue/5 dark:bg-royal-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-sm font-bold text-teal dark:text-teal-light mb-8 uppercase tracking-widest">
                <Rocket size={16} />
                Our Mission
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-8 text-navy dark:text-white">
                Pioneering the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">
                  Creative Economy
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl px-2">
                We are building more than a marketplace—we are architects of a
                borderless ecosystem where local talent meets global standards.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. STATS GRID */}
      <section className="py-20 bg-white dark:bg-white/5 border-y border-slate-200 dark:border-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-teal/20 transition-all border border-slate-100 dark:border-white/10 shadow-sm dark:shadow-none">
                    <stat.icon className="text-teal" size={30} />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2 tabular-nums text-navy dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OUR STORY SECTION */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: Interactive Visual */}
            <AnimatedSection>
              <div className="relative group">
                <div className="aspect-square md:aspect-[4/5] rounded-[2rem] bg-gradient-to-br from-teal/20 to-royal-blue/30 dark:from-navy dark:to-royal-blue/30 p-1 border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl dark:shadow-none">
                  <div className="h-full w-full bg-white dark:bg-background/80 rounded-[1.9rem] flex items-center justify-center relative overflow-hidden">
                    {/* Animated Shapes */}
                    <div className="absolute top-10 left-10 w-32 h-32 bg-teal/10 dark:bg-teal/20 blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-32 h-32 bg-royal-blue/10 dark:bg-royal-blue/20 blur-3xl animate-pulse delay-1000" />

                    <div className="text-center relative z-10 px-8">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-white/20 shadow-sm">
                        <Play fill="currentColor" className="text-teal dark:text-white ml-1" size={28} />
                      </div>
                      <h4 className="text-2xl font-bold mb-4 text-navy dark:text-white">Watch Our Journey</h4>
                      <p className="text-slate-600 dark:text-slate-400">Discover how ConnectMeIndia is transforming lives through creativity.</p>
                    </div>
                  </div>
                </div>

                {/* Floating Achievement Card */}
                <div className="absolute -bottom-10 -right-4 md:-right-10 bg-white dark:glass-card shadow-xl dark:shadow-none border border-slate-100 dark:border-white/10 p-6 rounded-2xl max-w-xs animate-float">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal/10 dark:bg-teal/20 rounded-xl flex items-center justify-center">
                      <Shield className="text-teal" size={24} />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-navy dark:text-white">100% Secure</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Every project protected by escrow and verification.</div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Narrative */}
            <AnimatedSection delay={200}>
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="text-teal font-bold uppercase tracking-widest text-sm">Our Genesis</span>
                  <h2 className="text-4xl md:text-6xl font-bold leading-tight text-navy dark:text-white">
                    From Local Roots to <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">Global Standards</span>
                  </h2>
                </div>

                <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  <p>
                    Founded in the heart of South India, ConnectMeIndia was born from a simple observation: the region is home to world-class talent, yet lacked a dedicated professional bridge.
                  </p>
                  <p>
                    We didn't just build another platform. We built a curator of excellence. By focusing on verified professionals in Video Production, VFX, and 3D Design, we are raising the bar for the entire creative community in Telangana and Andhra Pradesh.
                  </p>
                </div>

                <div className="pt-8">
                  <Button
                    size="lg"
                    className="bg-teal hover:bg-[#128a7f] text-white px-10 py-8 text-lg font-bold rounded-2xl shadow-2xl shadow-teal/30 transition-all hover:scale-105"
                  >
                    Partner With Us
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 4. MISSION & VISION - GLASSY TILES */}
      <section className="py-32 bg-white dark:bg-white/5 border-y border-slate-200 dark:border-white/5 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            <AnimatedSection>
              <div className="bg-slate-50 dark:bg-transparent dark:glass-card p-12 rounded-[2.5rem] h-full hover-glow shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10">
                <div className="w-16 h-16 bg-teal/10 dark:bg-teal/20 rounded-2xl flex items-center justify-center text-teal mb-8 border border-teal/20">
                  <Target size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-6 text-navy dark:text-white">Our Mission</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  To democratize access to elite creative workflows by bridging the gap between exceptional local talent and visionary businesses who value craftsmanship over mass production.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="bg-slate-50 dark:bg-transparent dark:glass-card p-12 rounded-[2.5rem] h-full hover-glow shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10">
                <div className="w-16 h-16 bg-royal-blue/10 dark:bg-royal-blue/20 rounded-2xl flex items-center justify-center text-royal-blue mb-8 border border-royal-blue/20">
                  <Eye size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-6 text-navy dark:text-white">Our Vision</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  To establish ConnectMeIndia as the definitive gold standard for creative hiring, fostering a future where professional growth is determined by skill alone, irrespective of location.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 4.5 WHY CHOOSE US - FEATURES */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="bg-white dark:bg-transparent dark:glass-card p-10 rounded-3xl hover-glow h-full group shadow-md dark:shadow-none border border-slate-100 dark:border-white/10">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-8 shadow-lg transition-all group-hover:scale-110 group-hover:-rotate-6",
                    feature.color
                  )}>
                    <feature.icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-navy dark:text-white">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TEAM EXHIBITION */}
      <section className="py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <span className="text-royal-blue dark:text-sky-blue font-bold tracking-widest uppercase text-sm">The Architects</span>
            <h2 className="text-4xl md:text-6xl font-bold text-navy dark:text-white">Behind the Vision</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="group relative bg-white dark:bg-transparent dark:glass-card p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 shadow-lg dark:shadow-none">
                  <div className="relative mb-8 inline-block">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal/10 to-royal-blue/10 dark:from-teal/20 dark:to-royal-blue/20 flex items-center justify-center text-teal dark:text-white font-bold text-3xl border border-slate-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                      {member.avatar}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-navy dark:text-white">{member.name}</h3>
                  <p className="text-teal dark:text-teal-light text-sm font-bold mb-4 uppercase tracking-wider">{member.role}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">{member.bio}</p>

                  <div className="flex gap-3">
                    <a href={member.linkedin} className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-transparent dark:glass-card flex items-center justify-center hover:bg-royal-blue hover:text-white transition-all border border-slate-200 dark:border-none">
                      <Linkedin size={16} />
                    </a>
                    <a href={member.twitter} className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-transparent dark:glass-card flex items-center justify-center hover:bg-sky-blue hover:text-white transition-all border border-slate-200 dark:border-none">
                      <Twitter size={16} />
                    </a>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TIMELINE JOURNEY */}
      <section className="py-32 bg-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12 relative">
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-teal/0 via-teal/50 to-teal/0" />

              {milestones.map((item, idx) => (
                <AnimatedSection key={idx} delay={idx * 100}>
                  <div className={cn(
                    "relative flex items-center w-full",
                    idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  )}>
                    <div className="hidden md:block w-1/2" />

                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-teal shadow-[0_0_15px_rgba(20,184,166,0.6)] z-10" />

                    <div className={cn(
                      "w-full md:w-1/2 pl-16 md:pl-0",
                      idx % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"
                    )}>
                      <div className="bg-white dark:bg-transparent dark:glass-card p-8 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-teal/30 hover:bg-slate-50 dark:hover:bg-white/10 transition-all cursor-default shadow-sm dark:shadow-none">
                        <span className="text-teal font-bold text-xs uppercase tracking-widest mb-2 block">
                          {item.month} {item.year}
                        </span>
                        <h4 className="text-xl font-bold mb-2 text-navy dark:text-white">{item.title}</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-royal-blue/20 to-teal/10 opacity-50" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <AnimatedSection>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-navy dark:text-white">
                Be Part of the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">Evolution</span>
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
                ConnectMeIndia is rapidly expanding. Secure your place in India's premier creative marketplace today.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/register?role=client">
                  <Button size="lg" className="h-16 px-12 rounded-2xl bg-teal dark:bg-white text-white dark:text-navy font-bold text-lg hover:bg-teal-light dark:hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-teal/20 dark:shadow-2xl">
                    Hire Talent
                  </Button>
                </Link>
                <Link to="/register?role=freelancer">
                  <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                    Find Work
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default About;
