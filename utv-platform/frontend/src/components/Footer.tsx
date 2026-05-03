import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin, Music, BookOpen, Calendar, Users } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  
  const footerSections = [
    {
      titleKey: 'header.discover',
      links: [
        { labelKey: 'header.books', path: '/music', icon: Music },
        { labelKey: 'header.books', path: '/books', icon: BookOpen },
        { labelKey: 'header.concerts', path: '/concerts', icon: Calendar },
        { labelKey: 'header.artists', path: '/artists', icon: Users },
      ]
    },
    {
      titleKey: 'footer.company',
      links: [
        { labelKey: 'footer.about', path: '/about' },
        { labelKey: 'header.contact', path: '/contact' },
        { labelKey: 'header.library', path: '/library' },
        { labelKey: 'footer.support', path: '/support' },
      ]
    },
    {
      titleKey: 'footer.legal',
      links: [
        { labelKey: 'footer.privacy', path: '/privacy' },
        { labelKey: 'footer.terms', path: '/terms' },
        { labelKey: 'footer.cookies', path: '/cookies' },
        { labelKey: 'footer.accessibility', path: '/accessibility' },
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
    <footer className="bg-[#09090b] border-t border-[#1e1a12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-500 mb-6">{t('footer.contactUs')}</h3>
            <div className="space-y-3">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.href}
                  className="flex items-center gap-3 text-[#9a9080] hover:text-amber-500 transition-colors group"
                >
                  <info.icon size={18} className="flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#6a6055]">{t(`footer.${info.label.toLowerCase()}`)}</p>
                    <p className="text-sm group-hover:text-amber-500">{info.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xl font-bold text-amber-500 mb-6">{t(section.titleKey)}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-[#9a9080] hover:text-amber-500 transition-colors"
                    >
                      {'icon' in link && link.icon && <link.icon size={16} />}
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Newsletter */}
        <div className="mt-12 pt-8 border-t border-[#1e1a12]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Social Media Links */}
            <div className="flex items-center gap-6">
              <span className="text-sm text-[#6a6055]">{t('footer.followUs')}</span>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#111109] border border-[#1e1a12] rounded-full flex items-center justify-center text-[#9a9080] hover:text-amber-500 hover:border-amber-500 transition-all"
                    aria-label={social.name}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#6a6055]">{t('footer.newsletter')}</span>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t('footer.email')}
                  className="px-4 py-2 bg-[#111109] border border-[#1e1a12] rounded text-white placeholder-[#6a6055] focus:outline-none focus:border-amber-500"
                />
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#09090b] font-bold rounded transition-colors">
                  {t('footer.subscribe', 'Subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-[#1e1a12] text-center">
          <p className="text-sm text-[#6a6055]">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
