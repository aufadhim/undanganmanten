const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' });

export async function exportGuestBook(format, invitation, guests) {
    const profile = invitation.coupleProfile || {};
    const couple = [profile.brideName, profile.groomName].filter(Boolean).join(' & ') || 'Buku Tamu';
    const eventDate = invitation.weddingDate ? String(invitation.weddingDate).slice(0, 10) : 'Belum ditentukan';
    const rows = guests.map(guest => [
        guest.name, guest.checkedIn ? 'Sudah hadir' : 'Belum check-in',
        guest.checkedIn ? guest.checkInCount || 0 : 0,
        guest.checkedIn && guest.checkedInAt ? dateFormat.format(new Date(guest.checkedInAt)) : '',
    ]);
    const summary = [
        ['Samavaya', 'Laporan Buku Tamu'],
        ['Pasangan', couple],
        ['Tanggal acara', eventDate],
        ['Undangan check-in', guests.filter(guest => guest.checkedIn).length],
        ['Orang hadir', rows.reduce((total, row) => total + row[2], 0)],
    ];
    const headings = ['Nama tamu', 'Status check-in', 'Jumlah hadir', 'Waktu check-in (WIB)'];
    const filename = 'buku-tamu-' + (invitation.slug || 'contoh');
    if (format === 'xlsx') {
        const { utils, writeFile } = await import('@e965/xlsx');
        const book = utils.book_new();
        const overview = utils.aoa_to_sheet(summary);
        const details = utils.aoa_to_sheet([headings, ...rows]);
        overview['!cols'] = [{ wch: 24 }, { wch: 40 }];
        details['!cols'] = [34, 20, 15, 29].map(wch => ({ wch }));
        details['!autofilter'] = { ref: details['!ref'] };
        utils.book_append_sheet(book, overview, 'Ringkasan');
        utils.book_append_sheet(book, details, 'Daftar Check-in');
        writeFile(book, filename + '.xlsx');
        return;
    }

    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();
    const image = new Image();
    image.src = '/assets/landing-canvas/garden.webp';
    await image.decode().catch(() => {});
    const banner = document.createElement('canvas');
    banner.width = 1000;
    banner.height = 185;
    const paint = banner.getContext('2d');
    paint.fillStyle = '#f4eedf';
    paint.fillRect(0, 0, banner.width, banner.height);
    if (image.naturalWidth) {
        const crop = image.naturalWidth * banner.height / banner.width;
        paint.globalAlpha = 0.34;
        paint.drawImage(image, 0, Math.max(0, (image.naturalHeight - crop) / 2), image.naturalWidth, Math.min(crop, image.naturalHeight), 0, 0, banner.width, banner.height);
    }
    const artwork = banner.toDataURL('image/jpeg', 0.86);
    const columns = [18, 87, 123, 151];
    function header() {
        pdf.addImage(artwork, 'JPEG', 14, 14, 182, 34, 'garden');
        pdf.setTextColor('#324637');
        pdf.setFont('times', 'normal');
        pdf.setFontSize(22);
        pdf.text('samavaya', 19, 27);
        pdf.setFontSize(16);
        pdf.text('Laporan Buku Tamu', 19, 40);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const names = pdf.splitTextToSize(couple, 174);
        pdf.text(names, 18, 57);
        const summaryY = 57 + names.length * 5;
        pdf.text('Tanggal acara: ' + eventDate, 18, summaryY);
        pdf.text(summary[3][1] + ' undangan check-in  |  ' + summary[4][1] + ' orang hadir', 18, summaryY + 6);
        pdf.setFillColor('#e4ead8');
        pdf.rect(14, summaryY + 12, 182, 8, 'F');
        pdf.setFontSize(8);
        headings.forEach((heading, index) => pdf.text(heading, columns[index], summaryY + 17));
        return summaryY + 25;
    }
    let y = header();
    if (!rows.length) pdf.text('Belum ada tamu dalam daftar.', 18, y);
    for (const row of rows) {
        const name = pdf.splitTextToSize(String(row[0]), 66);
        const height = Math.max(8, name.length * 4 + 4);
        if (y + height > 278) {
            pdf.addPage();
            y = header();
        }
        pdf.text(name, columns[0], y);
        row.slice(1).forEach((value, index) => pdf.text(String(value), columns[index + 1], y));
        pdf.setDrawColor('#d9dfd0');
        pdf.line(14, y + height - 5, 196, y + height - 5);
        y += height;
    }
    for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
        pdf.setPage(page);
        pdf.setFontSize(8);
        pdf.text('Samavaya  |  samavaya.web.id', 14, 287);
        pdf.text(String(page), 196, 287, { align: 'right' });
    }
    pdf.save(filename + '.pdf');
}
