import React from 'react';

const ShowcaseSection = ({ items: data, sectionName }) => {
  if (!data || data.length === 0) return null;

  // We detecteren de keys op basis van de eerste site in de lijst
  const firstItem = data[0];
  const titleKey = Object.keys(firstItem).find(k => k.toLowerCase().includes('naam') || k.toLowerCase().includes('titel')) || 'naam';
  const imgKey = Object.keys(firstItem).find(k => k.toLowerCase().includes('afbeelding') || k.toLowerCase().includes('foto')) || 'foto_url';
  const textKey = Object.keys(firstItem).find(k => k.toLowerCase().includes('beschrijving') || k.toLowerCase().includes('omschrijving') || k.toLowerCase().includes('tekst')) || 'omschrijving';
  const urlKey = Object.keys(firstItem).find(k => k.toLowerCase().includes('url') || k.toLowerCase().includes('link')) || 'website_url';

  return (
    <section id="showcase" className="py-32 bg-white overflow-hidden" data-dock-section={sectionName}>
      <div className="container mx-auto px-6">
        
        <div className="max-w-3xl mb-24">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-6">Portfolio</h2>
          <h3 className="text-5xl md:text-7xl font-serif font-black text-primary leading-tight mb-8">
            Digital Architecture <br />
            <span className="text-slate-300">That Scales.</span>
          </h3>
          <p className="text-2xl text-slate-500 font-light leading-relaxed">
            Een selectie van onze meest recente projecten, variërend van razendsnelle SPA's tot complexe enterprise oplossingen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {data.map((item, index) => {
            const hasUrl = item[urlKey] && item[urlKey] !== '#';
            
            return (
              <div 
                key={index} 
                className="group flex flex-col bg-slate-50 rounded-[40px] overflow-hidden border border-slate-100 hover:border-accent/20 transition-all duration-700 hover:shadow-2xl hover:shadow-accent/5"
              >
                <a 
                  href={item[urlKey] || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="aspect-[16/10] overflow-hidden block relative"
                  onClick={(e) => { if (e.shiftKey) e.preventDefault(); }}
                >
                  <img 
                    src={(item[imgKey] || "").startsWith('http') ? item[imgKey] : `${import.meta.env.BASE_URL}images/${item[imgKey] || 'placeholder.jpg'}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    data-dock-type="media" 
                    data-dock-bind={`${sectionName}.${index}.${imgKey}`} 
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-primary/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter shadow-xl">
                      Shift + Klik voor link
                    </div>
                  </div>
                </a>

                <div className="p-12 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-3xl font-bold text-primary group-hover:text-accent transition-colors">
                      <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${titleKey}`}>{item[titleKey]}</span>
                    </h3>
                    {item.category && (
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest" data-dock-type="text" data-dock-bind={`${sectionName}.${index}.category`}>{item.category}</span>
                    )}
                  </div>

                  <div className="text-lg leading-relaxed text-slate-600 mb-8 line-clamp-3 font-light italic">
                    <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${textKey}`}>{item[textKey]}</span>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
                    {hasUrl && (
                      <a 
                        href={item[urlKey]} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-accent font-bold hover:translate-x-2 transition-transform flex items-center gap-2"
                        data-dock-type="link"
                        data-dock-bind={`${sectionName}.${index}.${urlKey}`}
                      >
                        Bezoek Website <i className="fa-solid fa-arrow-right-long"></i>
                      </a>
                    )}
                    <div className="flex gap-3 text-slate-300">
                      <i className="fa-solid fa-laptop-code text-xl"></i>
                      <i className="fa-solid fa-magnifying-glass-chart text-xl"></i>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
