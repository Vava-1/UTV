import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin, Music, BookOpen, Calendar, Users } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  
  const footerSections = [
    {
      title: 'Navigation',
      links: [
        { label: 'Discover', path: '/discover', icon: Music },
        { label: 'Books', path: '/books', icon: BookOpen },
        { label: 'Concerts', path: '/concerts', icon: Calendar },
        { label: 'Artists', path: '/artists', icon: Users },
        { label: 'Library', path: '/library', icon: Music },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
        { label: 'Support', path: '/support' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Cookie Policy', path: '/cookies' },
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: 'https://facebook.com/unatantumvoce' },
    { icon: Twitter, name: 'Twitter', url: 'https://twitter.com/unatantumvoce' },
    { icon: Instagram, name: 'Instagram', url: 'https://instagram.com/unatantumvoce' },
    { icon: Youtube, name: 'YouTube', url: 'https://youtube.com/unatantumvoce' },
    { icon: Linkedin, name: 'LinkedIn', url: 'https://linkedin.com/company/unatantumvoce' },
  ];

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'info@unatantumvoce.com', href: 'mailto:info@unatantumvoce.com' },
    { icon: Phone, label: 'Phone', value: '+250 788 123 456', href: 'tel:+250788123456' },
    { icon: MapPin, label: 'Address', value: 'Kigali, Rwanda', href: '#' },
  ];

  return (
    <footer className="bg-[#09090b] border-t border-[#1e1a12]/50 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Contact Information - Professional Design */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-amber-500 mb-4 sm:mb-6">Contact Us</h3>
            <div className="space-y-3">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.href}
                  className="flex items-center gap-3 text-[#9a9080] hover:text-amber-500 transition-all duration-300 group p-3 rounded-lg hover:bg-[#1a1813]/20"
                >
                  <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <info.icon size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6a6055] font-medium">{info.label}</p>
                    <p className="text-sm group-hover:text-amber-500 transition-colors">{info.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Sections - Professional Design */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-amber-500 mb-4 sm:mb-6">{section.title}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-[#9a9080] hover:text-amber-500 transition-all duration-300 p-2 rounded-md hover:bg-[#1a1813]/20"
                    >
                      {'icon' in link && (
                        <div className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <link.icon size={14} className="text-amber-500" />
                        </div>
                      )}
                      <span className="text-sm sm:text-base">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Newsletter - Professional Design */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#1e1a12]/50">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8">
            
            {/* Social Media Links */}
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-xs sm:text-sm text-[#6a6055] font-medium">Follow Us</span>
              <div className="flex gap-2 sm:gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-[#111109]/60 border border-[#1e1a12]/30 rounded-full flex items-center justify-center text-[#9a9080] hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all duration-300 group"
                    aria-label={social.name}
                  >
                    <social.icon size={14} className="sm:size-16" />
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-[#6a6055] font-medium">Newsletter</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 sm:flex-none px-3 py-2 bg-[#111109]/60 border border-[#1e1a12]/30 rounded-lg text-white placeholder-[#6a6055]/70 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                />
                <button className="px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#09090b] text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 rounded-lg shadow-md hover:shadow-lg">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[#1e1a12]/30 text-center">
          <p className="text-xs sm:text-sm text-[#6a6055]/80 leading-relaxed">
            © 2024 UNA TANTUM VOCE. All rights reserved. | Music Development For All
          </p>
        </div>
      </div>
    </footer>
  );
}
