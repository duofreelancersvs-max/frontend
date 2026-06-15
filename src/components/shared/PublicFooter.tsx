import { Link } from "react-router-dom";
import { Twitter, Linkedin, Instagram, Youtube, MapPin } from "lucide-react";
import Logo from "@/components/shared/Logo";

export const PublicFooter = () => {
  return (
    <footer className="bg-[#050B15] text-white pt-24 pb-12 relative overflow-hidden border-t border-white/5">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-royal-blue/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal/5 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-6 h-12 flex items-center">
              <Logo isDark={true} size="md" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The premier marketplace for creative professionals in India.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Instagram, Youtube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-teal/50 hover:bg-teal flex items-center justify-center transition-all duration-300 group"
                >
                  <Icon
                    size={18}
                    className="text-slate-300 group-hover:text-white group-hover:scale-110 transition-all"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "For Clients",
              links: [
                { label: "Find Talent", href: "/freelancers" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Pricing", href: "/pricing" },
                { label: "About Us", href: "/about" },
              ],
            },
            {
              title: "For Freelancers",
              links: [
                { label: "Create Profile", href: "/register" },
                { label: "Browse Jobs", href: "/find-work" },
                { label: "Subscription", href: "/pricing" },
                { label: "Categories", href: "/categories" },
              ],
            },
            {
              title: "Support",
              links: [
                { label: "Contact Us", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms-and-conditions" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-lg mb-6">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-slate-400 hover:text-white transition-all text-sm flex items-center gap-2 group"
                    >
                      <span className="w-0 h-px bg-teal group-hover:w-2 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 ConnectMeIndia. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-slate-500 text-sm">
            <Link
              to="/terms-and-conditions"
              className="hover:text-white transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>Made with ❤️ in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
