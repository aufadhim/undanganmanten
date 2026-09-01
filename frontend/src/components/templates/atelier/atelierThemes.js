const RAW_THEMES = [
  ['celluloid','Celluloid','vintage','#211913','#efe1c8','#8a2d2d','#b89255'],['daguerre','Daguerre','vintage','#242321','#ded7ca','#57524c','#a99a7e'],['kodachrome','Kodachrome','vintage','#432619','#f2c978','#bd4a2f','#3e6970'],['nocturne','Nocturne','cinema','#09090b','#e8e1d7','#8c1828','#c5a35d'],['maison','Maison','editorial','#ece9e2','#171717','#8d1933','#bda36b'],
  ['gatsby','Gatsby','deco','#0d1c1b','#eee1bd','#b08b46','#f0d89d'],['bauhaus','Bauhaus','modern','#eee7d6','#161616','#cf342d','#1f5ca7'],['helvetica','Helvetica','modern','#f5f4ee','#111111','#e93424','#2e5fbc'],['monolith','Monolith','brutalist','#c8c5bd','#151515','#a32923','#6e6b63'],['vellum','Vellum','quiet','#eee8dc','#433b31','#76634b','#b7a27e'],
  ['hanami','Hanami','world','#eee7dd','#292522','#a94757','#817664'],['hanji','Hanji','world','#eee9dc','#26352f','#b2463b','#667f79'],['zellige','Zellige','world','#efe5cf','#123d46','#a23b2e','#c3923d'],['mughal','Mughal','world','#ede0c6','#173d32','#8d2437','#c49b4b'],['safavid','Safavid','world','#122e3b','#f1dfbd','#a94035','#d0a54a'],
  ['songket','Songket','nusantara','#2b1718','#f1dfbd','#8f2631','#c49a48'],['ulos','Ulos','nusantara','#181514','#e8d8c2','#a42b2b','#d0b18a'],['puspa-sunda','Puspa Sunda','nusantara','#e8e4d5','#273a31','#9a4450','#a68b4c'],['taksu','Taksu','nusantara','#211b16','#efe0c4','#87352d','#b98c45'],['samudra','Samudra','nusantara','#112f40','#e6dbc1','#b75b38','#6e9ba0'],
  ['astralis','Astralis','fantasy','#101326','#ede5cf','#8369b3','#c4a760'],['herbarium','Herbarium','fantasy','#e5e5d8','#2f4235','#8e4c52','#9e8b58'],['storybook','Storybook','fantasy','#eee1cf','#392c35','#9c4655','#b48a50'],['cathedral','Cathedral','fantasy','#15131e','#e9dfd2','#7d2948','#bd9654'],['chrome','Chrome','future','#d9dde0','#14161a','#5e40bf','#738c9d'],
];

export const ATELIER_THEMES = RAW_THEMES.map(([id,name,family,background,foreground,accent,gold], index) => ({
  id,name,family,background,foreground,accent,gold,index,
  category: index < 5 ? 'VINTAGE CINEMATIC' : index < 10 ? 'MODERNIST' : index < 15 ? 'WORLD HERITAGE' : index < 20 ? 'NUSANTARA' : 'FANTASY',
  previewImg: index === 0 ? '/assets/celluloid/generated/victorian-botanical-corner-v1.png' : index === 1 ? '/assets/daguerre/generated/daguerreotype-frame-v1.png' : `/assets/gallery/dummy-gallery-0${(index % 3) + 1}.webp`,
}));
export const ATELIER_THEME_IDS = ATELIER_THEMES.map((theme) => theme.id);
export const ATELIER_CATALOG = ATELIER_THEMES.map((theme) => ({...theme, description: `${theme.name}: komposisi ${theme.category.toLowerCase()} dengan gerak sinematik tersendiri.`}));
export const getAtelierTheme = (id) => ATELIER_THEMES.find((theme) => theme.id === id) || ATELIER_THEMES[0];
