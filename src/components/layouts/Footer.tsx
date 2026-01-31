import { Link } from "react-router-dom";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    clients: {
      title: "For Clients",
      links: [
        { label: "Find Talent", href: "/find-talent" },
        { label: "Post Project", href: "/post-project" },
        { label: "Enterprise Solutions", href: "/enterprise" },
        { label: "Hire Specialists", href: "/hire" },
        { label: "Success Stories", href: "/stories" },
      ],
    },
    freelancers: {
      title: "For Freelancers",
      links: [
        { label: "Find Work", href: "/find-work" },
        { label: "Create Profile", href: "/create-profile" },
        { label: "Freelancer Resources", href: "/resources" },
        { label: "Community", href: "/community" },
        { label: "Success Guide", href: "/guide" },
      ],
    },
    company: {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Contact Us", href: "/contact" },
        { label: "Trust & Safety", href: "/trust" },
      ],
    },
  };

  return (
    <footer className="bg-navy text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center text-white font-bold text-2xl">
                S
              </div>
              <span className="font-bold text-2xl tracking-tight">Stitch</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The premium marketplace matching top-tier freelance talent with
              forward-thinking companies. Quality over quantity, always.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-teal hover:text-white transition-all duration-300"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-teal hover:text-white transition-all duration-300"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-teal hover:text-white transition-all duration-300"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-teal hover:text-white transition-all duration-300"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-lg mb-6 text-slate-100">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-slate-400 hover:text-teal transition-colors text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} Stitch Marketplace. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              to="/privacy"
              className="text-slate-500 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-slate-500 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-slate-500 hover:text-white text-sm transition-colors"
            >
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
