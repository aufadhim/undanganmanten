// Preset tema statis buat MVP & Katalog Template.
const ATELIER_PRESETS = [
    ['celluloid','Celluloid','#211913','#efe1c8','#8a2d2d','#b89255'],['daguerre','Daguerre','#242321','#ded7ca','#57524c','#a99a7e'],['kodachrome','Kodachrome','#432619','#f2c978','#bd4a2f','#3e6970'],['maison','Maison','#ece9e2','#171717','#8d1933','#bda36b'],
    ['gatsby','Gatsby','#0d1c1b','#eee1bd','#b08b46','#f0d89d'],['bauhaus','Bauhaus','#eee7d6','#161616','#cf342d','#1f5ca7'],['helvetica','Helvetica','#f5f4ee','#111111','#e93424','#2e5fbc'],['monolith','Monolith','#c8c5bd','#151515','#a32923','#6e6b63'],['vellum','Vellum','#eee8dc','#433b31','#76634b','#b7a27e'],
    ['hanami','Hanami','#eee7dd','#292522','#a94757','#817664'],['hanji','Hanji','#eee9dc','#26352f','#b2463b','#667f79'],['zellige','Zellige','#efe5cf','#123d46','#a23b2e','#c3923d'],['mughal','Mughal','#ede0c6','#173d32','#8d2437','#c49b4b'],['safavid','Safavid','#122e3b','#f1dfbd','#a94035','#d0a54a'],
    ['songket','Songket','#2b1718','#f1dfbd','#8f2631','#c49a48'],['ulos','Ulos','#181514','#e8d8c2','#a42b2b','#d0b18a'],['puspa-sunda','Puspa Sunda','#e8e4d5','#273a31','#9a4450','#a68b4c'],['taksu','Taksu','#211b16','#efe0c4','#87352d','#b98c45'],['samudra','Samudra','#112f40','#e6dbc1','#b75b38','#6e9ba0'],
    ['astralis','Astralis','#101326','#ede5cf','#8369b3','#c4a760'],['herbarium','Herbarium','#e5e5d8','#2f4235','#8e4c52','#9e8b58'],['storybook','Storybook','#eee1cf','#392c35','#9c4655','#b48a50'],['cathedral','Cathedral','#15131e','#e9dfd2','#7d2948','#bd9654'],['chrome','Chrome','#d9dde0','#14161a','#5e40bf','#738c9d'],
].map(([id,name,background,text,accent,gold]) => ({id,name,previewColor:accent,settings:{background:{primary:background,secondary:background,tertiary:gold,enabled:true},bodyText:{primary:accent,secondary:text,tertiary:gold,enabled:true},button:{primary:accent,secondary:gold,text:background,enabled:true},typography:{fontHeading:'Cormorant Garamond',fontBody:'Montserrat'},animationType:'cinematic'}}));
export const THEME_PRESETS = [
    {
        id: 'eternal',
        name: 'Eternal',
        previewColor: '#fafaf9',
        settings: {
            background: { primary: '#fafaf9', secondary: '#f5f5f4', tertiary: '#e7e5e4', enabled: true },
            bodyText: { primary: '#292524', secondary: '#1c1917', tertiary: '#57534e', enabled: true },
            button: { primary: '#292524', secondary: '#57534e', text: '#fafaf9', enabled: true },
            typography: { fontHeading: 'Cormorant Garamond', fontBody: 'Montserrat' },
        },
    },
    {
        id: 'seraya',
        name: 'Seraya',
        previewColor: '#F4F1EA',
        settings: {
            background: { primary: '#F4F1EA', secondary: '#DEDAD1', tertiary: '#B9B4A8', enabled: true },
            bodyText: { primary: '#0A0A0A', secondary: '#4A4945', tertiary: '#111111', enabled: true },
            button: { primary: '#111111', secondary: '#F4F1EA', text: '#FFFFFF', enabled: true },
            typography: { fontHeading: 'Abril Fatface', fontBody: 'Bellefair' },
        },
    },
    {
        id: 'nawasena',
        name: 'Nawasena',
        previewColor: '#741D2B',
        settings: {
            background: { primary: '#F4EDDF', secondary: '#D9C9AD', tertiary: '#B7A276', enabled: true },
            bodyText: { primary: '#741D2B', secondary: '#243322', tertiary: '#A4894E', enabled: true },
            button: { primary: '#A4894E', secondary: '#741D2B', text: '#FFFFFF', enabled: true },
            typography: { fontHeading: 'Cormorant Garamond', fontBody: 'Montserrat' },
            animationType: 'petals',
        },
    },
    {
        id: 'isvara',
        name: 'Isvara',
        previewColor: '#78846C',
        settings: {
            background: { primary: '#F3F0E8', secondary: '#DFE3D5', tertiary: '#AEB8A3', enabled: true },
            bodyText: { primary: '#465440', secondary: '#30372F', tertiary: '#78846C', enabled: true },
            button: { primary: '#78846C', secondary: '#465440', text: '#FFFFFF', enabled: true },
            typography: { fontHeading: 'Cormorant Garamond', fontBody: 'Montserrat' },
            animationType: 'petals',
        },
    },
    {
        id: 'botani',
        name: 'Botani',
        previewColor: '#1E2616',
        settings: {
            background: { primary: '#fdfbf7', secondary: '#f4ece1', tertiary: '#e8dfd8', enabled: true },
            bodyText: { primary: '#2d3a3a', secondary: '#588157', tertiary: '#3a5a40', enabled: true },
            button: { primary: '#3a5a40', secondary: '#588157', enabled: true },
            typography: { fontHeading: 'Playfair Display', fontBody: 'Manrope' },
        },
    },
    {
        id: 'natura',
        name: 'Natura',
        previewColor: '#3a5a40',
        settings: {
            background: { primary: '#fdfbf7', secondary: '#f4ece1', tertiary: '#e8dfd8', enabled: true },
            bodyText: { primary: '#2d3a3a', secondary: '#588157', tertiary: '#3a5a40', enabled: true },
            button: { primary: '#3a5a40', secondary: '#588157', enabled: true },
            typography: { fontHeading: 'Playfair Display', fontBody: 'Manrope' },
        },
    },
    {
        id: 'exclusive-olan',
        name: 'Exclusive Olan',
        previewColor: '#CBA153',
        settings: {
            background: { primary: '#EEE8E5', secondary: '#E4D5C0', tertiary: '#CBA153', enabled: true },
            bodyText: { primary: '#7E3942', secondary: '#1E3F43', tertiary: '#CBA153', enabled: true },
            button: { primary: '#CBA153', secondary: '#E4D5C0', enabled: true },
            typography: { fontHeading: 'Cormorant Infant', fontBody: 'Roboto' },
        },
    },
    {
        id: 'emerald',
        name: 'Emerald',
        previewColor: '#056641',
        settings: {
            background: { primary: '#056641', secondary: '#024229', tertiary: '#D2B37D', enabled: true },
            bodyText: { primary: '#F9F5EC', secondary: '#EAE3C9', tertiary: '#D2B37D', enabled: true },
            button: { primary: '#D2B37D', secondary: '#024229', enabled: true },
            typography: { fontHeading: 'Playfair Display', fontBody: 'Inter' },
        },
    },
    {
        id: 'sapphire',
        name: 'Sapphire',
        previewColor: '#0D1B2A',
        settings: {
            background: { primary: '#0D1B2A', secondary: '#FDFBF7', tertiary: '#C5A880', enabled: true },
            bodyText: { primary: '#FDFBF7', secondary: '#0D1B2A', tertiary: '#C5A880', enabled: true },
            button: { primary: '#C5A880', secondary: '#0D1B2A', enabled: true },
            typography: { fontHeading: 'Playfair Display', fontBody: 'Inter' },
        },
    },
    {
        id: 'casamie',
        name: 'Casamie',
        previewColor: '#A69F8B',
        settings: {
            background: { primary: '#A69F8B', secondary: '#E3DCC8', tertiary: '#3A3831', enabled: true },
            bodyText: { primary: '#F9F6F0', secondary: '#3A3831', tertiary: '#A69F8B', enabled: true },
            button: { primary: '#8C8471', secondary: '#3A3831', enabled: true },
            typography: { fontHeading: 'Playfair Display', fontBody: 'Inter' },
        },
    },
    {
        id: 'genby',
        name: 'Genby',
        previewColor: '#701C1A',
        settings: {
            background: { primary: '#EAE3C9', secondary: '#FFFFFF', tertiary: '#701C1A', enabled: true },
            bodyText: { primary: '#2B1810', secondary: '#701C1A', tertiary: '#C5A880', enabled: true },
            button: { primary: '#701C1A', secondary: '#2B1810', enabled: true },
            typography: { fontHeading: 'Great Vibes', fontBody: 'Inter' },
        },
    },
    {
        id: 'velvet',
        name: 'Velvet',
        previewColor: '#2A1B38',
        settings: {
            background: { primary: '#1A1124', secondary: '#2A1B38', tertiary: '#B76E79', enabled: true },
            bodyText: { primary: '#F8F5F2', secondary: '#B76E79', tertiary: '#8A4F58', enabled: true },
            button: { primary: '#B76E79', secondary: '#1A1124', enabled: true },
            typography: { fontHeading: 'Cinzel', fontBody: 'Montserrat' },
        },
    },
    {
        id: 'lumiere',
        name: 'Lumiere',
        previewColor: '#FDF5F6',
        settings: {
            background: { primary: '#FDF5F6', secondary: '#FFFFFF', tertiary: '#D4AF37', enabled: true },
            bodyText: { primary: '#4A4A4A', secondary: '#D4AF37', tertiary: '#E6C8CB', enabled: true },
            button: { primary: '#FFFFFF', secondary: '#4A4A4A', enabled: true },
            typography: { fontHeading: 'Cormorant Garamond', fontBody: 'Lato' },
        },
    },
    {
        id: 'rustica',
        name: 'Rustica',
        previewColor: '#E2725B',
        settings: {
            background: { primary: '#FDF9F1', secondary: '#F4E8D1', tertiary: '#8A9A5B', enabled: true },
            bodyText: { primary: '#4A3B32', secondary: '#E2725B', tertiary: '#8A9A5B', enabled: true },
            button: { primary: '#E2725B', secondary: '#FFFFFF', enabled: true },
            typography: { fontHeading: 'Caveat', fontBody: 'Jost' },
        },
    },
    {
        id: 'lanqing',
        name: 'Lanqing',
        previewColor: '#8D1B24',
        settings: {
            background: { primary: '#F6EBDD', secondary: '#E9C9B6', tertiary: '#DDA58B', enabled: true },
            bodyText: { primary: '#8D1B24', secondary: '#341B18', tertiary: '#C79A3B', enabled: true },
            button: { primary: '#A8232D', secondary: '#71131B', text: '#FFF8E8', enabled: true },
            typography: { fontHeading: 'Cormorant Garamond', fontBody: 'Montserrat' },
            animationType: 'petals',
        },
    },
    {
        id: 'nocturne',
        name: 'Nocturne',
        previewColor: '#751C30',
        settings: {
            background: { primary: '#08090B', secondary: '#121014', tertiary: '#1B1A1F', enabled: true },
            bodyText: { primary: '#751C30', secondary: '#EEE7DC', tertiary: '#89888D', enabled: true },
            button: { primary: '#C5A46A', secondary: '#751C30', text: '#08090B', enabled: true },
            typography: { fontHeading: 'Bodoni Moda', fontBody: 'Manrope' },
            animationType: 'cinematic',
        },
    },
    ...ATELIER_PRESETS,
];

export function getPresetById(id) {
    return THEME_PRESETS.find((preset) => preset.id === id) || null;
}
