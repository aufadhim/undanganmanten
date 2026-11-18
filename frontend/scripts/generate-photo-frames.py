from pathlib import Path
from math import sin,cos,pi
out=Path('frontend/public/assets/photo-frames')
def flower(x,y,r,c,petals=7):
 s=f'<g transform="translate({x} {y})">'
 for ring in [1,.68,.38]:
  for i in range(petals):
   a=i*360/petals+(1-ring)*30
   s+=f'<ellipse cx="0" cy="{-r*ring*.53:.2f}" rx="{r*ring*.44:.2f}" ry="{r*ring*.63:.2f}" transform="rotate({a})" fill="{c}" fill-opacity=".66" stroke="#faf2e5" stroke-opacity=".4" stroke-width="1"/>'
 s+=f'<circle r="{r*.13}" fill="#b49a66"/><circle r="{r*.055}" fill="#76684b"/></g>'
 return s
def branch(x,y,angle,scale=1,green='#8e9c7b'):
 s=f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})" stroke="{green}" stroke-width="1.6" fill="{green}"><path d="M0 0 Q-10 -65 7 -150" fill="none"/>'
 for i in range(7):
  yy=-15-i*19;side=(-1)**i
  s+=f'<path d="M0 {yy} Q{side*44} {yy-36} {side*28} {yy-51} Q{side*3} {yy-40} 0 {yy}" fill-opacity="{.45+i*.05}"/>'
 return s+'</g>'
def cluster(x,y,angle,colors,scale=1):
 s=f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})">'
 for a in [-75,-25,30,72]:s+=branch(0,0,a,.95,colors[0])
 for xx,yy,r in [(0,-24,32),(-37,4,24),(34,9,22),(-10,-67,17),(44,-44,15)]:s+=flower(xx,yy,r,colors[1])
 return s+'</g>'
def lotus(x,y,s=1,c='#b48d7b'):
 t=f'<g transform="translate({x} {y}) scale({s})" stroke="#ac9473" stroke-width="1.4" fill="{c}" fill-opacity=".7">'
 for a in [-60,-30,0,30,60]:t+=f'<path transform="rotate({a})" d="M0 0 C-30 -20 -20 -55 0 -80 C20 -55 30 -20 0 0Z"/>'
 return t+'<path d="M-65 0 Q0 35 65 0 Q0 15 -65 0" fill="#9a9f80"/></g>'
def svg(name,paper,ink,art):
 # Border is a ring: transparent central aperture, not a painted card.
 defs='''<defs><filter id="paint" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="8" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="2.7" xChannelSelector="R" yChannelSelector="G"/></filter><linearGradient id="paper" x2="1" y2="1"><stop stop-color="'''+paper+'''"/><stop offset="1" stop-color="#e5d8c3"/></linearGradient><filter id="motif-relief" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.15" result="soft"/><feOffset in="soft" dx="1.8" dy="2.5" result="lower"/><feOffset in="soft" dx="-1.5" dy="-2" result="upper"/><feComposite in="lower" in2="SourceAlpha" operator="out" result="cast"/><feComposite in="SourceAlpha" in2="lower" operator="out" result="lit"/><feComposite in="SourceAlpha" in2="upper" operator="out" result="shade"/><feFlood flood-color="#3c2c1c" flood-opacity=".57" result="dark"/><feComposite in="dark" in2="cast" operator="in" result="shadow"/><feComposite in="dark" in2="shade" operator="in" result="rim"/><feFlood flood-color="#fff6da" flood-opacity=".82" result="light"/><feComposite in="light" in2="lit" operator="in" result="shine"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/><feMergeNode in="rim"/><feMergeNode in="shine"/></feMerge></filter></defs>'''
 shell=f'<path d="M0 0H600V800H0Z M64 94V706H536V94Z" fill="url(#paper)" fill-rule="evenodd"/><path d="M37 54H563V746H37Z" fill="none" stroke="{ink}" stroke-width="1.4"/><path d="M50 69H550V731H50Z" fill="none" stroke="{ink}" stroke-width=".7" opacity=".6"/>'
 out.joinpath(name+'.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">{defs}{shell}<g filter="url(#motif-relief)">{art}</g></svg>')
# Botanical: asymmetrical lush painted flowers and arching greenery
art='<g filter="url(#paint)">'
for x,y,a,s in [(45,100,5,1.3),(558,175,170,1),(70,730,-5,1.4),(550,740,45,1.25)]:art+=cluster(x,y,a,['#8a9b78','#d9b8aa'],s)
for x,a in [(170,-80),(430,80)]:art+=branch(x,55,a,.9)
art+='</g><path d="M110 53 Q300 3 490 53" fill="none" stroke="#9eaa88" stroke-width="2" opacity=".6"/>'
svg('viridarium','#f7f2e6','#a7ae92',art)
# Sogan: kawung batik panels, carved edge, jasmine garlands
art=''
for x in [17,583]:
 for y in range(105,705,43):
  art+=f'<g transform="translate({x} {y})" fill="none" stroke="#98776b" stroke-width="1" opacity=".75">'
  for a in [0,90,180,270]:art+=f'<ellipse cy="-9" rx="5.5" ry="10" transform="rotate({a})"/>'
  art+='</g>'
art+='<path d="M82 70Q300 170 518 70" fill="none" stroke="#9b9980" stroke-width="3"/>'
for i in range(17):
 x=90+i*26;y=70+sin(i/16*pi)*48
 art+=flower(x,y,9,'#fffcdf',5)
for x,y,a in [(57,90,-40),(550,725,140)]:art+=cluster(x,y,a,['#8d8b71','#a7837b'],.9)
art+='<path d="M180 775H420L390 758H210Z M220 753H380L358 739H242Z M252 733H348L300 704Z" fill="#947b63" opacity=".8"/>'
svg('sogan','#eee4d3','#a68c71',art)
# Pramaya: relief, lotus and an architectural silhouette at foot
art=''
for x in [20,580]:
 for y in range(110,710,45):art+=f'<path d="M{x} {y-13}l9 13 -9 13 -9 -13Z" fill="none" stroke="#b09777"/><circle cx="{x}" cy="{y}" r="2" fill="#ab8b70"/>'
def temple(x,y,s):
 return f'<g transform="translate({x} {y}) scale({s})" fill="#988671" stroke="#c8b396" stroke-width="1"><path d="M-45 0H45V-18H34V-55H28V-78H20V-103H13V-126H7L0 -153 -7 -126H-13V-103H-20V-78H-28V-55H-34V-18H-45Z"/><path d="M-8 0V-29Q0 -44 8 -29V0" fill="#ddd0ba"/><path d="M-30 -48H30M-25 -70H25M-18 -97H18M-11 -118H11" fill="none"/></g>'
art+=temple(300,800,.8)+temple(225,800,.52)+temple(375,800,.52)
for x,y,s in [(50,765,.8),(550,765,.8),(300,95,.6)]:art+=lotus(x,y,s,'#c2a18c')
art+='<path d="M130 44H250L300 18 350 44H470" fill="none" stroke="#b59c79" stroke-width="2"/>'
svg('pramaya','#eee5d3','#b49a78',art)
# Eternal: double arch, lilies and ivory draped ribbons
art='<path d="M65 260V178C65 33 535 33 535 178V260M75 260V180C75 48 525 48 525 180V260" fill="none" stroke="#bbbaa9" stroke-width="2"/><path d="M0 660Q54 701 130 755L0 800Z M600 660Q546 701 470 755L600 800Z" fill="#e7e3d8" opacity=".8"/>'
for x,y,a in [(50,700,-25),(550,175,155)]:
 art+=branch(x,y,a,1.3,'#a8ada1')
 for dx,dy,r in [(0,0,30),(14,-48,24),(-10,-82,18)]:art+=flower(x+dx,y+dy,r,'#fffdf1',6)
art+='<path d="M220 768Q260 730 300 765Q340 730 380 768Q340 751 300 782Q260 751 220 768" fill="none" stroke="#b7ad96" stroke-width="2"/>'
svg('eternal','#faf7ee','#b8b5a5',art)
# Seraya: editorial torn-paper corners, diagonal ribbons and ink botanical drawing
art='<path d="M0 0H155L86 86 0 144Z M600 800H445L514 714 600 656Z" fill="#b5a18f"/><path d="M0 118L118 0M600 682L482 800" stroke="#685c53" stroke-width="11"/><path d="M0 133L133 0M600 667L467 800" stroke="#c9b6a0" stroke-width="3"/>'
for x,y,a in [(548,250,155),(64,725,-25)]:art+=cluster(x,y,a,['#8e8c7e','#c3a48e'],1.05)
art+='<path d="M170 37H500M100 763H430" stroke="#796b5e" stroke-width="2"/><path d="M170 44H500M100 756H430" stroke="#c9b49d" stroke-width=".8"/>'
svg('seraya','#f2eadb','#7c7063',art)
# Nawasena: joglo crown and magnolia garden
art='<path d="M105 96Q225 80 300 24Q375 80 495 96L470 112H130Z" fill="#a48b6c" stroke="#cdbb91" stroke-width="2"/><path d="M195 73Q255 55 300 7Q345 55 405 73L390 80H210Z" fill="#88785c"/><path d="M125 118H475" stroke="#b59a70" stroke-width="4"/>'
for x,y,a in [(48,230,-20),(555,710,170),(65,750,-60)]:art+=cluster(x,y,a,['#8c9475','#eddfba'],1.2)
for x in [20,580]:
 for y in range(270,660,35):art+=f'<path d="M{x-5} {y}Q{x+9} {y-15} {x+5} {y-25}Q{x-9} {y-15} {x-5} {y}" fill="none" stroke="#b29c74" stroke-width="1"/>'
svg('nawasena','#f2ead4','#b09a6e',art)
