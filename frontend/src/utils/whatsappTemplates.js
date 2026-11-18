const styles = {
  Netral: [
    '',
    'Dengan penuh sukacita, kami ingin berbagi kabar bahagia tentang pernikahan kami.',
    'Kehadiran dan doa restu Anda sangat berarti bagi kami. Terima kasih, dan sampai jumpa di hari bahagia kami.',
  ],
  Islam: [
    'Assalamu’alaikum warahmatullahi wabarakatuh.',
    'Dengan memohon rahmat dan rida Allah SWT, kami bermaksud menyelenggarakan pernikahan kami.',
    'Merupakan kebahagiaan bagi kami apabila Anda berkenan hadir dan mendoakan agar rumah tangga kami menjadi keluarga yang sakinah, mawaddah, dan rahmah.\n\nWassalamu’alaikum warahmatullahi wabarakatuh.',
  ],
  Kristen: [
    'Shalom.',
    'Dengan penuh syukur atas kasih dan penyertaan Tuhan, kami ingin berbagi sukacita pernikahan kami.',
    'Kami bersyukur jika Anda dapat hadir dan mendoakan perjalanan baru kami. Tuhan memberkati.',
  ],
  Katolik: [
    'Salam damai Kristus.',
    'Dengan syukur atas rahmat Tuhan, kami ingin berbagi sukacita saat mengucapkan janji pernikahan kami.',
    'Terima kasih atas kehadiran dan doa Anda bagi keluarga yang akan kami bangun bersama. Semoga damai Kristus menyertai kita semua.',
  ],
  Hindu: [
    'Om Swastiastu.',
    'Dengan memohon anugerah Ida Sang Hyang Widhi Wasa, kami bersyukur dapat berbagi kabar bahagia tentang pernikahan kami.',
    'Kehadiran dan doa restu Anda merupakan kehormatan bagi kami dan keluarga.\n\nOm Santih, Santih, Santih Om.',
  ],
  Buddha: [
    'Namo Buddhaya.',
    'Dengan penuh sukacita dan rasa syukur, kami ingin berbagi kabar bahagia tentang pernikahan kami.',
    'Terima kasih atas kehadiran dan doa baik Anda untuk perjalanan kami bersama. Semoga semua makhluk berbahagia.',
  ],
};

export const whatsappTemplates = Object.fromEntries(
  Object.entries(styles).map(([label, [greeting, opening, closing]]) => [label, [
    greeting,
    'Kepada Yth. [Nama Tamu],',
    opening + ' Dengan hormat, kami mengundang Anda untuk hadir dan merayakan hari bahagia ini bersama kami.',
    'Waktu, lokasi, dan rangkaian acara dapat dilihat melalui tautan undangan berikut.',
    '[Link Undangan]',
    closing,
  ].filter(Boolean).join('\n\n')]),
);
