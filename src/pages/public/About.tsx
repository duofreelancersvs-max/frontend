import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/shared/Logo";
import {
  ChevronRight,
  Target,
  Eye,
  MapPin,
  BadgeCheck,
  Tag,
  Shield,
  Linkedin,
  Twitter,
  Users,
  Briefcase,
  Award,
  Rocket,
  Heart,
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
  const [activeTimelineItem, setActiveTimelineItem] = useState(0);

  const team = [
    {
      name: "Vikram Reddy",
      role: "Founder & CEO",
      avatar: "VR",
      bio: "10+ years in creative industry",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Priya Sharma",
      role: "Head of Operations",
      avatar: "PS",
      bio: "Ex-Google, scaling expert",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Arjun Kumar",
      role: "CTO",
      avatar: "AK",
      bio: "Full-stack architect",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Lakshmi Devi",
      role: "Community Lead",
      avatar: "LD",
      bio: "Building creator communities",
      linkedin: "#",
      twitter: "#",
    },
  ];

  const milestones = [
    {
      year: "2024",
      month: "Jan",
      title: "Founded",
      desc: "ConnectMeIndia was born with a vision to empower local creative talent",
    },
    {
      year: "2024",
      month: "Apr",
      title: "100 Freelancers",
      desc: "Reached our first milestone of 100 verified creative professionals",
    },
    {
      year: "2024",
      month: "Jul",
      title: "₹10L+ Earned",
      desc: "Freelancers on our platform collectively earned over ₹10 lakhs",
    },
    {
      year: "2024",
      month: "Oct",
      title: "500+ Projects",
      desc: "Successfully facilitated 500+ creative projects across AP & Telangana",
    },
    {
      year: "2025",
      month: "Jan",
      title: "1000 Users",
      desc: "Growing community of 1000+ clients and freelancers",
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Local Talent Focus",
      desc: "Exclusively serving Telangana & Andhra Pradesh, we understand the local creative ecosystem",
      color: "from-blue-500 to-royal-blue",
    },
    {
      icon: BadgeCheck,
      title: "Verified Professionals",
      desc: "Every freelancer goes through our rigorous verification process for quality assurance",
      color: "from-teal to-emerald-500",
    },
    {
      icon: Tag,
      title: "Transparent Pricing",
      desc: "No hidden fees. Clear pricing with our escrow-protected payment system",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Secure Communication",
      desc: "End-to-end encrypted messaging keeps your project discussions private and safe",
      color: "from-gold to-orange-500",
    },
  ];

  const stats = [
    { value: "500+", label: "Freelancers", icon: Users },
    { value: "1000+", label: "Projects", icon: Briefcase },
    { value: "50+", label: "Companies", icon: Award },
    { value: "4.9", label: "Avg Rating", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Logo size="sm" />

            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                Home
              </Link>
              <Link to="/about" className="text-sm font-medium text-royal-blue">
                About
              </Link>
              <Link
                to="/pricing"
                className="text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-royal-blue font-semibold">
                Log In
              </Button>
              <Button className="bg-teal hover:bg-teal-light text-white font-semibold px-6">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. PAGE HEADER */}
      <section className="relative py-20 bg-[#050B15] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue" />
        <div className="absolute inset-0 bg-plus-pattern opacity-[0.05]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-royal-blue/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-white">About Us</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Building the Future of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
                Creative Work
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              We're on a mission to connect talented creative professionals with
              businesses who value quality and local expertise.
            </p>
          </div>
        </div>
      </section>

      {/* 2. OUR STORY SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Image/Illustration */}
            <AnimatedSection>
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden relative group">
                  {/* Abstract Creative Illustration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      {/* Floating Elements */}
                      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-teal to-teal-light rounded-2xl rotate-12 opacity-80 animate-float" />
                      <div className="absolute top-20 right-16 w-16 h-16 bg-gradient-to-br from-royal-blue to-blue-500 rounded-full opacity-70 animate-float-delayed" />
                      <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-gold to-orange-400 rounded-3xl -rotate-12 opacity-60 animate-float" />
                      <div className="absolute bottom-16 right-10 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl rotate-45 opacity-70 animate-float-delayed" />

                      {/* Center Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer group-hover:scale-110 transition-transform">
                          <Play
                            className="text-navy ml-1"
                            size={32}
                            fill="currentColor"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats Card */}
                <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center">
                      <Heart className="text-teal" size={24} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-navy">95%</div>
                      <div className="text-sm text-slate-500">
                        Client Satisfaction
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Content */}
            <AnimatedSection delay={200}>
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-royal-blue/10 text-royal-blue rounded-full text-sm font-semibold mb-6">
                  <Sparkles size={16} />
                  Our Story
                </span>

                <h2 className="text-3xl md:text-5xl font-bold text-navy mb-6 leading-tight">
                  Connecting Creativity with Opportunity
                </h2>

                <div className="space-y-4 text-slate-600 text-lg leading-relaxed mb-8">
                  <p>
                    ConnectMeIndia was born from a simple observation: South
                    India has an incredible pool of creative talent, but
                    connecting them with the right opportunities was a
                    challenge.
                  </p>
                  <p>
                    We set out to build a platform that celebrates local
                    expertise while providing world-class tools for
                    collaboration. Today, we're proud to be the bridge between
                    talented video editors, VFX artists, and 3D designers with
                    businesses who value quality work.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-navy text-white rounded-xl font-semibold">
                    <Rocket size={20} />
                    Founded in 2024
                  </div>
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-slate-100 text-navy rounded-xl font-semibold">
                    <MapPin size={20} />
                    Hyderabad, India
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 3. MISSION & VISION */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-navy mb-4">
                What Drives Us
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Our mission and vision guide every decision we make
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission Card */}
            <AnimatedSection delay={100}>
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-teal to-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Target size={32} />
                </div>
                <h3 className="text-2xl font-bold text-navy mb-4">
                  Our Mission
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  To democratize access to creative opportunities by building a
                  trusted marketplace that empowers local talent and enables
                  businesses to find the perfect creative partner for their
                  projects.
                </p>
              </div>
            </AnimatedSection>

            {/* Vision Card */}
            <AnimatedSection delay={200}>
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-royal-blue to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Eye size={32} />
                </div>
                <h3 className="text-2xl font-bold text-navy mb-4">
                  Our Vision
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  To become the leading creative marketplace in India, known for
                  quality, trust, and the success stories of freelancers who
                  built thriving careers through our platform.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="py-12 bg-gradient-to-r from-navy to-royal-blue">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="text-center text-white">
                  <stat.icon className="mx-auto mb-3 opacity-70" size={28} />
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/70 font-medium">
                    {stat.label}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-semibold mb-4">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mb-4">
                What Makes Us Different
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                We're not just another marketplace. Here's why businesses and
                freelancers trust us.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="group bg-white p-8 rounded-2xl border border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-full">
                  {/* Background gradient on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br",
                      feature.color,
                    )}
                  />

                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg bg-gradient-to-br transition-all group-hover:scale-110 group-hover:-rotate-6",
                      feature.color,
                    )}
                  >
                    <feature.icon size={26} />
                  </div>

                  <h3 className="text-lg font-bold text-navy mb-3 group-hover:text-royal-blue transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TEAM SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
                <Heart size={14} className="inline mr-1" />
                Our Team
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mb-4">
                Meet the People Behind ConnectMeIndia
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                A passionate team dedicated to empowering creative professionals
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500">
                  {/* Header Gradient */}
                  <div className="h-24 bg-gradient-to-r from-navy to-royal-blue relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
                  </div>

                  {/* Profile */}
                  <div className="px-6 pb-6 -mt-12 relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg mb-4 group-hover:scale-110 transition-transform">
                      {member.avatar}
                    </div>

                    <h3 className="font-bold text-navy text-lg">
                      {member.name}
                    </h3>
                    <p className="text-teal text-sm font-medium mb-2">
                      {member.role}
                    </p>
                    <p className="text-slate-500 text-sm mb-4">{member.bio}</p>

                    {/* Social Links */}
                    <div className="flex gap-2">
                      <a
                        href={member.linkedin}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-royal-blue hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Linkedin size={16} />
                      </a>
                      <a
                        href={member.twitter}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Twitter size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 6. MILESTONES / TIMELINE */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-teal/10 text-teal rounded-full text-sm font-semibold mb-4">
                <Rocket size={14} className="inline mr-1" />
                Our Journey
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mb-4">
                From Idea to Impact
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Key milestones in our journey to transform creative work in
                South India
              </p>
            </div>
          </AnimatedSection>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal via-royal-blue to-navy" />

              {milestones.map((item, idx) => (
                <AnimatedSection key={idx} delay={idx * 150}>
                  <div
                    className={cn(
                      "relative flex items-center mb-12 last:mb-0",
                      idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
                    )}
                  >
                    {/* Content */}
                    <div
                      className={cn(
                        "ml-20 md:ml-0 md:w-1/2",
                        idx % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16",
                      )}
                    >
                      <div
                        className={cn(
                          "bg-white p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer",
                          activeTimelineItem === idx
                            ? "border-teal shadow-lg shadow-teal/10"
                            : "border-slate-100 hover:border-slate-200",
                        )}
                        onMouseEnter={() => setActiveTimelineItem(idx)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-teal">
                            {item.month} {item.year}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-navy mb-2">
                          {item.title}
                        </h3>
                        <p className="text-slate-500">{item.desc}</p>
                      </div>
                    </div>

                    {/* Circle */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-4 border-white transition-all duration-300",
                          activeTimelineItem === idx
                            ? "bg-teal scale-150"
                            : "bg-royal-blue",
                        )}
                      />
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-24 bg-gradient-to-br from-royal-blue to-navy relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Join Our Growing Community
              </h2>
              <p className="text-white/80 text-xl mb-10 leading-relaxed">
                Whether you're looking for talent or looking to showcase your
                skills, ConnectMeIndia is the place for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-teal hover:bg-teal-light text-white font-bold text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  Hire Talent
                  <ArrowRight size={20} className="ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-bold text-lg px-10 py-7 rounded-xl"
                >
                  Become a Freelancer
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-navy text-white pt-20 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-6">
                <Logo isDark size="sm" />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The premier marketplace for creative professionals in Telangana
                and Andhra Pradesh.
              </p>
              <div className="flex gap-3">
                {[Twitter, Linkedin].map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-teal flex items-center justify-center transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "For Clients",
                links: ["Find Talent", "Post Project", "Pricing", "Enterprise"],
              },
              {
                title: "For Freelancers",
                links: [
                  "Create Profile",
                  "Browse Jobs",
                  "Subscription",
                  "Resources",
                ],
              },
              {
                title: "Support",
                links: ["Contact Us", "Help Center", "Privacy Policy", "Terms"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-lg mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-slate-400 hover:text-teal transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 ConnectMeIndia. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin size={14} />
              <span>Made with ❤️ in Hyderabad</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-15px) rotate(12deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default About;
