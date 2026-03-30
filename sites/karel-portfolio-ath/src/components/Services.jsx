import React from 'react';
import * as Icons from 'lucide-react';
import RepeaterControls from './RepeaterControls';

/**
 * Capabilities Section mapping to 'services.json'
 */
const Services = ({ services }) => {
  return (
    <section id="services" className="py-40 px-6 bg-zinc-900/40 rounded-[80px] mx-4 border border-white/5 backdrop-blur-3xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none -mr-48 -mt-48"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-blue-500 font-black uppercase tracking-[0.4em] mb-6 text-sm">Capabilities</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                Expertise Developed Over <span className="text-blue-500/50">Decades</span>
            </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, idx) => {
            const IconComponent = Icons[service.icon_name] || Icons.Zap;
            return (
              <div key={idx} className="relative group h-full">
                <RepeaterControls file="services" index={idx} isHidden={service.hidden} />
                <div className="p-12 bg-black/60 rounded-[50px] border border-white/5 hover:border-blue-500/20 transition-all h-full hover:shadow-2xl hover:shadow-blue-500/5">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-10 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    <IconComponent size={32} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">
                    <span data-dock-type="text" data-dock-bind={`services.${idx}.title`}>{service.title || "Innovation"}</span>
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-8 flex-1">
                    <span data-dock-type="text" data-dock-bind={`services.${idx}.description`}>{service.description || "Building future-proof solutions through deep technical engineering."}</span>
                  </p>
                  
                  <div className="h-1 w-0 bg-blue-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
