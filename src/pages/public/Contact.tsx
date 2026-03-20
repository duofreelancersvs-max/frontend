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
  ChevronDown,
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);
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

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
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

  const faqs = [
    {
      question: "What are your support hours?",
      answer:
        "Our support team is available Monday through Friday from 9 AM to 6 PM IST. For urgent matters, we also check emails on weekends.",
    },
    {
      question: "Do you have a physical office?",
      answer:
        "Yes, our headquarters is located in Hitech City, Hyderabad. You're welcome to visit us with a prior appointment.",
    },
    {
      question: "How long does it take to get a reply?",
      answer:
        "We typically respond to all inquiries within 24 hours during business days.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      <PublicNavbar variant="white" />

      {/* 1. PAGE HEADER */}
      <section className="relative py-20 bg-[#050B15] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue" />
        <div className="absolute inset-0 bg-plus-pattern opacity-[0.05]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-royal-blue/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-white">Contact Us</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Get in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
                Touch
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
              We're here to help. Whether you have a question about our
              platform, need support, or just want to say hello.
            </p>
          </div>
        </div>
      </section>

      {/* 2. CONTACT SECTION */}
      <section className="py-20 bg-slate-50 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto -mt-32">
            {/* LEFT COLUMN - Contact Form */}
            <AnimatedSection>
              <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-slate-100">
                <h2 className="text-2xl font-bold text-navy mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="bg-slate-50 border-slate-200 focus:border-teal focus:ring-teal h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="bg-slate-50 border-slate-200 focus:border-teal focus:ring-teal h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="bg-slate-50 border-slate-200 focus:border-teal focus:ring-teal h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="subject"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="flex h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option>General Inquiry</option>
                        <option>Support Help</option>
                        <option>Sales & Pricing</option>
                        <option>Partnership</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you today?"
                      className="bg-slate-50 border-slate-200 focus:border-teal focus:ring-teal min-h-[150px] resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-teal hover:bg-teal-light text-white font-bold h-12 text-lg shadow-lg shadow-teal/25"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send size={18} className="ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </AnimatedSection>

            {/* RIGHT COLUMN - Contact Info */}
            <div className="space-y-8 pt-10 lg:pt-0">
              <AnimatedSection delay={100}>
                <div className="grid gap-6">
                  {/* Address */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-royal-blue/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-royal-blue" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-lg mb-1">
                        Our Office
                      </h3>
                      <p className="text-slate-500 leading-relaxed">
                        T-Hub, Phase 2, Plot No 1/C, Sy No 83/1,
                        <br />
                        Raidurgam, Hyderabad,
                        <br />
                        Telangana 500081
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="text-teal" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-lg mb-1">
                        Email Us
                      </h3>
                      <p className="text-slate-500 mb-2">
                        For general inquiries:
                      </p>
                      <a
                        href="mailto:hello@connectmeindia.in"
                        className="text-teal font-semibold hover:underline"
                      >
                        hello@connectmeindia.in
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="text-gold" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-lg mb-1">
                        Call Us
                      </h3>
                      <p className="text-slate-500 mb-2">
                        Mon-Fri from 9am to 6pm:
                      </p>
                      <a
                        href="tel:+914012345678"
                        className="text-navy font-semibold hover:underline"
                      >
                        +91 40 1234 5678
                      </a>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="text-slate-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-lg mb-1">
                        Working Hours
                      </h3>
                      <p className="text-slate-500">
                        Monday - Friday: 9:00 AM - 6:00 PM
                        <br />
                        Saturday: 10:00 AM - 2:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAP SECTION */}
      <section className="h-[400px] w-full bg-slate-200 relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.452664976722!2d78.37582307593256!3d17.43632903326162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688eb5c58c0276!2sT-Hub!5e0!3m2!1sen!2sin!4v1706600000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale hover:grayscale-0 transition-all duration-500"
        />
        {/* Location Marker Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-teal animate-ping absolute inset-0" />
            <div className="w-4 h-4 rounded-full bg-teal border-2 border-white shadow-lg" />
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-navy mb-8 text-center">
                Frequently Asked Questions
              </h2>
            </AnimatedSection>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <AnimatedSection key={idx} delay={idx * 50}>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-semibold text-navy pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={20}
                        className={cn(
                          "text-slate-400 transition-transform duration-300 flex-shrink-0",
                          openFaq === idx ? "rotate-180 text-teal" : "",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "transition-all duration-300",
                        openFaq === idx
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="p-6 pt-0 text-slate-600">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/how-it-works"
                className="text-teal font-semibold hover:underline inline-flex items-center gap-1"
              >
                View all FAQs <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Contact;
