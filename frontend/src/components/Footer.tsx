import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  const footerSections = [
    {
      title: t('footer.explore'),
      links: [
        { label: t('nav.home'), path: '/' },
        { label: t('nav.videos'), path: '/videos' },
        { label: t('nav.audios'), path: '/music' },
        { label: t('nav.sheets'), path: '/scores' },
        { label: t('nav.events'), path: '/concerts' },
        { label: t('nav.books'), path: '/books' },
        { label: t('nav.about'), path: '/about' },
      ]
    },
    {
      title: t('footer.more'),
      links: [
        { label: t('nav.discover'), path: '/discover' },
        { label: t('nav.contact'), path: '/contact' },
      ]
    },
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: 'https://facebook.com/unatantumvoce' },
    { icon: Twitter, name: 'Twitter', url: 'https://twitter.com/unatantumvoce' },
    { icon: Instagram, name: 'Instagram', url: 'https://instagram.com/unatantumvoce' },
    { icon: Youtube, name: 'YouTube', url: 'https://www.youtube.com/@UNATANTUMVOCEOFFICIAL' },
    { icon: Linkedin, name: 'LinkedIn', url: 'https://linkedin.com/company/unatantumvoce' },
  ];

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'info@unatantumvoce.com', href: 'mailto:info@unatantumvoce.com' },
    { icon: Phone, label: 'Phone', value: '+250 788 123 456', href: 'tel:+250788123456' },
    { icon: MapPin, label: 'Address', value: 'Kigali, Rwanda', href: '#' },
  ];

  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand + Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="UTV Logo"
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div>
                <h3 className="text-lg font-bold tracking-tight font-serif">UNA TANTUM VOCE</h3>
                <p className="text-xs text-blue-300 tracking-widest uppercase">{t('footer.musicForAll')}</p>
              </div>
            </div>
            <div className="space-y-2">
              {contactInfo.map((info, i) => (
                <a
                  key={i}
                  href={info.href}
                  className="flex items-center gap-2 text-blue-200 hover:text-yellow-400 transition-colors text-sm"
                >
                  <info.icon size={14} className="text-yellow-400" />
                  {info.value}
                </a>
              ))}
            </div>
          </div>

          {/* Nav sections */}
          {footerSections.map((section, i) => (
            <div key={i} className="space-y-3">
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      to={link.path}
                      className="text-blue-200 hover:text-yellow-400 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">
              {t('common.followUs')}
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-blue-800 hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-all group"
                  aria-label={social.name}
                >
                  <social.icon size={16} className="text-blue-200 group-hover:text-blue-900 transition-colors" />
                </a>
              ))}
            </div>
            <div className="pt-4">
              <p className="text-xs text-blue-300 mb-2">{t('common.newsletter')}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t('common.yourEmail')}
                  className="flex-1 px-3 py-2 bg-blue-800 border border-blue-700 rounded-lg text-white placeholder-blue-400 text-sm focus:outline-none focus:border-yellow-400"
                />
                <button className="px-4 py-2 bg-yellow-400 text-blue-900 text-sm font-bold rounded-lg hover:bg-yellow-500 transition-colors">
                  {t('common.subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-blue-800 text-center">
          <p className="text-blue-300 text-sm">
            {t('footer.rights')} | {t('footer.rightsTagline')}
          </p>
        </div>
      </div>
    </footer>
  );
}
