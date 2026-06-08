import { Link } from "react-router-dom";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";
import Logo from "@/components/shared/Logo";

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
            <Logo isDark size="md" />
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The premier marketplace for creative professionals in India.
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
            © {currentYear} ConnectMeIndia. All rights reserved.
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
