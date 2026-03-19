import React, { useContext } from 'react';
import { DisplayConfigContext } from '../DisplayConfigContext';

const ShowcaseSection = ({ sectionName, items, sectionStyle }) => {
  const displayConfig = useContext(DisplayConfigContext);
  const sectionConfig = displayConfig?.sections?.[sectionName] || { visible_fields: [], hidden_fields: [], inline_fields: [] };

  return (
    <section 
      id={sectionName} 
      data-dock-section={sectionName} 
      className="px-6 bg-slate-50 transition-all duration-300" 
      style={{ 
        ...sectionStyle,
        paddingTop: `var(--section-padding-y, 6rem)`,
        paddingBottom: `var(--section-padding-y, 6rem)`
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6 capitalize leading-tight">
              {sectionName.replace(/_/g, ' ')}
            </h2>
            <div className="h-1.5 w-32 bg-accent rounded-full mb-8"></div>
            <p className="text-xl text-slate-600 font-light">
              Digital Architecture That Scales. Een selectie van onze meest recente projecten.
            </p>
          </div>
          <div className="hidden md:block">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Scroll to explore</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item, index) => {
            const allKeys = Object.keys(item).filter(k => 
                !['absoluteIndex', '_hidden', 'id', 'pk', 'uuid'].some(tf => k.toLowerCase().includes(tf))
            );

            const visibleFields = sectionConfig.visible_fields?.length > 0 
                ? sectionConfig.visible_fields.filter(k => allKeys.includes(k))
                : allKeys.filter(k => !/foto|afbeelding|url|image|img|icon/i.test(k));

            const hiddenFields = sectionConfig.hidden_fields || [];
            const fieldsToRender = visibleFields.filter(f => !hiddenFields.includes(f));
            
            const imgKey = Object.keys(item).find(k => /foto|afbeelding|url|image|img/i.test(k));
            const linkKey = Object.keys(item).find(k => /link|url|website/i.test(k));

            return (
              <div key={index} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {imgKey && item[imgKey] && (
                    <img 
                        src={item[imgKey].startsWith('http') ? item[imgKey] : `${import.meta.env.BASE_URL}images/${item[imgKey]}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        data-dock-type="media" 
                        data-dock-bind={`${sectionName}.${index}.${imgKey}`} 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                     {linkKey && (
                        <a 
                            href={typeof item[linkKey] === 'object' ? item[linkKey].url : (item[linkKey] || "#")} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white text-primary px-6 py-2 rounded-full font-bold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                        >
                            Bekijk Project
                        </a>
                     )}
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-8 flex-1 flex flex-col">
                  {fieldsToRender.map((fk, fIdx) => {
                      const isTitle = fIdx === 0;
                      const isCategory = fk.toLowerCase().includes('cat') || fk.toLowerCase().includes('type');
                      const val = item[fk];
                      const displayText = typeof val === 'object' ? (val.text || val.label || val.title || JSON.stringify(val)) : val;
                      
                      if (isCategory) {
                        return (
                            <span key={fk} className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-3">
                                <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</span>
                            </span>
                        );
                      }

                      return (
                        <div key={fk} className={`${isTitle ? 'text-2xl font-bold text-primary mb-4 leading-tight' : 'text-slate-500 text-sm leading-relaxed mb-4 flex-1'}`}>
                            <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</span>
                        </div>
                      );
                  })}
                  
                  <div className="pt-6 border-t border-slate-50 mt-auto">
                    <button 
                        className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 group/btn"
                        onClick={() => {
                            const url = typeof item[linkKey] === 'object' ? item[linkKey].url : (item[linkKey] || "#");
                            if (url !== "#") window.open(url, '_blank');
                        }}
                    >
                        Project Details 
                        <i className="fa-solid fa-arrow-right-long transition-transform group-hover/btn:translate-x-2"></i>
                    </button>
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
