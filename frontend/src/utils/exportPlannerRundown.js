export async function exportPlannerRundown(wedding,entries){
 const {jsPDF}=await import('jspdf');const pdf=new jsPDF();
 const image=new Image();image.src='/assets/landing-canvas/garden.webp';await image.decode().catch(()=>{});
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=200;const ctx=canvas.getContext('2d');ctx.fillStyle='#f3eedf';ctx.fillRect(0,0,1000,200);if(image.naturalWidth){ctx.globalAlpha=.3;ctx.drawImage(image,0,0,1000,200)}const art=canvas.toDataURL('image/jpeg',.85);
 let y;
 function header(){pdf.setFillColor('#fbf8ef');pdf.rect(0,0,210,297,'F');pdf.addImage(art,'JPEG',14,14,182,35,'garden');pdf.setTextColor('#3c5039');pdf.setFont('times','normal');pdf.setFontSize(23);pdf.text('samavaya',20,29);pdf.setFontSize(14);pdf.text('Rundown Hari Bahagia',20,41);pdf.setFont('helvetica','normal');pdf.setFontSize(11);const title=pdf.splitTextToSize(wedding.title,174);pdf.text(title,18,58);y=60+title.length*5;pdf.setFontSize(9);pdf.text('Tanggal pernikahan: '+wedding.weddingDate.slice(0,10)+' | Waktu sesuai jadwal penyelenggara',18,y);y+=12;}
 function text(value,{bold=false,size=10}={}){pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);const lines=pdf.splitTextToSize(String(value),170);for(const line of lines){if(y>274){pdf.addPage();header()}pdf.text(line,20,y);y+=5}}
 header();const rows=[...entries].sort((a,b)=>((a.details.date||'')+(a.details.start||'')).localeCompare((b.details.date||'')+(b.details.start||'')));
 for(const {details:r} of rows){if(y>240){pdf.addPage();header()}pdf.setDrawColor('#c8d0b8');pdf.line(18,y-3,192,y-3);text((r.date||'Tanggal belum diisi')+' | '+r.start+(r.end?' - '+r.end:''),{bold:true});text(r.title,{bold:true,size:12});text(r.event);if(r.location)text('Lokasi: '+r.location);if(r.owner)text('PIC: '+r.owner);if(r.notes)text('Catatan: '+r.notes);y+=7}
 for(let i=1;i<=pdf.getNumberOfPages();i++){pdf.setPage(i);pdf.setFontSize(8);pdf.setFont('helvetica','normal');pdf.text('Samavaya | samavaya.web.id | Dicetak '+new Date().toLocaleDateString('id-ID'),14,287);pdf.text(String(i),196,287,{align:'right'})}
 pdf.save('rundown-samavaya.pdf');
}
