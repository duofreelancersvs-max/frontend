import { SEO } from '@/components/SEO/SEO';
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import PublicMain from "@/components/shared/PublicMain";
import { AdUnit } from "@/components/shared/AdUnit";
import { Clock, ArrowRight, Search, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { blogPosts } from "@/data/blog-posts";

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

const categories = ["All", "Getting Started", "Business Tips", "Video Editing", "Marketing", "Finance", "Industry Trends", "Lifestyle"];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <SEO title="Blog | ConnectMeIndia" description="Insights, guides, and tips for freelancers in India. Learn about pricing, portfolios, client management, and growing your freelance career." canonical="/blog" />
      <PublicNavbar dark />
      <PublicMain>

        {/* Hero */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03] dark:opacity-[0.08]" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal/5 dark:bg-teal/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <AnimatedSection>
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-sm font-bold text-teal dark:text-teal-light mb-6 uppercase tracking-widest">
                  Our Blog
                </span>
                <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6 text-navy dark:text-white">
                  Freelancing{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">
                    Insights & Guides
                  </span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                  Practical advice, industry trends, and expert tips to help you build a successful freelance career in India.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-white dark:bg-white/5 border-b border-slate-100 dark:border-white/5 sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-background/90">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                      selectedCategory === cat
                        ? "bg-teal text-white shadow-lg shadow-teal/20"
                        : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-72">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-sm focus:outline-none focus:border-teal text-navy dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-slate-500 dark:text-slate-400">No articles found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, idx) => (
                  <AnimatedSection key={post.slug} delay={idx * 80}>
                    <Link to={`/blog/${post.slug}`} className="group block h-full">
                      <article className="bg-white dark:bg-transparent dark:glass-card rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden h-full flex flex-col hover:-translate-y-1 hover:shadow-xl dark:hover:bg-white/5 transition-all duration-300 shadow-sm dark:shadow-none">
                        <div className="p-8 flex-1 flex flex-col">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal/10 dark:bg-teal/20 text-teal dark:text-teal-light text-xs font-bold rounded-full">
                              <Tag size={12} />
                              {post.category}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-navy dark:text-white mb-3 group-hover:text-teal dark:group-hover:text-teal-light transition-colors leading-tight">
                            {post.title}
                          </h2>
                          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {post.readTime}
                              </span>
                            </div>
                            <ArrowRight size={18} className="text-teal group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Ad */}
        <div className="bg-white dark:bg-background py-4">
          <div className="container mx-auto px-4 lg:px-8">
            <AdUnit adSlot="5278637556" format="auto" />
          </div>
        </div>

      </PublicMain>
      <PublicFooter />
    </div>
  );
};

export default Blog;
