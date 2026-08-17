import { SEO } from '@/components/SEO/SEO';
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import PublicMain from "@/components/shared/PublicMain";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const useInView = (options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold: 0.1, ...options },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isInView };
};

const AnimatedSection = ({
  children, className = "", delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={cn("transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Getting Started",
    question: "What is ConnectMeIndia?",
    answer: "ConnectMeIndia is a freelance marketplace platform connecting Indian clients with talented freelancers across creative, technology, and professional service categories. We focus on verified professionals, secure collaboration, and a 0% commission model for freelancers.",
  },
  {
    category: "Getting Started",
    question: "How do I create an account on ConnectMeIndia?",
    answer: "Creating an account is free and simple. Click the 'Register' button on our homepage, choose whether you're a client or freelancer, fill in your details, and verify your email. Freelancers can then complete their profile with skills, portfolio, and experience to start receiving project invitations.",
  },
  {
    category: "Getting Started",
    question: "Is ConnectMeIndia free to use?",
    answer: "Yes, creating an account and browsing is free for both clients and freelancers. We operate on a freemium model — freelancers can access basic features for free, while our Pro subscription unlocks premium features like priority listing, advanced analytics, and direct client outreach. There is zero commission on earnings.",
  },
  {
    category: "For Freelancers",
    question: "How do I get my first project?",
    answer: "Start by completing your profile with a professional photo, detailed bio, portfolio samples, and relevant skills. Browse available projects and submit tailored proposals. Focus on writing personalized proposals that address the client's specific needs. Building a strong portfolio and collecting positive reviews will help you win more projects over time.",
  },
  {
    category: "For Freelancers",
    question: "How much can I earn as a freelancer on ConnectMeIndia?",
    answer: "Earnings vary based on your skills, experience, and the types of projects you take on. Indian freelancers on platforms typically earn between ₹15,000 to ₹2,00,000+ per month. Specialized skills like video editing, VFX, web development, and UI/UX design command higher rates. Our platform charges zero commission, so you keep 100% of your earnings.",
  },
  {
    category: "For Freelancers",
    question: "What is the Pro subscription?",
    answer: "The Pro subscription is a premium plan for freelancers that unlocks advanced features including priority placement in search results, detailed analytics, advanced portfolio customization, direct client messaging, and highlighted profiles. It's designed to help serious freelancers grow their business faster.",
  },
  {
    category: "For Clients",
    question: "How do I post a project?",
    answer: "Click 'Post Project' from your client dashboard. Provide a clear title, detailed description of your requirements, your budget range, preferred timeline, and relevant category/skills. The more detailed your brief, the better proposals you'll receive. You can also attach reference files to help freelancers understand your vision.",
  },
  {
    category: "For Clients",
    question: "How do I hire a freelancer?",
    answer: "Browse our freelancer directory using filters for skills, category, ratings, and budget. Review profiles, portfolios, and client reviews. When you find a suitable freelancer, either invite them to your project or accept their proposal. Use our built-in messaging to discuss project details before committing.",
  },
  {
    category: "For Clients",
    question: "Is my payment secure?",
    answer: "Yes. We use Razorpay for secure payment processing. Payments are held in escrow and released to the freelancer upon your approval of the delivered work. This protects both parties — freelancers are assured of payment, and clients only pay for work that meets their standards.",
  },
  {
    category: "Payments",
    question: "What payment methods are accepted?",
    answer: "We accept UPI, net banking, credit/debit cards, and wallets through our Razorpay integration. All transactions are encrypted and PCI-DSS compliant. For enterprise clients, we also support bank transfers and invoice-based payments.",
  },
  {
    category: "Payments",
    question: "When do I receive my payment?",
    answer: "Freelancers receive payment within 2-3 business days after the client approves the delivered work. For milestone-based projects, payment is released for each milestone upon approval. There are no hidden fees — what the client pays is what the freelancer receives.",
  },
  {
    category: "Trust & Safety",
    question: "How are freelancers verified?",
    answer: "We have a rigorous verification process that includes identity verification (Aadhaar/PAN), skill assessment tests, portfolio review, and background checks. Verified freelancers receive a badge on their profile, giving clients added confidence. We also maintain a rating and review system for ongoing quality assurance.",
  },
  {
    category: "Trust & Safety",
    question: "What if there's a dispute between client and freelancer?",
    answer: "We have a dedicated dispute resolution team. If issues arise, either party can raise a dispute through the platform. Our team reviews the project communication, deliverables, and contract terms to reach a fair resolution. We encourage clear communication and detailed contracts to prevent disputes in the first place.",
  },
  {
    category: "Trust & Safety",
    question: "How do I report a suspicious user?",
    answer: "Click the 'Report' button on any user's profile or message. You can also contact our support team directly at support@connectmeindia.in. We take all reports seriously and investigate promptly. Accounts found violating our terms are suspended or permanently banned.",
  },
  {
    category: "Platform",
    question: "What categories of services are available?",
    answer: "ConnectMeIndia covers a wide range of categories including Video Editing, VFX & Motion Graphics, 3D Design & Animation, Web Development, App Development, Graphic Design, UI/UX Design, Photography, Digital Marketing, Content Writing, CA & Accounting, and more. We're continuously adding new categories based on market demand.",
  },
  {
    category: "Platform",
    question: "Can I use ConnectMeIndia on my phone?",
    answer: "Yes! ConnectMeIndia is fully mobile-responsive and works great on smartphones and tablets. We also offer a Progressive Web App (PWA) that you can install on your home screen for a native app-like experience. You can manage projects, send messages, and track progress from anywhere.",
  },
];

const categories = [...new Set(faqData.map((f) => f.category))];

const FAQItem = ({ item, index }: { item: FAQItem; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnimatedSection delay={index * 50}>
      <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-transparent dark:glass-card shadow-sm dark:shadow-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <span className="font-semibold text-navy dark:text-white text-base">{item.question}</span>
          <ChevronDown
            size={20}
            className={cn("text-slate-400 shrink-0 transition-transform duration-300", isOpen && "rotate-180 text-teal")}
          />
        </button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-white/5 pt-4">
            {item.answer}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredFAQs = activeCategory === "All"
    ? faqData
    : faqData.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <SEO title="FAQ | ConnectMeIndia" description="Frequently asked questions about ConnectMeIndia. Find answers about freelancing, payments, verification, and using our platform." canonical="/faq" />
      <PublicNavbar dark />
      <PublicMain>

        {/* Hero */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-teal/5 dark:bg-teal/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <AnimatedSection>
              <div className="max-w-3xl text-center mx-auto">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-sm font-bold text-teal dark:text-teal-light mb-6 uppercase tracking-widest">
                  <HelpCircle size={16} />
                  Help Center
                </span>
                <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6 text-navy dark:text-white">
                  Frequently Asked{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">
                    Questions
                  </span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400">
                  Find answers to common questions about using ConnectMeIndia.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-6 bg-white dark:bg-white/5 border-b border-slate-100 dark:border-white/5 sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-background/90">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
              <button
                onClick={() => setActiveCategory("All")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                  activeCategory === "All"
                    ? "bg-teal text-white shadow-lg shadow-teal/20"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                )}
              >
                All Questions
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                    activeCategory === cat
                      ? "bg-teal text-white shadow-lg shadow-teal/20"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ List */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-4">
              {filteredFAQs.map((item, idx) => (
                <FAQItem key={item.question} item={item} index={idx} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-white dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <AnimatedSection>
              <div className="max-w-2xl mx-auto space-y-6">
                <MessageSquare className="mx-auto text-teal" size={40} />
                <h2 className="text-3xl font-bold text-navy dark:text-white">Still Have Questions?</h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Our support team is here to help. Reach out and we'll get back to you within 24 hours.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-teal hover:bg-[#128a7f] text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-teal/20"
                >
                  Contact Support
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

      </PublicMain>
      <PublicFooter />
    </div>
  );
};

export default FAQ;
