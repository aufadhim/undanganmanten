const loadedFonts = new Set();

export function ensureFontLoaded(fontFamily) {
  if (!fontFamily || typeof document === 'undefined') return;
  
  // Clean font name from string format e.g. "'Playfair Display', serif" -> "Playfair Display"
  const cleanName = String(fontFamily).split(',')[0].replace(/['"]/g, '').trim();
  if (!cleanName || loadedFonts.has(cleanName)) return;

  loadedFonts.add(cleanName);
  const linkId = `gfont-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  if (document.getElementById(linkId)) return;

  const fontParam = encodeURIComponent(cleanName).replace(/%20/g, '+');
  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
  document.head.appendChild(link);
}
