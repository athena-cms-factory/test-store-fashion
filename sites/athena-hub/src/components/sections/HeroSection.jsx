import React from 'react';

const HeroSection = ({ items: data, sectionName, siteSettings }) => {
  if (!data || data.length === 0) return null;
  const hero = data[0];
  const settings = siteSettings || {};

  // v8.8 Hub-specifieke herstelactie
  const heroTitle = hero.title || settings.site_name || 'Athena Hub';
  const heroSubtitle = hero.subtitle || settings.tagline || '';
  const rawImg = hero.image || 'hero-athenahub-1-1770366162431.webp';
  const imgSrc = (rawImg || "").startsWith('http') ? rawImg : `${import.meta.env.BASE_URL}images/${rawImg}`;

  const handleScroll = (e) => {
    if (e.shiftKey) return;
    const url = (hero.cta && hero.cta.url) ? hero.cta.url : "#showcase";
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
          data-dock-bind={`${sectionName}.0.image`} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/90 z-10"></div>
      </div>

      <div className="relative z-20 text-center px-6 max-w-5xl">
        <h1 className="text-6xl md:text-9xl font-serif font-black text-white mb-8 leading-tight drop-shadow-2xl">
          <span data-dock-type="text" data-dock-bind={`${sectionName}.0.title`}>{heroTitle}</span>
        </h1>
        
        <p className="text-xl md:text-3xl text-white/80 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-light italic mb-12">
          <span data-dock-type="text" data-dock-bind={`${sectionName}.0.subtitle`}>{heroSubtitle}</span>
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <button 
            onClick={handleScroll} 
            className="bg-accent text-primary px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-all"
            data-dock-type="link" 
            data-dock-bind={`${sectionName}.0.cta_text`}
          >
            {hero.cta_text || (hero.cta && hero.cta.label) || "Ontdek Meer"}
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
