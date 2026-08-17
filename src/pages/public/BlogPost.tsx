import { SEO } from '@/components/SEO/SEO';
import { useParams, Link } from "react-router-dom";
import { Clock, ArrowLeft, Tag, User } from "lucide-react";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import PublicMain from "@/components/shared/PublicMain";
import { AdUnit } from "@/components/shared/AdUnit";
import { blogPosts } from "@/data/blog-posts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white">
        <PublicNavbar dark />
        <PublicMain>
          <div className="container mx-auto px-4 py-32 text-center">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">The article you're looking for doesn't exist.</p>
            <Link to="/blog" className="inline-flex items-center gap-2 text-teal hover:underline font-semibold">
              <ArrowLeft size={18} /> Back to Blog
            </Link>
          </div>
        </PublicMain>
        <PublicFooter />
      </div>
    );
  }

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);
  if (relatedPosts.length < 3) {
    const more = blogPosts
      .filter((p) => p.slug !== slug && p.category !== post.category)
      .slice(0, 3 - relatedPosts.length);
    relatedPosts.push(...more);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <SEO
        title={`${post.title} | ConnectMeIndia Blog`}
        description={post.excerpt}
        canonical={`/blog/${post.slug}`}
      />
      <PublicNavbar dark />
      <PublicMain>

        {/* Article Header */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-teal/5 dark:bg-teal/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto">
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-teal hover:underline font-semibold mb-8">
                <ArrowLeft size={16} /> Back to Blog
              </Link>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal/10 dark:bg-teal/20 text-teal dark:text-teal-light text-xs font-bold rounded-full">
                  <Tag size={12} />
                  {post.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 text-navy dark:text-white">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <User size={16} className="text-teal" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-teal" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div
                className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-navy dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-strong:text-navy dark:prose-strong:text-white prose-a:text-teal hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>
        </section>

        {/* Ad */}
        <div className="bg-white dark:bg-background py-4">
          <div className="container mx-auto px-4 lg:px-8">
            <AdUnit adSlot="2819995173" format="auto" />
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 md:py-24 bg-white dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
            <div className="container mx-auto px-4 lg:px-8">
              <h2 className="text-3xl font-bold mb-12 text-navy dark:text-white text-center">More Articles</h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group block">
                    <article className="bg-slate-50 dark:bg-transparent dark:glass-card rounded-2xl border border-slate-100 dark:border-white/5 p-6 h-full hover:-translate-y-1 hover:shadow-lg transition-all">
                      <span className="text-xs font-bold text-teal uppercase tracking-wider">{rp.category}</span>
                      <h3 className="text-lg font-bold mt-2 mb-3 text-navy dark:text-white group-hover:text-teal transition-colors line-clamp-2">{rp.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{rp.excerpt}</p>
                      <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
                        <Clock size={14} />
                        {rp.readTime}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      </PublicMain>
      <PublicFooter />

      <style>{`
        .prose ul { list-style-type: disc; padding-left: 1.5em; }
        .prose ol { list-style-type: decimal; padding-left: 1.5em; }
        .prose li { margin-bottom: 0.5em; }
        .prose h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2em; margin-bottom: 0.75em; }
        .prose h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
        .prose p { margin-bottom: 1.25em; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default BlogPost;
