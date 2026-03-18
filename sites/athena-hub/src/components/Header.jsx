import React from 'react';
import { Link } from 'react-router-dom';

function Header({ siteSettings = {}, data }) {
  const settings = Array.isArray(siteSettings) ? (siteSettings[0] || {}) : (siteSettings || {});
  const siteName = settings.site_name || 'athena-hub';
  const headerContent = data?.header?.[0] || data?._header?.[0] || {};
  
  // Use a reliable default logo if site_logo_image is missing
  const displayLogo = settings.site_logo_image || "athena-icon.svg";

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    if (e.shiftKey) return;
    const url = headerContent.cta_url || settings.header_cta_url || "#contact";
    if (url.startsWith('#')) {
      e.preventDefault();
      const target = document.getElementById(url.substring(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-[1000] px-6 transition-all duration-500 flex items-center"
      style={{ 
        display: settings.header_visible === false ? 'none' : 'flex',
        backgroundColor: 'var(--header-bg, var(--color-header-bg, rgba(255,255,255,0.9)))', 
        backdropFilter: 'var(--header-blur, blur(16px))',
        height: 'var(--header-height, 80px)',
        borderBottom: 'var(--header-border, 1px solid rgba(255,255,255,0.1))'
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        {/* Logo & Identity */}
        {(settings.header_show_logo !== false || settings.header_show_title !== false) && (
          <Link to="/" onClick={scrollToTop} className="flex items-center gap-4 group">
            
            {settings.header_show_logo !== false && (
              <div className="relative w-12 h-12 overflow-hidden transition-transform duration-500">
                 <img src={displayLogo} className="w-full h-full object-contain" data-dock-type="media" data-dock-bind="_site_settings.0.site_logo_image" />
              </div>
            )}
            
            <div className="flex flex-col">
              {settings.header_show_title !== false && (
                <span className="text-2xl font-serif font-black tracking-tight text-primary leading-none mb-1">
                  <span data-dock-type="text" data-dock-bind="_site_settings.0.site_name">{siteName}</span>
                </span>
              )}
              {settings.header_show_tagline !== false && settings.tagline && (
                <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold opacity-80">
                  <span data-dock-type="text" data-dock-bind="_site_settings.0.tagline">{settings.tagline}</span>
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Action Menu */}
        <div className="flex items-center gap-8">
            {settings.header_show_button !== false && (
              <button 
                onClick={handleScroll} 
                className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-accent transition-all"
                data-dock-type="link" 
                data-dock-bind="header.0.cta_label"
              >
                {headerContent.cta_label || settings.header_cta_label || "Start Nu"}
              </button>
            )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
