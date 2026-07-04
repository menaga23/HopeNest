import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-hn-dark text-hn-secondary/90 transition-colors duration-300 pt-16 pb-8 border-t border-hn-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-hn-primary p-1.5 rounded-full text-hn-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <span className="font-serif text-xl font-bold tracking-wide text-hn-primary">
                HopeNest
              </span>
            </div>
            <p className="text-sm leading-relaxed text-hn-secondary/70 italic">
              "Every child deserves a home, every heart deserves a purpose."
            </p>
            <p className="text-xs text-hn-secondary/50 leading-relaxed">
              HopeNest is a unified platform bridge connecting generous donors, volunteers, and adoptive families directly with verified orphanages.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-hn-white tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-hn-secondary/80">
              <li>
                <Link to="/orphanages" className="hover:text-hn-primary transition-colors">Find Orphanages</Link>
              </li>
              <li>
                <Link to="/children" className="hover:text-hn-primary transition-colors">Sponsor or Adopt</Link>
              </li>
              <li>
                <Link to="/volunteer" className="hover:text-hn-primary transition-colors">Volunteer Schedule</Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-hn-primary transition-colors">Platform Impact</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-hn-white tracking-wide">
              Reach Us
            </h3>
            <ul className="space-y-2 text-sm text-hn-secondary/80">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-hn-primary shrink-0" />
                <span>+91 22 2640 9876</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-hn-primary shrink-0" />
                <span>support@hopenest.org</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-hn-primary shrink-0" />
                <span>Bandra West, Mumbai, MH, India</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Social */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-hn-white tracking-wide">
              Connect With Us
            </h3>
            <p className="text-xs text-hn-secondary/70">
              Follow our journey of hope and read heartwarming stories of rehabilitation.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-full bg-hn-dark/60 hover:bg-hn-primary hover:text-hn-white transition-all hover:-translate-y-0.5 border border-hn-secondary/25" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-hn-dark/60 hover:bg-hn-primary hover:text-hn-white transition-all hover:-translate-y-0.5 border border-hn-secondary/25" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-hn-dark/60 hover:bg-hn-primary hover:text-hn-white transition-all hover:-translate-y-0.5 border border-hn-secondary/25" aria-label="Github">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-hn-dark/60 hover:bg-hn-primary hover:text-hn-white transition-all hover:-translate-y-0.5 border border-hn-secondary/25" aria-label="Globe">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright block */}
        <div className="pt-8 border-t border-hn-secondary/10 flex flex-col md:flex-row justify-between items-center text-xs text-hn-secondary/50">
          <p>© {new Date().getFullYear()} HopeNest Foundation. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">F.A.Q.</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
