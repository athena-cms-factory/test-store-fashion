/**
 * Helpt bij het resolven van asset URL's (straaljager afbeeldingen)
 * Houdt rekening met de BASE_URL en de standaard 'images/' map.
 */
export const getImageUrl = (url) => {
    if (!url) return '';
    
    // Geen aanpassing nodig voor externe of data-urls
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    
    const base = import.meta.env.BASE_URL || '/';
    // Verwijder leidende slash voor consistente verwerking
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    
    // De jets collectie staat direct in de 'public/images/' map
    const firstPart = cleanUrl.split('/')[0];
    const hasFolder = cleanUrl.includes('/') && firstPart !== '.';
    
    if (!hasFolder) {
        return `${base}${cleanUrl}`.replace(/\/+/g, '/');
    }
    
    return `${base}${cleanUrl}`.replace(/\/+/g, '/');
};
