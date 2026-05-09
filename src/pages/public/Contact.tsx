import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

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

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent Successfully",
        description: "An elite representative will contact you shortly.",
        className: "bg-teal text-white border-0",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      });
    }, 1500);
  };

  const contactOptions = [
    {
      icon: Mail,
      title: "Electronic Mail",
      value: "hello@connectmeindia.in",
      link: "mailto:hello@connectmeindia.in",
      color: "text-teal",
    },
    {
      icon: Phone,
      title: "Direct Pipeline",
      value: "+91 40 1234 5678",
      link: "tel:+914012345678",
      color: "text-royal-blue",
    },
    {
      icon: MapPin,
      title: "Central Studio",
      value: "T-Hub, Phase 2, Hyderabad",
      link: "https://goo.gl/maps/example",
      color: "text-sky-blue",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar dark />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-40 overflow-hidden bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.05] dark:opacity-[0.1]" />
        
        {/* Decorative Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal/10 dark:bg-teal/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-royal-blue/5 dark:bg-royal-blue/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <div className="flex justify-center mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-bold text-teal dark:text-teal-light uppercase tracking-[0.2em]">
                  <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                  Direct Access
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-navy dark:text-white leading-[1.1] tracking-tight">
                Connect with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">
                  The Hub
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                Have a high-scale production requirement or want to join our elite roster? Our team is standing by to bridge the gap.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTACT AREA */}
      <section className="pb-32 -mt-10 relative z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
              
              {/* Left Col: Info Cards */}
              <div className="lg:col-span-5 space-y-6">
                <AnimatedSection delay={100}>
                  <div className="space-y-6">
                    {contactOptions.map((opt, idx) => (
                      <div key={idx} className="bg-white dark:bg-transparent dark:glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 hover:border-teal/30 dark:hover:border-teal/30 transition-all group shadow-sm hover:shadow-md dark:shadow-none">
                        <div className="flex items-center gap-5">
                          <div className={cn("w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm dark:shadow-none border border-slate-100 dark:border-none", opt.color)}>
                            <opt.icon size={24} />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{opt.title}</div>
                            <a href={opt.link} className="text-base md:text-lg font-bold text-navy dark:text-white hover:text-teal transition-colors break-all">
                              {opt.value}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={400}>
                  <div className="bg-gradient-to-br from-teal/5 to-royal-blue/5 dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-teal/10 dark:border-white/5 shadow-sm dark:shadow-none backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4 text-navy dark:text-white">
                      <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">
                        <Clock className="text-teal" size={16} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">Efficiency Standard</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      Our typical response time for verified inquiries is under <strong className="text-navy dark:text-white">6 hours</strong>. Corporate partnerships processed within <strong className="text-navy dark:text-white">2 hours</strong>.
                    </p>
                  </div>
                </AnimatedSection>
              </div>

              {/* Right Col: Form */}
              <div className="lg:col-span-7">
                <AnimatedSection delay={200}>
                  <div className="bg-white dark:bg-transparent dark:glass-card p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 dark:bg-teal/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-royal-blue/5 dark:bg-royal-blue/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative z-10">
                      <h2 className="text-3xl md:text-4xl font-bold mb-2 text-navy dark:text-white">Send a Brief</h2>
                      <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm">Tell us about your project or inquiry.</p>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 ml-1">Identity</label>
                            <Input
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Your full name"
                              className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-teal rounded-2xl h-14 text-navy dark:text-white placeholder:text-slate-400"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 ml-1">Email Endpoint</label>
                            <Input
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="your@email.com"
                              className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-teal rounded-2xl h-14 text-navy dark:text-white placeholder:text-slate-400"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 ml-1">Communication</label>
                            <Input
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="+91 00000 00000"
                              className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-teal rounded-2xl h-14 text-navy dark:text-white placeholder:text-slate-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 ml-1">Objective</label>
                            <div className="relative">
                              <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl h-14 px-4 text-sm focus:outline-none focus:border-teal appearance-none text-navy dark:text-white"
                              >
                                <option className="bg-white dark:bg-background">General Inquiry</option>
                                <option className="bg-white dark:bg-background">Production Booking</option>
                                <option className="bg-white dark:bg-background">Partnership Proposal</option>
                                <option className="bg-white dark:bg-background">Vetting Support</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronRight size={16} className="rotate-90" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 ml-1">The Requirements</label>
                          <Textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Describe your project or inquiry with as much detail as possible..."
                            className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-teal rounded-2xl min-h-[160px] p-6 resize-none text-navy dark:text-white placeholder:text-slate-400"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-16 rounded-2xl bg-teal hover:bg-[#128a7f] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy font-bold text-lg transition-all shadow-xl shadow-teal/20 dark:shadow-none hover:shadow-teal/30 hover:scale-[1.01] active:scale-95"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-navy/30 dark:border-t-navy rounded-full animate-spin" />
                              Processing...
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              Transmit Message
                              <Send size={18} />
                            </div>
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAP SECTION */}
      <section className="relative h-[600px] w-full bg-slate-100 dark:bg-navy border-y border-slate-200 dark:border-white/5 overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.452664976722!2d78.37582307593256!3d17.43632903326162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688eb5c58c0276!2sT-Hub!5e0!3m2!1sen!2sin!4v1706600000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          className="grayscale opacity-50 dark:opacity-20 dark:invert transition-opacity duration-500 hover:opacity-70 dark:hover:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-50 dark:from-[#050B15] dark:via-transparent dark:to-[#050B15] pointer-events-none" />
        
        {/* Dynamic Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-teal/20 animate-[ping_3s_infinite] absolute -inset-6" />
            <div className="w-4 h-4 bg-teal rounded-full border-2 border-white shadow-[0_0_20px_rgba(45,212,191,0.8)]" />
          </div>
        </div>
      </section>

      {/* 4. FINAL FAQ CTA */}
      <section className="py-32">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold mb-6 text-navy dark:text-white">Need Immediate Clarity?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-10">Our detailed resource center covers everything from payout timelines to project contracts.</p>
            <Link to="/how-it-works">
              <Button variant="outline" className="h-14 px-8 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-navy dark:text-white font-bold transition-all hover:scale-105 active:scale-95">
                Visit Resource Center
                <ChevronRight size={18} className="ml-2" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Contact;
