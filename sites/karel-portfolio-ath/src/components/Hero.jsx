import React from 'react';
import { getImageUrl } from '../utils/paths';

const Hero = ({ profile }) => {
  return (
    <section className="relative pt-40 pb-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-blue-500 font-black uppercase tracking-[0.4em] mb-6 text-xs sm:text-sm">
            <span data-dock-type="text" data-dock-bind="profile.0.professional_title">{profile.professional_title || "Full Stack Developer"}</span>
          </h2>
          
          <h1 className="text-6xl md:text-9xl font-black mb-8 leading-[0.85] tracking-tighter uppercase">
            <span data-dock-type="text" data-dock-bind="profile.0.full_name">{profile.full_name || "KAREL DECHERF"}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl leading-relaxed font-light">
            <span data-dock-type="text" data-dock-bind="profile.0.tagline">{profile.tagline || "Innovating through code."}</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
            <a 
              href={`mailto:${profile.contact_email}`}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-sm rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/20"
              data-dock-type="link"
              data-dock-bind="profile.0.cta_text"
            >
              {profile.cta_text || "Let's Talk"}
            </a>
            <a 
              href="#projects"
              className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm rounded-full transition-all border border-white/10 hover:border-white/20 backdrop-blur-md"
            >
              View Work
            </a>
          </div>
        </div>

        {profile.avatar_url && (
            <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-[60px] blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[60px] overflow-hidden border border-white/10 rotate-3 group-hover:rotate-0 transition-transform duration-700">
                    <img 
                        src={getImageUrl(profile.avatar_url)} 
                        alt={profile.full_name}
                        className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                        data-dock-type="media"
                        data-dock-bind="profile.0.avatar_url"
                    />
                </div>
            </div>
        )}
      </div>

      {/* Aesthetic Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black text-white/[0.03] whitespace-nowrap pointer-events-none select-none -z-0">
        STRATEGIST
      </div>
      
      {/* Subtle Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
    </section>
  );
};

export default Hero;