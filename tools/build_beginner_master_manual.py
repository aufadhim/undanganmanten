from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path('/Users/auf/Projects/undanganmanten')
OUT = ROOT / 'docs' / 'MASTER_PANDUAN_PEMELIHARAAN_UNDANGANMANTEN.docx'
OUT.parent.mkdir(parents=True, exist_ok=True)

def shade(cell, color):
    tc_pr = cell._tc.get_or_add_tcPr(); shd = OxmlElement('w:shd'); shd.set(qn('w:fill'), color); tc_pr.append(shd)

def border_cell(cell, color='D9D9D9'):
    tc_pr = cell._tc.get_or_add_tcPr(); borders = OxmlElement('w:tcBorders')
    for edge in ('top','left','bottom','right','insideH','insideV'):
        el = OxmlElement(f'w:{edge}'); el.set(qn('w:val'),'single'); el.set(qn('w:sz'),'4'); el.set(qn('w:color'),color); borders.append(el)
    tc_pr.append(borders)

def set_cell_text(cell, text, bold=False, color=None):
    cell.text = ''
    p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(2); p.paragraph_format.space_before = Pt(2)
    r = p.add_run(text); r.bold = bold; r.font.size = Pt(9.5)
    if color: r.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    border_cell(cell)

def add_table(doc, headers, rows, widths=None):
    table = doc.add_table(rows=1, cols=len(headers)); table.alignment = WD_TABLE_ALIGNMENT.CENTER; table.style = 'Table Grid'
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]; shade(cell, '1D3B37'); set_cell_text(cell, h, True, 'FFFFFF')
        if widths: cell.width = Inches(widths[i])
    for row_index, row in enumerate(rows):
        cells = table.add_row().cells
        for i, value in enumerate(row):
            if row_index % 2: shade(cells[i], 'F4F7F4')
            set_cell_text(cells[i], str(value))
            if widths: cells[i].width = Inches(widths[i])
    doc.add_paragraph()

def heading(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    for r in p.runs: r.font.color.rgb = RGBColor(0,0,0)
    return p

def para(doc, text, bold_lead=None):
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(7); p.paragraph_format.line_spacing = 1.18
    if bold_lead and text.startswith(bold_lead):
        r = p.add_run(bold_lead); r.bold=True; p.add_run(text[len(bold_lead):])
    else: p.add_run(text)
    for r in p.runs: r.font.size = Pt(10.5)
    return p

def bullets(doc, items):
    for item in items:
        p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after=Pt(3); p.add_run(item)

def steps(doc, items):
    for item in items:
        p=doc.add_paragraph(style='List Number'); p.paragraph_format.space_after=Pt(4); p.add_run(item)

def code(doc, text):
    p=doc.add_paragraph(); p.paragraph_format.left_indent=Inches(.28); p.paragraph_format.right_indent=Inches(.18); p.paragraph_format.space_after=Pt(8)
    r=p.add_run(text); r.font.name='Courier New'; r.font.size=Pt(8.5); r.font.color.rgb=RGBColor(31,52,49)
    pPr=p._p.get_or_add_pPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),'F1F4F1'); pPr.append(shd)

doc=Document()
sec=doc.sections[0]; sec.top_margin=Inches(.65); sec.bottom_margin=Inches(.65); sec.left_margin=Inches(.75); sec.right_margin=Inches(.75)
styles=doc.styles
styles['Normal'].font.name='Aptos'; styles['Normal'].font.size=Pt(10.5)
for name, size in [('Title',24),('Heading 1',17),('Heading 2',13),('Heading 3',11)]:
    styles[name].font.name='Aptos Display'; styles[name].font.size=Pt(size); styles[name].font.color.rgb=RGBColor(0,0,0)

# Cover
p=doc.add_paragraph(style='Title'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run('Panduan Pemeliharaan Master UndanganManten')
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run('Blueprint untuk pemula absolut: mengubah isi, desain, template 3D, sidepanel, API, database, dan hosting'); r.italic=True; r.font.size=Pt(12)
doc.add_paragraph()
para(doc,'Dokumen ini dibuat untuk pemilik UndanganManten yang belum memiliki latar belakang pemrograman. Anggap web ini seperti sebuah gedung undangan: tampilan yang dilihat tamu adalah ruang depan, server adalah dapur dan gudang, database adalah buku catatan permanen, sedangkan API adalah pelayan yang membawa pesanan dari ruang depan ke dapur dan kembali lagi.')
para(doc,'Cara pakai dokumen ini: jangan mencoba memahami semuanya sekaligus. Mulailah dari Bab 1 untuk tahu letak setiap bagian, Bab 4 bila ingin membuat template 3D baru, Bab 5 bila ingin mengubah menu sidepanel, dan Bab 7 bila akan menayangkan web ke internet.')
add_table(doc,['Jika ingin...','Buka bab...'],[
    ['Mengubah teks, foto, warna, atau tampilan undangan','Bab 1 sampai Bab 3'],
    ['Membuat template 3D dari Depth Lab','Bab 4'],
    ['Menambah menu pada dashboard/sidepanel','Bab 5'],
    ['Memahami data, tombol Simpan, dan API','Bab 6'],
    ['Menayangkan web ke internet','Bab 7'],
    ['Menangani error dan keadaan darurat','Bab 8'],
], [3.4,3.1])
doc.add_page_break()

heading(doc,'Daftar Isi',1)
for line in ['1. Peta komponen dan hubungannya','2. Cara kerja data dan mapping','3. Mengubah teks gambar warna dan tampilan','4. Membuat template 3D baru dari Depth Lab','5. Menghubungkan sidepanel dashboard ke template','6. Jembatan frontend backend dan API','7. Hosting dari A sampai Z','8. Panduan darurat dan troubleshooting','9. Rutinitas aman sebelum mengubah apa pun','Lampiran A daftar file penting','Lampiran B kamus istilah pemula']:
    para(doc,line)
doc.add_page_break()

heading(doc,'1. Peta Komponen dan Hubungannya',1)
para(doc,'Bayangkan proyek ini sebagai satu set Lego. Setiap keping punya pekerjaan kecil. Mengganti satu keping bisa mengubah bentuk bagian lain, tetapi tidak selalu merusak seluruh bangunan bila dilakukan dari titik yang tepat.')
heading(doc,'1.1 Peta gedung secara sederhana',2)
code(doc,'Pengunjung -> Frontend React -> API Axios -> Backend Express -> Prisma -> PostgreSQL\n                                      |\n                                      -> Cloudflare R2 untuk foto musik dan media')
add_table(doc,['Bagian','Analogi sehari hari','Tugas utamanya','Lokasi utama'],[
    ['Frontend','Ruang resepsi yang dilihat tamu','Menampilkan dashboard dan undangan','frontend/src'],
    ['Backend','Dapur dan kasir','Memeriksa aturan, menerima simpanan, mengirim data','backend/src'],
    ['Database','Buku catatan permanen','Menyimpan pasangan, acara, tamu, RSVP, ucapan','backend/prisma/schema.prisma'],
    ['API','Pelayan pengantar pesanan','Membawa permintaan frontend ke backend','frontend/src/api/client.js dan backend/src/routes'],
    ['Template','Dekorasi setiap ruang undangan','Mengubah data menjadi tampilan visual','frontend/src/components/templates'],
    ['Sidepanel','Panel kontrol di dashboard','Tempat pemilik mengubah isi undangan','frontend/src/pages/Dashboard.jsx dan frontend/src/components'],
], [1.2,1.55,2.1,2.0])
heading(doc,'1.2 Peta folder yang paling sering dipakai',2)
add_table(doc,['Folder atau file','Kapan dibuka','Risiko jika salah ubah'],[
    ['frontend/src/pages/Dashboard.jsx','Menu dashboard, sidepanel, preview, pemilihan panel','Menu bisa hilang atau panel salah tampil'],
    ['frontend/src/components/','Form editor seperti Profil, Acara, Galeri, Warna','Data tidak tersimpan atau preview tidak berubah'],
    ['frontend/src/components/templates/','Tampilan undangan tiap tema','Tampilan publik template bisa rusak'],
    ['frontend/src/components/PhonePreview.jsx','Pintu yang memilih template berdasarkan themeId','Tema baru tidak muncul di preview'],
    ['frontend/src/api/client.js','Kabel utama frontend ke API','Seluruh request bisa gagal'],
    ['frontend/src/config/env.js','Alamat backend dan aturan URL gambar','Foto atau API bisa menunjuk tempat salah'],
    ['backend/src/routes/','Daftar pintu API','Endpoint tidak ditemukan'],
    ['backend/src/controllers/','Aturan ketika API dipanggil','Data bisa tersimpan salah'],
    ['backend/prisma/schema.prisma','Bentuk tabel database','Butuh migrasi; jangan ubah sembarangan'],
    ['frontend/public/assets/','Aset gambar yang ikut dibawa saat build','Gambar template bisa hilang'],
], [2.15,2.25,2.45])
heading(doc,'1.3 Induk anak dan efek perubahan',2)
para(doc,'Komponen induk adalah komponen yang memanggil komponen lain. Dashboard adalah induk untuk panel editor dan preview. PhonePreview adalah induk untuk template aktif. Template seperti Yunshui adalah induk untuk section quote, profil, acara, galeri, form, dan penutup. Karena itu, bila tema baru tidak pernah muncul, periksa PhonePreview dahulu; bila menu dashboard tidak muncul, periksa Dashboard dahulu; bila isi hanya salah pada Yunshui, periksa folder Yunshui dahulu.')
add_table(doc,['Jika yang terlihat salah','Urutan tempat memeriksa'],[
    ['Preview seluruhnya kosong','Dashboard.jsx -> PhonePreview.jsx -> template yang dipilih'],
    ['Hanya satu panel editor tidak tampil','Dashboard.jsx -> komponen panel terkait'],
    ['Teks undangan publik salah','Template -> useInvitationViewModel -> data invitation'],
    ['Foto tidak muncul','env.js -> resolveImageUrl -> URL yang tersimpan -> R2/backend'],
    ['Tombol simpan gagal','komponen panel -> api/client.js -> route -> controller -> database'],
    ['Template baru tidak terlihat di katalog','templateManifest.js -> activeTheme.js -> PhonePreview.jsx -> TemaPanel'],
], [2.35,4.5])
doc.add_page_break()

heading(doc,'2. Cara Kerja Mapping Data dan Logika',1)
para(doc,'Mapping data berarti menerjemahkan isi buku catatan menjadi tampilan. Misalnya database menyimpan nama mempelai sebagai brideName. Template membaca brideName lalu mencetaknya ke layar sebagai nama mempelai wanita. Tidak ada sihir: data bergerak melalui jalur yang dapat ditelusuri.')
heading(doc,'2.1 Perjalanan satu data',2)
code(doc,'Ketik pada sidepanel -> state sementara preview -> tombol Simpan -> API PATCH -> controller backend -> database\nDatabase -> API GET -> Dashboard -> PhonePreview -> template -> layar pengunjung')
add_table(doc,['Contoh data','Diketik di','Disimpan lewat','Ditampilkan oleh'],[
    ['Nama mempelai','ProfilPanel.jsx','PATCH /invitations/me/couple-profile','Template aktif melalui coupleProfile'],
    ['Kutipan','KutipanPanel.jsx','PATCH /invitations/me/quote','Template aktif melalui quoteSettings'],
    ['Acara dan lokasi','AcaraPanel.jsx','POST /invitations/me/events','Template aktif melalui events'],
    ['Foto galeri','GaleriPanel.jsx','POST /invitations/me/gallery','Template aktif melalui galleryMedia'],
    ['Warna dan font','WarnaPanel.jsx / TypographyPanel.jsx','PATCH /invitations/me/theme','Template aktif melalui themeSettings'],
    ['Urutan section','SusunanPanel.jsx','PATCH /invitations/me/theme','PhonePreview dan template melalui layoutOrder'],
], [1.35,1.55,2.05,1.9])
heading(doc,'2.2 Menambah satu data baru yang muncul di layar',2)
para(doc,'Contoh aman: menambah field “Nama Panggilan Pengantin Wanita”. Jangan mulai dari template. Mulailah dari tempat data disimpan, lalu bergerak sampai layar.')
steps(doc,[
    'Tentukan nama teknis sederhana, misalnya brideNickname. Gunakan nama Inggris konsisten karena kode sudah memakai pola itu.',
    'Tambahkan kolom di backend/prisma/schema.prisma, di model CoupleProfile. Contoh: brideNickname String? @map("bride_nickname"). Tanda tanya berarti boleh kosong.',
    'Buat migrasi database dari folder backend dengan perintah npx prisma migrate dev --name add_bride_nickname. Jangan jalankan pada database production tanpa backup.',
    'Periksa backend/src/controllers/coupleProfileController.js. Tambahkan brideNickname ke data yang boleh diterima, divalidasi, dan disimpan.',
    'Buka frontend/src/components/ProfilPanel.jsx. Tambahkan input dengan value dari profile.brideNickname dan masukkan field itu ke payload tombol Simpan.',
    'Buka frontend/src/components/templates/depth/useInvitationViewModel.js atau view model yang dipakai template. Pastikan brideNickname ikut keluar dari data yang dinormalisasi bila diperlukan.',
    'Buka template yang ingin menampilkan data, misalnya frontend/src/components/templates/yunshui/YunshuiTemplate.jsx. Baca profile.brideNickname lalu tampilkan dengan fallback aman, misalnya profile.brideNickname || brideName.',
    'Jalankan frontend dan backend lokal. Isi field, klik Simpan, refresh halaman, lalu cek apakah nilai masih ada. Baru setelah itu build production.',
])
heading(doc,'2.3 Tentang nomor baris',2)
para(doc,'Nomor baris kode berubah setiap kali file diedit. Karena itu, lebih aman mencari “kalimat jangkar”. Di VS Code tekan Command + P untuk membuka file, lalu Command + F untuk mencari teks. Contoh jangkar yang stabil: activeTab ===, SUB_TABS, api.patch, coupleProfile, createDepthManifest, atau resolveImageUrl.')
heading(doc,'2.4 Lokasi aturan if else dan tombol',2)
add_table(doc,['Aturan','File dan jangkar pencarian'],[
    ['Menu panel mana yang tampil','Dashboard.jsx; cari SUB_TABS dan activeTab ==='],
    ['Tema mana yang boleh dipakai','utils/activeTheme.js; cari ACTIVE_THEME_IDS'],
    ['Template apa yang ditampilkan','PhonePreview.jsx; cari invitation?.themeId'],
    ['Section mana disembunyikan','Template; cari visibility atau invitationFeatures'],
    ['Tombol simpan panel','Komponen panel; cari api.patch atau api.post'],
    ['Aturan login','api/client.js; cari interceptors.response'],
    ['Aturan backend endpoint','backend/src/routes/invitationRoutes.js'],
], [2.25,4.5])
doc.add_page_break()

heading(doc,'3. Mengubah Isi Gambar Warna dan Tampilan',1)
heading(doc,'3.1 Mengubah teks yang terlihat di template',2)
steps(doc,[
    'Cari kata yang terlihat di layar dengan Command + Shift + F. Contoh cari “Lihat Lokasi” atau “Open Invitation”.',
    'Bila teks ada dalam Template.jsx, ubah teks fallback saja. Jangan mengganti nama field data tanpa mengikuti Bab 2.',
    'Bila teks berasal dari panel/dashboard, cari di frontend/src/locales/id atau frontend/src/locales/en. Banyak label dashboard memakai fungsi t(...).',
    'Simpan lalu periksa preview. Jika teks tidak berubah, kemungkinan teks berasal dari data invitation atau locale, bukan template.',
])
heading(doc,'3.2 Mengganti gambar dan aset',2)
para(doc,'Ada dua jenis gambar. Gambar bawaan template disimpan di frontend/public/assets dan ikut terpaket saat build. Foto milik pengguna biasanya diunggah melalui backend ke folder uploads atau Cloudflare R2. Jangan menyimpan foto pengguna ke folder aset template kecuali itu memang ilustrasi bawaan tema.')
add_table(doc,['Jenis gambar','Tempat aman','Cara pakai'],[
    ['Ilustrasi bawaan Yunshui','frontend/public/assets/yunshui/orn/','Gunakan path /assets/yunshui/orn/nama-file.webp'],
    ['Background bawaan Yunshui','frontend/public/assets/yunshui/backgrounds/','Gunakan path /assets/yunshui/backgrounds/nama-file.webp'],
    ['Foto pasangan atau galeri','Upload dari panel','Biarkan URL disimpan backend/R2; gunakan resolveImageUrl'],
    ['Gambar filter Instagram','Upload dari panel Visual/IG Filter','Gunakan themeSettings.igFilterImageUrl'],
], [1.55,2.25,2.95])
para(doc,'Saat memasang gambar ke JSX, gunakan pola berikut agar gambar lokal dan gambar hasil upload sama-sama dapat bekerja:')
code(doc,"import { resolveImageUrl } from '../../../config/env.js';\n<img src={resolveImageUrl(profile.bridePhoto)} alt=\"Mempelai wanita\" />")
heading(doc,'3.3 Mengubah warna dan font',2)
para(doc,'Untuk perubahan per undangan, gunakan sidepanel Warna dan Tipografi. Untuk perubahan permanen pada karakter dasar suatu template, buka CSS tema. Jangan menaruh warna baru secara acak di banyak file. Simpan warna sebagai variabel CSS bila warna akan dipakai berulang.')
code(doc,'.yunshui { --ys-ink: #163431; --ys-gold: #c6a363; --ys-paper: #f1eddf; }')
heading(doc,'3.4 Aturan aman sebelum mengubah desain',2)
bullets(doc,[
    'Ubah satu hal kecil lalu refresh preview.',
    'Jangan mengubah JSX dan tiga CSS sekaligus tanpa screenshot pembanding.',
    'Jangan menghapus aset lama saat belum yakin tidak dipakai tema lain.',
    'Jangan menaruh API key di file JSX, CSS, atau GitHub.',
    'Sebelum publish, jalankan npm run build dari folder frontend.',
])
doc.add_page_break()

heading(doc,'4. Depth Lab ke Template 3D Baru',1)
para(doc,'Depth Lab adalah studio percobaan untuk dunia 3D. Ia bukan template pelanggan. Anggap Depth Lab sebagai dapur resep; template baru adalah hidangan yang dibuat dari resep tersebut. Jangan menyalin seluruh tampilan Lab tanpa memilih identitas tema baru.')
heading(doc,'4.1 Bagian penting Depth Lab',2)
add_table(doc,['Keping','Fungsi sederhana','File'],[
    ['DepthEngineLab','Contoh dunia 3D lengkap','frontend/src/pages/DepthEngineLab.jsx'],
    ['depth-engine-lab.css','Aturan posisi, ukuran, kabut, card, dan gerakan Lab','frontend/src/pages/depth-engine-lab.css'],
    ['createDepthManifest','Daftar tujuan perjalanan kamera','frontend/src/components/templates/depth-v2/createDepthManifest.js'],
    ['useDepthCamera','Sopir kamera virtual','frontend/src/components/templates/depth-v2/useDepthCamera.js'],
    ['useDepthInput','Menerjemahkan scroll/swipe menjadi langkah','frontend/src/components/templates/depth-v2/useDepthInput.js'],
    ['DepthPortal','Card yang benar-benar berada di ruang 3D','frontend/src/components/templates/depth-v2/DepthPortal.jsx'],
    ['DepthPassage','Aset yang dilewati saat perjalanan','frontend/src/components/templates/depth-v2/DepthPassage.jsx'],
], [1.55,2.6,2.6])
heading(doc,'4.2 Prinsip yang tidak boleh dilanggar',2)
bullets(doc,[
    'Satu undangan 3D adalah satu dunia, bukan 16 latar belakang terpisah.',
    'Kamera bergerak menuju coordinate, bukan mengganti halaman.',
    'Card adalah pulau baca kecil, bukan layar penuh.',
    'Setiap station memiliki landmark yang relevan dan berbeda.',
    'Objek passage hanya muncul di perjalanan yang masuk akal secara naratif.',
    'Dekorasi selalu pointer-events: none agar tidak menghalangi tombol.',
    'Konten aktif harus mempunyai area interaksi yang benar.',
    'Teks panjang harus diberi area scroll internal, bukan card raksasa.',
])
heading(doc,'4.3 Cara membuat template 3D baru langkah demi langkah',2)
steps(doc,[
    'Buat folder baru, misalnya frontend/src/components/templates/nama-tema/. Jangan mulai dari file Yunshui yang penuh eksperimen. Lebih aman mulai dari struktur Depth Lab dan template yang datanya sudah lengkap.',
    'Buat manifest aset: folder public/assets/nama-tema/backgrounds dan public/assets/nama-tema/orn. Pisahkan background, landmark, passage, dan gambar dekoratif.',
    'Tentukan cerita perjalanan sebelum coding. Contoh: Gerbang -> Janji -> Mempelai -> Akad -> Galeri -> Penutup.',
    'Tuliskan station dalam manifest. Setiap station perlu id, label, posisi x/y/z, sudut, dan pose kamera desktop/mobile.',
    'Buat satu hero dahulu. Tambahkan satu landmark, satu DepthPortal, dan satu passage object menuju station berikutnya.',
    'Uji dengan scroll dan swipe. Kamera harus halus, card lama keluar saat berangkat, lalu card baru masuk ketika mendekat.',
    'Tambahkan quote dan profil sebagai checkpoint kedua. Minta approval desain sebelum menerapkan 16 section.',
    'Setelah grammar disetujui, buat variant untuk event, media, form, dan penutup. Jangan membuat semua section memakai card yang sama.',
    'Daftarkan template baru ke PhonePreview, activeTheme, templateManifest, dan TemaPanel. Detail ada di Bab 5.',
])
heading(doc,'4.4 Template manifest station paling sederhana',2)
code(doc,"const route = createDepthManifest({\n  id: 'nama-tema-depth',\n  name: 'Nama Tema Continuous World',\n  stations: [\n    { id: 'hero', label: 'Gerbang', x: 0, y: 0, z: 0, ry: 0,\n      camera: { mobile: { x: 0, y: 15, z: 0, fov: 51 } } },\n    { id: 'quote', label: 'Janji', x: -300, y: -30, z: -1050, ry: -7,\n      camera: { mobile: { x: -280, y: -20, z: -1050, fov: 50 } } }\n  ]\n}).stations;")
heading(doc,'4.5 Cara memasang gambar 3D',2)
para(doc,'Gunakan tiga kategori. Background adalah dunia jauh dan besar. Landmark adalah objek utama di tempat tujuan, misalnya gapura, pavilion, bunga, bulan, atau jembatan. Passage adalah objek yang menyapa di antara dua tempat, misalnya awan atau bangau.')
code(doc,"<img className=\"theme-landmark\" src=\"/assets/nama-tema/orn/orn-pavilion.webp\" alt=\"\" />\n<DepthPassage src=\"/assets/nama-tema/orn/orn-crane.webp\" x={360} y={80} z={-620} scale={1.05} range={[.08,.5,.88]} />")
heading(doc,'4.6 Cara mengubah animasi',2)
para(doc,'Ada tiga lapisan gerak. Jangan mencampurnya tanpa alasan. Gerak kamera diatur useDepthCamera. Muncul/hilangnya passage diatur range pada DepthPassage. Gerak lembut aset seperti bernapas, melayang, atau kabut bergerak diatur di CSS keyframes.')
add_table(doc,['Jika ingin mengubah','Buka','Ubah dengan hati hati'],[
    ['Kecepatan perjalanan kamera','useDepthCamera atau pemanggilan duration','duration dalam milidetik; 1800 berarti 1,8 detik'],
    ['Awan muncul di mana','DepthPassage range dan posisi x/y/z','range awal, puncak, akhir; jangan semuanya muncul bersamaan'],
    ['Awan melayang','CSS @keyframes','transform kecil dan durasi panjang, misalnya 12-20 detik'],
    ['Card masuk/keluar','CSS portal dan station is-active','opacity, blur, translate kecil; jangan delay satu detik setelah tiba'],
    ['Sudut kamera','manifest camera rx/ry/fov','ubah kecil, lalu screenshot mobile'],
], [1.8,2.25,2.7])
heading(doc,'4.7 Checklist visual template 3D',2)
bullets(doc,[
    'Ambil screenshot sebelum bergerak, di tengah perjalanan, dan setelah tiba.',
    'Pastikan card lama tidak menjadi ghost card di tengah perjalanan.',
    'Pastikan card baru tidak telat muncul setelah kamera tiba.',
    'Pastikan ada ruang dunia 3D di sekeliling card.',
    'Pastikan wajah, judul, tombol, dan input tidak tertutup ornamen.',
    'Pastikan setiap station tidak memakai komposisi yang sama.',
    'Uji scroll mouse dan swipe layar sentuh.',
])
doc.add_page_break()

heading(doc,'5. Menghubungkan Sidepanel Dashboard ke Template',1)
para(doc,'Sidepanel adalah remote control. Template adalah televisi. Dashboard menyimpan state panel aktif, panel mengirim perubahan ke preview, kemudian tombol Simpan mengirimnya ke backend. Template membaca data hasilnya. Jika salah satu kabel putus, perubahan tidak terlihat atau tidak tersimpan.')
heading(doc,'5.1 Peta sidepanel',2)
code(doc,'Dashboard.jsx\n  -> MACRO_TABS: Analitik, Desain, Konten, Tamu, Sistem\n  -> SUB_TABS: daftar tombol kecil di setiap kategori\n  -> activeTab: panel yang sedang ditampilkan\n  -> <NamaPanel ...>: panel editor yang dipanggil\n  -> PhonePreview: preview undangan di sisi kanan')
heading(doc,'5.2 Menambah menu baru contoh “Cerita Khusus”',2)
steps(doc,[
    'Buat file baru frontend/src/components/CeritaKhususPanel.jsx. Mulai dengan panel sederhana berisi input dan tombol Simpan.',
    'Di Dashboard.jsx, tambahkan lazy import di kumpulan import panel. Cari const CeritaPanel = lazy.',
    'Tambahkan item ke SUB_TABS.konten, misalnya { key: "cerita-khusus", label: "Cerita Khusus", icon: "fa-book" }. Gunakan key tanpa spasi.',
    'Tambahkan aturan render: activeTab === "cerita-khusus" && <CeritaKhususPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />.',
    'Tentukan tempat data disimpan. Bila hanya satu teks, ThemeSettings atau CoupleProfile mungkin cukup. Bila daftar banyak item, buat model database baru.',
    'Di panel, gunakan onLivePreview({ ... }) saat mengetik bila ingin preview langsung. Gunakan api.patch(...) ketika tombol Simpan ditekan.',
    'Di template, baca field tersebut dari invitation.themeSettings atau data yang relevan. Beri fallback bila kosong.',
    'Uji tiga keadaan: ketik tanpa simpan, simpan lalu refresh, dan buka undangan publik.',
])
heading(doc,'5.3 File dan jangkar sidepanel yang penting',2)
add_table(doc,['Keperluan','File','Cari teks ini'],[
    ['Menu besar kiri','frontend/src/pages/Dashboard.jsx','MACRO_TABS'],
    ['Menu kecil/pill','frontend/src/pages/Dashboard.jsx','SUB_TABS'],
    ['Panel yang tampil','frontend/src/pages/Dashboard.jsx','activeTab ==='],
    ['Sidebar visual kiri','frontend/src/components/dashboard/DashboardSidebar.jsx','DashboardSidebar'],
    ['Preview perangkat','frontend/src/components/PhonePreview.jsx','if invitation?.themeId'],
    ['Urutan dan aktif/nonaktif section','frontend/src/components/SusunanPanel.jsx','layoutOrder'],
    ['Kemampuan animasi cover per tema','frontend/src/config/templateCapabilities.js','TEMPLATE_CAPABILITIES'],
], [1.8,3.0,1.95])
heading(doc,'5.4 Cara menambah setting khusus template 3D',2)
para(doc,'Contoh: pengguna ingin memilih intensitas kabut. Untuk setting yang hanya mengubah visual, simpan di themeSettings. Jangan buat tabel database baru bila nilainya hanya satu pilihan sederhana.')
code(doc,"// Panel mengirim\nawait api.patch('/invitations/me/theme', { depthFogIntensity: 'soft' });\n\n// Template membaca\nconst fog = theme.depthFogIntensity || 'soft';\n<div className={`fog fog-${fog}`} />")
para(doc,'Sebelum memakai contoh ini, pastikan controller theme menerima field baru. Bila backend memakai daftar field yang diizinkan atau validasi ketat, field yang tidak dikenal dapat diabaikan. Periksa backend/src/controllers/themeController.js dan model ThemeSettings di backend/prisma/schema.prisma.')
doc.add_page_break()

heading(doc,'6. Jembatan Frontend Backend dan API',1)
para(doc,'Frontend dan backend dapat dibayangkan sebagai kasir dan dapur. Kasir tidak memasak sendiri. Ia menulis pesanan lalu mengirimnya ke dapur. API adalah jalur pengantar pesanan. Backend memeriksa apakah pesanan valid, lalu menyimpan atau mengambil data dari database.')
heading(doc,'6.1 Alamat kabel utama',2)
add_table(doc,['Bagian','File','Isi penting'],[
    ['Alamat API frontend','frontend/src/config/env.js','VITE_API_BASE_URL; default lokal http://localhost:4000/api'],
    ['Pembuat request','frontend/src/api/client.js','axios.create dan token login'],
    ['Pintu backend','backend/src/server.js','app.use /api/auth, /api/invitations, dan lain lain'],
    ['Daftar endpoint undangan','backend/src/routes/invitationRoutes.js','GET, POST, PATCH, DELETE'],
    ['Logika simpan data','backend/src/controllers/','controller sesuai jenis data'],
    ['Bentuk database','backend/prisma/schema.prisma','model dan kolom'],
], [1.7,2.4,2.65])
heading(doc,'6.2 Bila alamat server pindah',2)
para(doc,'Misalnya backend lama berada di https://api-lama.example.com dan pindah ke https://api-baru.example.com. Anda tidak mengubah setiap tombol satu per satu. Ubah environment variable frontend berikut pada platform hosting:')
code(doc,'VITE_API_BASE_URL=https://api-baru.example.com/api\nVITE_BACKEND_URL=https://api-baru.example.com')
para(doc,'Kemudian build dan deploy ulang frontend. Backend juga harus diberi alamat frontend baru agar CORS mengizinkan browser menghubungi API:')
code(doc,'FRONTEND_URL=https://alamat-frontend-baru.example.com\nBACKEND_URL=https://api-baru.example.com')
heading(doc,'6.3 Rahasia yang tidak boleh masuk GitHub',2)
bullets(doc,[
    'DATABASE_URL',
    'JWT_SECRET',
    'MIDTRANS_SERVER_KEY',
    'RESEND_API_KEY',
    'R2_SECRET_ACCESS_KEY',
    'FONNTE_TOKEN',
    'Token deployment seperti Render atau Vercel token',
])
para(doc,'Variabel yang dimulai dengan VITE_ akan ikut masuk ke file frontend yang dikirim ke browser. Karena itu VITE_ hanya untuk informasi publik seperti alamat API atau Google Client ID. Jangan pernah memberi VITE_ pada password, server key Midtrans, JWT secret, atau secret R2.')
heading(doc,'6.4 Endpoint yang paling sering dipakai',2)
add_table(doc,['Tujuan','Endpoint','Metode'],[
    ['Daftar undangan pengguna','/api/invitations','GET'],
    ['Buat undangan','/api/invitations','POST'],
    ['Ubah undangan utama','/api/invitations/:id','PATCH'],
    ['Ubah tema','/api/invitations/me/theme','PATCH'],
    ['Ubah profil','/api/invitations/me/couple-profile','PATCH'],
    ['Kelola acara','/api/invitations/me/events','GET / POST / DELETE'],
    ['Kelola galeri','/api/invitations/me/gallery','GET / POST / DELETE'],
    ['Kirim RSVP publik','/api/invitations/public/:slug/rsvp','POST'],
    ['Kirim ucapan publik','/api/invitations/public/:slug/wishes','POST'],
    ['Buka undangan publik','/api/invitations/public/:slug','GET'],
], [2.1,3.35,1.3])
doc.add_page_break()

heading(doc,'7. Hosting Lengkap dari A sampai Z',1)
para(doc,'Hosting berarti menyewa komputer yang menyala 24 jam agar web bisa diakses orang lain. Proyek ini memerlukan paling sedikit tiga benda: frontend, backend, dan database PostgreSQL. Media foto lebih aman disimpan di Cloudflare R2 daripada hard disk server.')
heading(doc,'7.1 Persiapan sekali saja',2)
steps(doc,[
    'Simpan kode di GitHub private repository. Jangan upload file .env.',
    'Pastikan backend dan frontend dapat berjalan lokal.',
    'Pastikan npm run build berhasil dari root atau npm run build dari frontend.',
    'Siapkan domain bila sudah punya. Anda dapat memulai dengan domain gratis provider terlebih dahulu.',
    'Simpan daftar environment variables di password manager, bukan chat atau spreadsheet umum.',
])
heading(doc,'7.2 Opsi A Cloud hosting instan: Cloudflare Pages plus Render',2)
para(doc,'Ini opsi paling mudah untuk pemula karena komputer server diurus provider. Konfigurasi Render sudah tersedia dalam render.yaml untuk backend branch dev. Cloudflare Pages cocok untuk frontend Vite.')
heading(doc,'A.1 Backend di Render',3)
steps(doc,[
    'Masuk ke Render.com lalu pilih New dan Blueprint. Hubungkan repository GitHub.',
    'Pilih file render.yaml. Render akan membaca rootDir backend, build command, start command, dan health check dari file tersebut.',
    'Buat PostgreSQL terkelola di Render, Neon, atau Supabase. Salin DATABASE_URL dari provider database.',
    'Buka service backend lalu Environment. Isi DATABASE_URL, JWT_SECRET, FRONTEND_URL, BACKEND_URL, dan secret layanan opsional.',
    'Untuk development, MIDTRANS_IS_PRODUCTION harus false. Jangan memasukkan server key production ke lingkungan sandbox.',
    'Klik Manual Deploy lalu Deploy latest commit.',
    'Setelah selesai, buka https://alamat-backend/health. Hasil harus status ok. Buka /ready; hasil harus database ready.',
])
heading(doc,'A.2 Frontend di Cloudflare Pages',3)
steps(doc,[
    'Masuk ke Cloudflare Dashboard, pilih Workers and Pages, lalu Create application dan Pages.',
    'Pilih Connect to Git. Pilih repository UndanganManten dan branch yang akan digunakan.',
    'Isi Root directory dengan frontend.',
    'Build command: npm run build. Output directory: dist.',
    'Buka Settings lalu Environment variables. Tambahkan VITE_API_BASE_URL dan VITE_BACKEND_URL menggunakan alamat backend Render.',
    'Tambahkan VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_MAPS_API_KEY, VITE_R2_PUBLIC_URL, atau VITE_MIDTRANS_CLIENT_KEY bila fitur tersebut dipakai.',
    'Klik Save and Deploy. Setelah domain Pages tersedia, salin domain tersebut.',
    'Kembali ke Render dan ubah FRONTEND_URL menjadi domain Pages. Deploy ulang backend agar CORS mengizinkan frontend.',
])
heading(doc,'A.3 Alternatif Vercel untuk frontend',3)
steps(doc,[
    'Masuk ke Vercel, klik Add New lalu Project.',
    'Import repository GitHub. Pada pengaturan proyek, isi Root Directory: frontend.',
    'Framework preset: Vite. Build Command: npm run build. Output Directory: dist.',
    'Buka Settings -> Environment Variables dan isi semua VITE_ yang diperlukan.',
    'Klik Deploy. Setelah domain jadi, masukkan domain itu ke FRONTEND_URL di backend.',
])
heading(doc,'A.4 Database dan media',3)
para(doc,'Supabase atau Neon dapat menjadi tempat database PostgreSQL. Cloudflare R2 menjadi gudang foto, musik, dan file upload. Buat bucket R2, aktifkan URL publik atau custom domain, lalu isi R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, dan R2_PUBLIC_URL pada backend. Jangan taruh R2 secret di frontend.')
heading(doc,'7.3 Opsi B VPS',2)
para(doc,'VPS adalah komputer kosong di internet. Opsi ini memberi kontrol besar tetapi Anda sendiri bertanggung jawab atas keamanan, update, backup, firewall, HTTPS, dan proses yang mati. Untuk pemula, gunakan Opsi A dulu kecuali memang membutuhkan kontrol penuh.')
heading(doc,'B.1 Perintah dasar Ubuntu 22.04 atau 24.04',3)
para(doc,'Ganti nilai dalam tanda kurung siku. Jangan jalankan perintah yang belum dipahami pada komputer pribadi. Semua perintah berikut dijalankan di terminal VPS setelah login SSH.')
code(doc,'ssh root@ALAMAT_IP_VPS\napt update && apt upgrade -y\napt install -y git nginx ufw curl\ncurl -fsSL https://deb.nodesource.com/setup_20.x | bash -\napt install -y nodejs\nnpm install -g pm2')
steps(doc,[
    'Buat database PostgreSQL terkelola di Supabase/Neon atau install PostgreSQL di VPS. Untuk pemula, database terkelola lebih aman.',
    'Clone repository: git clone https://github.com/NAMA_AKUN/undanganmanten.git /var/www/undanganmanten.',
    'Masuk backend, salin .env.example menjadi .env, lalu isi rahasia menggunakan editor nano .env.',
    'Jalankan npm ci, npx prisma generate, npx prisma migrate deploy, lalu pm2 start src/server.js --name undanganmanten-api -- --production. Bila script start lebih aman, gunakan pm2 start npm --name undanganmanten-api -- start.',
    'Masuk frontend. Buat .env.production berisi VITE_API_BASE_URL dan VITE_BACKEND_URL. Jalankan npm ci lalu npm run build.',
    'Salin hasil frontend/dist ke /var/www/undanganmanten/frontend-dist.',
    'Buat konfigurasi Nginx. Arahkan domain utama ke frontend-dist dan /api ke backend localhost:4000.',
    'Aktifkan site, tes Nginx, pasang HTTPS dengan Certbot, lalu simpan proses PM2 agar hidup lagi setelah reboot.',
])
code(doc,'cd /var/www/undanganmanten/backend\ncp .env.example .env\nnano .env\nnpm ci\nnpx prisma generate\nnpx prisma migrate deploy\npm2 start npm --name undanganmanten-api -- start\npm2 save\npm2 startup')
code(doc,'cd /var/www/undanganmanten/frontend\nnano .env.production\nnpm ci\nnpm run build\nmkdir -p /var/www/undanganmanten/frontend-dist\ncp -r dist/* /var/www/undanganmanten/frontend-dist/')
code(doc,'nano /etc/nginx/sites-available/undanganmanten\nln -s /etc/nginx/sites-available/undanganmanten /etc/nginx/sites-enabled/\nnginx -t\nsystemctl reload nginx')
para(doc,'Konfigurasi Nginx lengkap bergantung domain. Jangan membuka password database atau JWT secret di konfigurasi frontend. Jika memilih VPS, minta bantuan untuk konfigurasi firewall, backup, HTTPS, dan monitoring; bagian tersebut penting untuk keamanan.')
heading(doc,'7.4 Opsi C komputer pribadi plus Cloudflare Tunnel',2)
para(doc,'Opsi ini cocok untuk demo atau penggunaan sementara. Komputer rumah harus menyala, koneksi internet tidak putus, dan server lokal berjalan. Ini bukan pilihan ideal untuk pembayaran atau data tamu production.')
steps(doc,[
    'Jalankan backend: cd backend lalu npm run dev.',
    'Jalankan frontend di terminal kedua: cd frontend lalu npm run dev.',
    'Pastikan dashboard bisa dibuka di http://localhost:5173 dan backend sehat di http://localhost:4000/health.',
    'Install cloudflared dari dokumentasi Cloudflare, login dengan cloudflared tunnel login, lalu buat tunnel.',
    'Buat tunnel untuk frontend dan tunnel untuk backend, atau gunakan satu reverse proxy lokal. Jangan hanya membuka frontend; frontend tetap harus bisa menghubungi backend.',
    'Set VITE_API_BASE_URL ke URL tunnel backend, kemudian restart frontend. Set FRONTEND_URL backend ke URL tunnel frontend.',
    'Uji dari ponsel memakai jaringan seluler, bukan Wi-Fi rumah yang sama.',
])
code(doc,'# Terminal 1\ncd backend\nnpm run dev\n\n# Terminal 2\ncd frontend\nnpm run dev\n\n# Terminal 3 contoh tunnel sementara frontend\ncloudflared tunnel --url http://localhost:5173\n\n# Terminal 4 contoh tunnel sementara backend\ncloudflared tunnel --url http://localhost:4000')
heading(doc,'7.5 Checklist setelah deploy',2)
bullets(doc,[
    'Buka /health dan /ready backend.',
    'Buka login, buat satu undangan, ubah profil, lalu refresh.',
    'Upload satu foto dan cek URL gambarnya.',
    'Buka undangan publik dengan dan tanpa data tamu.',
    'Kirim RSVP dan ucapan percobaan.',
    'Uji Midtrans sandbox sebelum production.',
    'Simpan backup database sebelum migrasi besar.',
    'Pantau uptime /health dan /ready.',
])
doc.add_page_break()

heading(doc,'8. Panduan Darurat dan Troubleshooting',1)
heading(doc,'8.1 Aturan emas saat panik',2)
bullets(doc,[
    'Jangan langsung menghapus node_modules, database, atau file .env.',
    'Catat pesan error lengkap dan screenshot layar.',
    'Cek apakah error terjadi di laptop sendiri atau seluruh pengunjung.',
    'Cek /health dan /ready sebelum menyalahkan frontend.',
    'Bila baru deploy, bandingkan perubahan terakhir dan rollback ke deploy sebelumnya bila perlu.',
])
add_table(doc,['Gejala','Penyebab yang sering','Langkah pertama'],[
    ['Layar putih polos','Error JavaScript, build salah, route SPA tidak fallback','Buka Console browser; lihat error pertama; jalankan npm run build'],
    ['Dashboard berkata gagal terhubung server','VITE_API_BASE_URL salah atau backend mati','Buka URL backend /health; cek env frontend'],
    ['/health ok tetapi /ready gagal','Database tidak tersambung','Cek DATABASE_URL, status database, dan log backend'],
    ['Foto tidak muncul','R2 URL salah, CORS, path salah, bucket privat','Buka URL gambar langsung; cek R2_PUBLIC_URL dan resolveImageUrl'],
    ['Login langsung kembali ke login','Token tidak valid atau backend mengembalikan 401','Cek Console Network dan JWT_SECRET; logout lalu login kembali'],
    ['Tombol Save tidak bekerja','Endpoint salah, backend validasi menolak, token hilang','Buka Network browser; lihat request merah dan response error'],
    ['Deploy frontend berhasil tapi data lama','Build memakai env lama atau cache','Periksa environment deployment lalu redeploy; clear cache jika perlu'],
    ['Template tidak muncul','themeId belum terdaftar di empat tempat','Periksa PhonePreview, activeTheme, templateManifest, TemaPanel'],
    ['Card 3D tidak bisa diklik','Layer dekorasi menangkap klik','Pastikan dekorasi pointer-events none dan gunakan interaction layer'],
], [1.6,2.5,2.45])
heading(doc,'8.2 Membaca log tanpa takut',2)
para(doc,'Log adalah buku harian mesin. Cari baris pertama yang berwarna merah atau memuat Error. Jangan fokus pada 30 baris terakhir bila semuanya hanya akibat dari satu kesalahan awal. Backend production menulis request dalam bentuk JSON. Lihat requestId jika tersedia; itu adalah nomor tiket untuk melacak satu masalah.')
heading(doc,'8.3 Perintah cek aman',2)
code(doc,'# Dari root proyek\ngit status\nnpm run build\n\n# Cek backend lokal\ncurl http://localhost:4000/health\ncurl http://localhost:4000/ready\n\n# Cek proses Node di VPS\npm2 status\npm2 logs undanganmanten-api --lines 100')
heading(doc,'8.4 Jika database perlu diubah',2)
para(doc,'Jangan mengedit database langsung dari dashboard provider kecuali perubahan sangat kecil dan Anda mengerti dampaknya. Bentuk database didefinisikan di backend/prisma/schema.prisma. Untuk menambah kolom atau tabel, ubah schema lalu buat migrasi. Sebelum migrasi production, ambil backup. Migrasi adalah catatan resmi agar struktur database semua lingkungan tetap sama.')
heading(doc,'8.5 Jika API terputus setelah pindah domain',2)
steps(doc,[
    'Pastikan backend dapat dibuka melalui https://domain-api/health.',
    'Pastikan frontend environment memakai VITE_API_BASE_URL=https://domain-api/api.',
    'Pastikan backend environment memakai FRONTEND_URL=https://domain-frontend.',
    'Deploy ulang backend setelah mengubah FRONTEND_URL.',
    'Build/deploy ulang frontend setelah mengubah VITE_ variables.',
    'Buka DevTools -> Network dan lihat request API. Jika merah karena CORS, FRONTEND_URL backend salah atau tidak lengkap.',
])
doc.add_page_break()

heading(doc,'9. Rutinitas Aman Sebelum Mengubah Apa Pun',1)
heading(doc,'9.1 Rutinitas lima menit',2)
steps(doc,[
    'Buka terminal pada folder proyek dan jalankan git status. Jika banyak perubahan yang tidak Anda kenal, berhenti dan buat backup folder dahulu.',
    'Buat branch baru bila perubahan cukup besar: git switch -c nama-perubahan.',
    'Ubah satu file atau satu fitur kecil.',
    'Buka preview dan ambil screenshot sebelum/ sesudah.',
    'Jalankan npm run build bila perubahan menyentuh frontend.',
    'Commit perubahan dengan pesan jelas setelah hasil benar.',
])
heading(doc,'9.2 Contoh pesan commit yang baik',2)
code(doc,'git add frontend/src/components/templates/yunshui\ngit commit -m "fix yunshui quote portal size on mobile"\n\ngit add frontend/src/components/CeritaKhususPanel.jsx frontend/src/pages/Dashboard.jsx\ngit commit -m "feat add special story dashboard panel"')
heading(doc,'9.3 Hal yang tidak boleh dilakukan',2)
bullets(doc,[
    'Jangan jalankan git reset --hard hanya untuk menghilangkan error.',
    'Jangan menghapus database production untuk mencoba ulang.',
    'Jangan commit .env, password, token, atau file upload pribadi.',
    'Jangan deploy langsung ke production tanpa menguji build.',
    'Jangan mengubah schema Prisma tanpa backup database.',
    'Jangan menyalin CSS dari satu template ke semua template tanpa memeriksa konteks desainnya.',
])

heading(doc,'Lampiran A Daftar File Penting',1)
add_table(doc,['Tujuan','Path'],[
    ['Router aplikasi','frontend/src/App.jsx'],
    ['Dashboard dan sidepanel','frontend/src/pages/Dashboard.jsx'],
    ['Preview dan pemilih tema','frontend/src/components/PhonePreview.jsx'],
    ['Client API','frontend/src/api/client.js'],
    ['Alamat API dan URL gambar','frontend/src/config/env.js'],
    ['Data template aktif','frontend/src/utils/activeTheme.js'],
    ['Manifest template','frontend/src/components/templates/templateManifest.js'],
    ['Capability cover/animasi','frontend/src/config/templateCapabilities.js'],
    ['Yunshui','frontend/src/components/templates/yunshui/YunshuiTemplate.jsx'],
    ['Depth Lab','frontend/src/pages/DepthEngineLab.jsx'],
    ['Engine 3D','frontend/src/components/templates/depth-v2/'],
    ['Server backend','backend/src/server.js'],
    ['Endpoint undangan','backend/src/routes/invitationRoutes.js'],
    ['Controller backend','backend/src/controllers/'],
    ['Database schema','backend/prisma/schema.prisma'],
    ['Environment frontend','frontend/.env.example'],
    ['Environment backend','backend/.env.example'],
    ['Deployment cepat','DEPLOYMENT.md dan render.yaml'],
], [2.1,4.5])

heading(doc,'Lampiran B Kamus Istilah Pemula',1)
add_table(doc,['Istilah','Arti sederhana'],[
    ['Component','Potongan UI yang dapat dipakai ulang, seperti satu keping Lego.'],
    ['Props','Informasi yang diberikan komponen induk kepada komponen anak.'],
    ['State','Catatan sementara di layar sebelum data disimpan.'],
    ['Frontend','Bagian yang dilihat dan diklik pengguna.'],
    ['Backend','Bagian belakang yang menjalankan aturan dan mengelola data.'],
    ['API','Jalur komunikasi antara frontend dan backend.'],
    ['Endpoint','Alamat pintu API tertentu, misalnya /api/invitations.'],
    ['Database','Tempat penyimpanan data permanen.'],
    ['Prisma','Penerjemah antara kode backend dan database.'],
    ['Migration','Catatan resmi perubahan struktur database.'],
    ['Environment variable','Catatan konfigurasi rahasia atau alamat layanan, disimpan di luar kode.'],
    ['Build','Proses mengemas frontend agar siap dipublikasikan.'],
    ['Deploy','Mengirim versi web ke komputer internet/hosting.'],
    ['CORS','Aturan browser tentang frontend mana yang boleh berbicara dengan backend.'],
    ['R2','Gudang file online untuk gambar, musik, atau media.'],
    ['Depth Lab','Laboratorium acuan untuk pengalaman template 3D.'],
], [1.7,4.9])

para(doc,'Dokumen ini menjelaskan struktur yang terverifikasi dari repository saat dibuat. Bila ada perubahan besar pada arsitektur, endpoint, atau hosting, perbarui manual ini pada saat yang sama agar pengetahuan tidak hilang bersama percakapan AI.')

# Footer page number
for section in doc.sections:
    footer=section.footer.paragraphs[0]; footer.alignment=WD_ALIGN_PARAGRAPH.CENTER
    footer.add_run('UndanganManten - Panduan Pemeliharaan Master - ')
    fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); footer._p.append(fld)

doc.save(OUT)
print(OUT)
