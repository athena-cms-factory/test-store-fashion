import React from 'react';
import * as Icons from 'lucide-react';

/**
 * Premium Footer for Karel Portfolio Ath
 */
const Footer = ({ data }) => {
  const profile = data['profile']?.[0] || {};
  const socials = data['socials'] || [];
  const siteSettings = data['site_settings']?.[0] || {};
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-40 pb-20 px-6 bg-black relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
          {/* Brand & Bio */}
          <div className="lg:col-span-2">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-10 leading-none group">
                <span className="text-white group-hover:text-blue-500 transition-colors duration-500">{siteSettings.logo_text || "Karel Decherf"}</span><span className="text-blue-500/50 group-hover:text-white transition-colors duration-500">.</span>
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed max-w-md font-light mb-12">
                {profile.bio_short || "Innovating through full-stack engineering and AI automation."}
            </p>
            <div className="flex gap-4">
              {socials.map((social, idx) => {
                const IconComponent = Icons[social.icon_name] || Icons.Share2;
                return (
                  <a 
                    key={idx} 
                    href={social.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-black hover:border-white transition-all duration-500 shadow-2xl hover:shadow-white/20"
                    title={social.platform}
                  >
                    <IconComponent size={24} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Contact & Availability */}
          <div className="flex flex-col justify-end">
            <h3 className="text-blue-500 font-black uppercase tracking-[0.4em] mb-10 text-xs sm:text-sm">Contact</h3>
            <a 
                href={`mailto:${profile.contact_email}`} 
                className="text-2xl md:text-3xl font-black uppercase tracking-tighter hover:text-blue-500 transition-colors duration-500 leading-tight mb-4"
            >
                {profile.contact_email || "Connect with me"}
            </a>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest leading-loose">
                Available for meaningful <br/> collaborations worldwide.
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-col justify-end">
            <h3 className="text-blue-500 font-black uppercase tracking-[0.4em] mb-10 text-xs sm:text-sm">Navigation</h3>
            <nav className="flex flex-col gap-4">
                {['Projects', 'Services', 'Testimonials'].map(item => (
                    <a 
                        key={item}
                        href={`#${item.toLowerCase()}`} 
                        className="text-zinc-500 hover:text-white text-sm font-black uppercase tracking-widest transition-colors duration-500"
                    >
                        {item}
                    </a>
                ))}
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 opacity-40">
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">
             &copy; {currentYear} {siteSettings.logo_text || "Karel Decherf"} &mdash; ALL RIGHTS RESERVED
           </p>
           <div className="flex items-center gap-4">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">SYSTEMS ONLINE / OPTIMIZED</p>
           </div>
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mb-40"></div>
    </footer>
  );
};

export default Footer;