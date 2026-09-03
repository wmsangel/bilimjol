// Фирменный знак «книга-дорога» (билим = книга, жол = дорога → к звезде).
// Три варианта SVG-строк для разных фонов + helper data-URI для next/og.

// Прозрачный знак для тёмного фона (кремовые страницы, светлая дорога).
export const MARK_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
<path d='M60 80 C53 62 72 57 76 42' stroke='#a99cf7' stroke-width='8.5' fill='none' stroke-linecap='round'/>
<path d='M60 80 C53 62 72 57 76 42' stroke='#ffffff' stroke-width='2' stroke-dasharray='3 6' fill='none' stroke-linecap='round' opacity='0.85'/>
<circle cx='78' cy='30' r='16' fill='#f5b301' opacity='0.16'/>
<path d='M78 15 l3.6 7.6 8.4 1.1 -6 5.8 1.5 8.4 -7.5 -4 -7.5 4 1.5 -8.4 -6 -5.8 8.4 -1.1 Z' fill='#f7b32b' stroke='#fff8ea' stroke-width='1.3' stroke-linejoin='round'/>
<g fill='#f7b32b'><circle cx='62' cy='23' r='1.5'/><circle cx='93' cy='39' r='1.6'/></g>
<path d='M60 104 L20 88 L20 82 L60 98 Z' fill='#2a2170'/><path d='M60 104 L100 88 L100 82 L60 98 Z' fill='#2a2170'/>
<path d='M60 100 L23 85 L23 83 L60 98 Z' fill='#b7afe6'/><path d='M60 100 L97 85 L97 83 L60 98 Z' fill='#c4bcee'/>
<path d='M60 98 L23 83 C23 83 24.5 63 24.5 63 L60 75 Z' fill='#efeafc'/><path d='M60 98 L97 83 C97 83 95.5 63 95.5 63 L60 75 Z' fill='#fbfaff'/>
<g stroke='#a49cdd' stroke-width='1.5' stroke-linecap='round'><path d='M31 71 L52 79.5'/><path d='M31 76 L52 84.5'/><path d='M31 81 L47 87'/><path d='M89 71 L68 79.5'/><path d='M89 76 L68 84.5'/><path d='M89 81 L73 87'/></g>
<path d='M60 75 L60 98' stroke='#8f83e6' stroke-width='1.8'/>
</svg>`;

// Значок для фавикона: тёмный скруглённый квадрат + знак (высокий контраст).
export const BADGE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
<rect x='0' y='0' width='120' height='120' rx='26' fill='#191539'/>
<path d='M60 80 C53 62 72 57 76 42' stroke='#a99cf7' stroke-width='8.5' fill='none' stroke-linecap='round'/>
<path d='M78 15 l3.6 7.6 8.4 1.1 -6 5.8 1.5 8.4 -7.5 -4 -7.5 4 1.5 -8.4 -6 -5.8 8.4 -1.1 Z' fill='#f7b32b' stroke='#fff8ea' stroke-width='1.3' stroke-linejoin='round'/>
<path d='M60 104 L20 88 L20 82 L60 98 Z' fill='#2a2170'/><path d='M60 104 L100 88 L100 82 L60 98 Z' fill='#2a2170'/>
<path d='M60 98 L23 83 C23 83 24.5 63 24.5 63 L60 75 Z' fill='#efeafc'/><path d='M60 98 L97 83 C97 83 95.5 63 95.5 63 L60 75 Z' fill='#fbfaff'/>
<path d='M60 75 L60 98' stroke='#8f83e6' stroke-width='1.8'/>
</svg>`;

// Иконка-плитка для светлого фона (рассветный фон + знак) — для шапки сайта.
export const TILE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
<defs><linearGradient id='tb' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#efeaff'/><stop offset='1' stop-color='#ffe9cf'/></linearGradient></defs>
<rect x='0' y='0' width='120' height='120' rx='28' fill='url(#tb)'/>
<path d='M60 80 C53 62 72 57 76 42' stroke='#6d5cf7' stroke-width='8.5' fill='none' stroke-linecap='round'/>
<path d='M78 15 l3.6 7.6 8.4 1.1 -6 5.8 1.5 8.4 -7.5 -4 -7.5 4 1.5 -8.4 -6 -5.8 8.4 -1.1 Z' fill='#f7b32b' stroke='#ffffff' stroke-width='1.3' stroke-linejoin='round'/>
<path d='M60 104 L20 88 L20 82 L60 98 Z' fill='#3a2f9e'/><path d='M60 104 L100 88 L100 82 L60 98 Z' fill='#3a2f9e'/>
<path d='M60 98 L23 83 C23 83 24.5 63 24.5 63 L60 75 Z' fill='#f4f2ff'/><path d='M60 98 L97 83 C97 83 95.5 63 95.5 63 L60 75 Z' fill='#fbfaff'/>
<path d='M60 75 L60 98' stroke='#6d5cf7' stroke-width='1.8'/>
</svg>`;

/** data-URI для использования в next/og (<img src=...>). */
export function markDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
