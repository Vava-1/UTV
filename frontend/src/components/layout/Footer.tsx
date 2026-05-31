import { Link } from "react-router-dom";
import { Music, BookOpen, Calendar, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-utv-bg-light border-t border-utv-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-utv-gold flex items-center justify-center">
                <span className="text-utv-bg font-bold text-sm">U</span>
              </div>
              <span className="font-display text-lg font-bold text-utv-cream">
                UNA TANTUM VOCE
              </span>
            </div>
            <p className="text-sm text-utv-body leading-relaxed">
              One Voice, One Time. Discover classical and gospel music, philosophical literature, and cultural events.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-utv-cream font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/music" className="text-sm text-utv-body hover:text-utv-gold transition-colors flex items-center gap-2">
                  <Music className="w-4 h-4" /> Music Library
                </Link>
              </li>
              <li>
                <Link to="/books" className="text-sm text-utv-body hover:text-utv-gold transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Bookstore
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-utv-body hover:text-utv-gold transition-colors flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-utv-cream font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-sm text-utv-body hover:text-utv-gold transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-utv-body hover:text-utv-gold transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-utv-body hover:text-utv-gold transition-colors">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-utv-cream font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-utv-body mb-3">Stay updated with our latest releases and events.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-utv-bg border border-utv-border rounded-md px-3 py-2 text-sm text-utv-cream placeholder:text-utv-body/50 focus:outline-none focus:border-utv-gold"
              />
              <button className="bg-utv-gold text-utv-bg px-3 py-2 rounded-md hover:bg-utv-gold/90 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-utv-border mt-8 pt-6 text-center text-sm text-utv-body">
          <p> 2024 Una Tantum Voce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
