import React from 'react';

const HeroSection = ({ items: data, sectionName, siteSettings }) => {
  if (!data || data.length === 0) return null;
  const hero = data[0];
  const settings = siteSettings || {};

  const heroTitle = hero.titel || hero.hero_header || settings.site_name || 'Athena Hub';
  const heroSubtitle = hero.ondertitel || hero.introductie || hero.hero_sub_tekst || '';
  const imgKey = Object.keys(hero).find(k => k.toLowerCase().includes('afbeelding') || k.toLowerCase().includes('foto')) || 'hero_afbeelding';
  const rawImg = hero[imgKey] || '';
  const imgSrc = (rawImg || "").startsWith('http') ? rawImg : `${import.meta.env.BASE_URL}images/${rawImg || 'placeholder.jpg'}`;

  const handleScroll = (e) => {
    if (e.shiftKey) return;
    const url = hero.cta_url || "#showcase";
    if ((url || "").startsWith('#')) {
      e.preventDefault();
      const target = document.getElementById(url.substring(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-primary" data-dock-section={sectionName}>
      <div className="absolute inset-0 z-0">
        <img 
          src={imgSrc} 
          className="w-full h-full object-cover object-top" 
          data-dock-type="media" 
          data-dock-bind={`${sectionName}.0.${imgKey}`} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/90 z-10"></div>
      </div>

      <div className="relative z-20 text-center px-6 max-w-5xl">
        <h1 className="text-6xl md:text-9xl font-serif font-black text-white mb-8 leading-tight drop-shadow-2xl">
          <span data-dock-type="text" data-dock-bind={`${sectionName}.0.titel`}>{heroTitle}</span>
        </h1>
        
        <p className="text-xl md:text-3xl text-white/80 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-light italic mb-12">
          <span data-dock-type="text" data-dock-bind={`${sectionName}.0.ondertitel`}>{heroSubtitle}</span>
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <button 
            onClick={handleScroll} 
            className="bg-accent text-primary px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-all"
            data-dock-type="link" 
            data-dock-bind={`${sectionName}.0.cta_label`}
          >
            {hero.cta_label || "Ontdek Meer"}
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/30 text-4xl">
        <i className="fa-solid fa-chevron-down"></i>
      </div>
    </section>
  );
};

export default HeroSection;
