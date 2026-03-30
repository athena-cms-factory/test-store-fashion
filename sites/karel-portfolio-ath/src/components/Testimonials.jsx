import React from 'react';
import RepeaterControls from './RepeaterControls';
import { getImageUrl } from '../utils/paths';

/**
 * Trust & Testimonials mapping to 'testimonials.json'
 */
const Testimonials = ({ testimonials }) => {
  return (
    <section id="testimonials" className="py-40 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-32">
            <h2 className="text-blue-500 font-black uppercase tracking-[0.4em] mb-6 text-sm">Trust</h2>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                Shared Success <span className="text-zinc-800">& Results</span>
            </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="relative group p-16 bg-white/[0.02] rounded-[60px] border border-white/5 hover:bg-white/[0.04] transition-all duration-700">
              <RepeaterControls file="testimonials" index={idx} isHidden={testimonial.hidden} />
              
              {/* Quote Mark */}
              <div className="text-blue-500/20 text-9xl font-serif absolute top-10 right-16 pointer-events-none select-none italic leading-none">
                "
              </div>
              
              <p className="text-2xl md:text-3xl font-light italic text-zinc-300 mb-16 leading-relaxed relative z-10">
                <span data-dock-type="text" data-dock-bind={`testimonials.${idx}.quote`}>{testimonial.quote}</span>
              </p>

              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-blue-500 transition-colors duration-500">
                  <img 
                    src={getImageUrl(testimonial.image_url)} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    data-dock-type="media"
                    data-dock-bind={`testimonials.${idx}.image_url`}
                  />
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase tracking-tighter mb-1">
                    <span data-dock-type="text" data-dock-bind={`testimonials.${idx}.name`}>{testimonial.name}</span>
                  </h4>
                  <p className="text-blue-500 text-xs font-black uppercase tracking-widest opacity-80">
                    <span data-dock-type="text" data-dock-bind={`testimonials.${idx}.role`}>{testimonial.role}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
