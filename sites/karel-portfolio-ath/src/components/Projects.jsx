import React from 'react';
import RepeaterControls from './RepeaterControls';
import { getImageUrl } from '../utils/paths';

/**
 * Featured Work Section mapping to 'projects.json'
 */
const Projects = ({ projects }) => {
  return (
    <section id="projects" className="py-40 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
          <div className="max-w-3xl">
            <h2 className="text-blue-500 font-black uppercase tracking-[0.4em] mb-6 text-sm">Selected Work</h2>
            <h3 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                Digital <span className="text-zinc-800">Crafsmanship</span> <br/>
                & AI <span className="text-blue-500">Execution</span>
            </h3>
          </div>
          <p className="text-zinc-500 max-w-sm text-sm uppercase font-bold tracking-[0.2em] leading-relaxed opacity-70">
            A curated selection of platforms, automation tools, and full-stack architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {projects.map((project, idx) => (
            <div key={idx} className="group relative">
              <RepeaterControls file="projects" index={idx} isHidden={project.hidden} />
              
              <div className="relative aspect-[16/11] rounded-[60px] overflow-hidden bg-zinc-900 border border-white/5 mb-10 shadow-2xl shadow-black">
                <img 
                    src={getImageUrl(project.image_url)} 
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out" 
                    data-dock-type="media" 
                    data-dock-bind={`projects.${idx}.image_url`}
                    alt={project.title}
                />
                
                {/* Floating Category Tag */}
                <div className="absolute top-8 left-8">
                  <span className="px-6 py-3 bg-black/60 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-white/10 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                    <span data-dock-type="text" data-dock-bind={`projects.${idx}.category`}>{project.category || "Development"}</span>
                  </span>
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              </div>

              <div className="flex justify-between items-start gap-8 px-4">
                <div className="flex-1">
                  <h4 className="text-4xl font-black uppercase tracking-tighter mb-4 group-hover:text-blue-500 transition-colors duration-500">
                    <span data-dock-type="text" data-dock-bind={`projects.${idx}.title`}>{project.title || "Project Name"}</span>
                  </h4>
                  <p className="text-zinc-500 text-lg leading-relaxed max-w-lg font-light">
                    <span data-dock-type="text" data-dock-bind={`projects.${idx}.description`}>{project.description || "Building future-proof architecture."}</span>
                  </p>
                </div>
                
                <a 
                    href={project.project_url || "#"} 
                    className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-700 hover:rotate-12 shadow-xl shadow-blue-500/0 hover:shadow-blue-500/20"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l10-10M7 7h10v10"/></svg>
                </a>
              </div>

              {/* Decorative line */}
              <div className="mt-12 h-px w-full bg-gradient-to-r from-white/5 via-white/10 to-transparent"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;