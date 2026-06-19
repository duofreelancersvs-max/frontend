import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO/SEO";

const NotFound = () => {
  const navigate = useNavigate();

  // Set page title for better UX
  useEffect(() => {
    document.title = "Page Not Found | ConnectMeIndia";
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      <SEO
        title="Page Not Found | ConnectMeIndia"
        description="The page you are looking for could not be found on ConnectMeIndia."
      />
      <PublicNavbar />
      
      <main id="main-content" className="flex-1 flex items-center justify-center relative p-4 sm:p-8 overflow-hidden py-20 lg:py-24">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/5 dark:bg-teal/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        
        <div className="w-full max-w-xl">
          <div className="bg-white dark:bg-white/5 rounded-3xl shadow-xl p-8 sm:p-12 border border-slate-100 dark:border-white/10 text-center relative z-10 backdrop-blur-xl">
            {/* Animated Icon */}
            <div className="mx-auto w-24 h-24 bg-teal/10 dark:bg-teal/20 rounded-3xl flex items-center justify-center mb-8 -rotate-6 hover:rotate-0 transition-transform duration-300 shadow-inner">
              <SearchX className="w-12 h-12 text-teal drop-shadow-md" />
            </div>
            
            {/* 404 Badge */}
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-sm font-bold tracking-wider uppercase shadow-sm">
              Error 404
            </div>

            {/* Error Message */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy dark:text-white mb-4 tracking-tight">
              Page not found
            </h1>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
              We couldn't find the page you're looking for. It might have been moved, renamed, or temporarily unavailable.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto h-12 px-6 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-base transition-all rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </Button>
              
              <Link to="/" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-6 bg-teal hover:bg-teal-light text-white font-bold text-base shadow-lg shadow-teal/25 rounded-xl transition-all">
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Helper links */}
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/10">
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-4">
                Helpful Links
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold">
                <Link to="/freelancers" className="text-teal hover:text-teal-light transition-colors">
                  Find Freelancers
                </Link>
                <Link to="/projects" className="text-teal hover:text-teal-light transition-colors">
                  Find Work
                </Link>
                <Link to="/contact" className="text-teal hover:text-teal-light transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default NotFound;
