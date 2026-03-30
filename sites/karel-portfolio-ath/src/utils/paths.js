/**
 * Helpt bij het resolven van asset URL's (portfolio afbeeldingen, avatars, project screenshots)
 * Houdt rekening met de BASE_URL en de standaard 'images/' map.
 */
export const getImageUrl = (url) => {
    if (!url) return '';
    
    // Geen aanpassing nodig voor externe of data-urls
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    
    const base = import.meta.env.BASE_URL || '/';
    // Verwijder leidende slash voor consistente verwerking
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    
    // Als de URL al een pad bevat (bijv. 'screenshots/proj1.png'), gebruik het direct onder base
    // Anders prefixen we met 'images/'
    const hasFolder = cleanUrl.includes('/') && !cleanUrl.startsWith('./');
    
    if (!hasFolder) {
        return `${base}images/${cleanUrl}`.replace(/\/+/g, '/');
    }
    
    return `${base}${cleanUrl}`.replace(/\/+/g, '/');
};
