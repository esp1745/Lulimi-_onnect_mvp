import { Link } from "react-router";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import lulimiLogoWhite from "@/assets/lulimi-logo-white.png";

const linkTargets: Record<string, string> = {
  "Find a Teacher": "/teachers",
  "Browse Languages": "/teachers",
  "How It Works": "/how-it-works",
  "Pricing": "/pricing",
  "Apply to Teach": "/teacher/onboarding",
  "Resources": "/resources",
  "Community": "/community",
  "Teacher FAQ": "/teacher-faq",
  "About Us": "/about",
  "Blog": "/blog",
  "Contact": "/contact",
  "Careers": "/careers",
};

const columns = [
  {
    title: "For Learners",
    links: ["Find a Teacher", "Browse Languages", "How It Works", "Pricing"],
  },
  {
    title: "For Teachers",
    links: ["Apply to Teach", "Resources", "Community", "Teacher FAQ"],
  },
  {
    title: "Company",
    links: ["About Us", "Blog", "Contact", "Careers"],
  },
];

const socials = [Facebook, Twitter, Instagram, Linkedin];

export function Footer() {
  return (
    <footer className="bg-[#A0B76F] text-[#F5F0E8] pt-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 pb-12">
          <div>
            <img src={lulimiLogoWhite} alt="Lulimi" className="h-12 w-auto mb-4" />
            <p className="text-white/85 text-sm max-w-xs mb-5">
              Connecting learners with expert African language teachers worldwide.
            </p>
            <div className="flex gap-3">
              {socials.map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/15 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      to={linkTargets[link] ?? "/"}
                      className="text-white/85 text-sm hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/20 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/75">
          <span>© 2026 Lulimi. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/cookie" className="hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
