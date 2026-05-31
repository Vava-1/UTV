import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

export function Contact() {
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
    <div className="min-h-screen bg-[#09090b] text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-serif">
            Get in <span className="text-amber-500">Touch</span>
          </h1>
          <p className="text-xl text-[#9a9080] max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you. Whether you have questions about our music, 
            want to collaborate, or need support, we're here to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-[#111109] border border-[#1e1a12] rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#c8c0b0] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#09090b] border border-[#1e1a12] rounded-lg px-4 py-3 text-white placeholder-[#6a6055] focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#c8c0b0] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-[#09090b] border border-[#1e1a12] rounded-lg px-4 py-3 text-white placeholder-[#6a6055] focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#c8c0b0] mb-2">
                    Subject
                  </label>
                  <select className="w-full bg-[#09090b] border border-[#1e1a12] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors">
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Need for Support</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="music">Music Related</option>
                    <option value="education">Education Programs</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#c8c0b0] mb-2">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    className="w-full bg-[#09090b] border border-[#1e1a12] rounded-lg px-4 py-3 text-white placeholder-[#6a6055] focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    placeholder="Your message..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-[#09090b] font-bold tracking-wider py-3 rounded-lg transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Contact Info */}
            <div className="bg-[#111109] border border-[#1e1a12] rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <a
                    key={index}
                    href={info.href}
                    className="flex items-center gap-4 p-4 bg-[#09090b] border border-[#1e1a12] rounded-lg hover:border-amber-500/50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                      <info.icon size={20} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-[#6a6055]">{info.label}</p>
                      <p className="text-white group-hover:text-amber-500 transition-colors">
                        {info.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-[#111109] border border-[#1e1a12] rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Connect With Us</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-[#09090b] border border-[#1e1a12] rounded-lg hover:border-amber-500/50 transition-colors group"
                  >
                    <social.icon size={20} className="text-amber-500" />
                    <span className="text-white group-hover:text-amber-500 transition-colors">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Need for Support CTA */}
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <MessageCircle size={24} className="text-amber-500" />
                <h3 className="text-xl font-bold text-white">Need for Support?</h3>
              </div>
              <p className="text-[#c8c0b0] mb-6">
                Our dedicated support team is available 24/7 to help you with any questions or issues. 
                Don't hesitate to reach out!
              </p>
              <button className="bg-amber-500 hover:bg-amber-400 text-[#09090b] font-bold tracking-wider px-6 py-3 rounded-lg transition-colors">
                Get Support
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
