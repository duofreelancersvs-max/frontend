import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

const COOKIE_KEY = "connectmeindia_cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 bg-teal/10 dark:bg-teal/20 rounded-xl flex items-center justify-center shrink-0">
            <Cookie className="text-teal" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-navy dark:text-white text-lg mb-1">
              We Value Your Privacy
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
              <Link to="/privacy-policy" className="text-teal hover:underline font-medium">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={decline}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-teal hover:bg-[#128a7f] text-white text-sm font-semibold transition-colors shadow-lg shadow-teal/20"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
