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
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B15] font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white dark:bg-transparent border-b border-slate-200 dark:border-none">
        <div className="absolute inset-0 bg-plus-pattern opacity-[0.03] dark:opacity-[0.05]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-royal-blue/10 rounded-full blur-[120px] -translate-y-1/2" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <AnimatedSection>
            <span className="inline-block px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-xs font-bold text-teal dark:text-teal-light mb-8 uppercase tracking-widest">
              Direct Access
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-navy dark:text-white">
              Connect with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">The Hub</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed px-2">
              Have a high-scale production requirement or want to join our elite roster? Our team is standing by to bridge the gap.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. MAIN CONTACT AREA */}
      <section className="pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
            
            {/* Left Col: Info Cards */}
            <div className="lg:col-span-2 space-y-6">
              {contactOptions.map((opt, idx) => (
                <AnimatedSection key={idx} delay={idx * 100}>
                  <div className="bg-white dark:bg-transparent dark:glass-card p-8 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-all group shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-6">
                      <div className={cn("w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm dark:shadow-none border border-slate-100 dark:border-none", opt.color)}>
                        <opt.icon size={28} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{opt.title}</div>
                        <a href={opt.link} className="text-lg font-bold text-navy dark:text-white hover:text-teal transition-colors break-all">
                          {opt.value}
                        </a>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}

              <AnimatedSection delay={300}>
                <div className="bg-white dark:bg-transparent dark:glass-card p-8 rounded-3xl border border-slate-100 dark:border-white/5 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-white/5 dark:to-transparent shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-4 mb-4 text-navy dark:text-white">
                    <Clock className="text-teal" size={20} />
                    <span className="text-sm font-bold uppercase tracking-widest">Efficiency Standard</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Our typical response time for verified inquiries is under 6 hours. Corporate partnerships processed within 2 hours.
                  </p>
                </div>
              </AnimatedSection>
            </div>

            {/* Right Col: Form */}
            <div className="lg:col-span-3">
              <AnimatedSection delay={200}>
                <div className="bg-white dark:bg-transparent dark:glass-card p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-xl dark:shadow-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 dark:bg-teal/5 blur-3xl rounded-full" />
                  
                  <h2 className="text-3xl font-bold mb-10 text-navy dark:text-white">Send a Brief</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Identity</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-teal rounded-2xl h-14 text-navy dark:text-white"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Email Endpoint</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-teal rounded-2xl h-14 text-navy dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Communication</label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 00000 00000"
                          className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-teal rounded-2xl h-14 text-navy dark:text-white"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Objective</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl h-14 px-4 text-sm focus:outline-none focus:border-teal appearance-none text-navy dark:text-white"
                        >
                          <option className="bg-white dark:bg-[#050B15]">General Inquiry</option>
                          <option className="bg-white dark:bg-[#050B15]">Production Booking</option>
                          <option className="bg-white dark:bg-[#050B15]">Partnership Proposal</option>
                          <option className="bg-white dark:bg-[#050B15]">Vetting Support</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">The Requirements</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Describe your project or inquiry with as much detail as possible..."
                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-teal rounded-2xl min-h-[200px] p-6 resize-none text-navy dark:text-white"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-16 rounded-2xl bg-teal dark:bg-white text-white dark:text-navy font-bold text-lg transition-all shadow-xl shadow-teal/20 dark:shadow-2xl active:scale-95"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          Transmit Message
                          <Send size={20} />
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              </AnimatedSection>
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
          className="grayscale invert dark:opacity-30 opacity-70 contrast-125"
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
