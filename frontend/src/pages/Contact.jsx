import { Link } from 'react-router-dom';
import DocumentLayout from '../components/atelier/DocumentLayout.jsx';
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '../config/support.js';
import './guide.css';

export default function Contact() {
  return <DocumentLayout title="Kontak Samavaya" intro="Hubungi kami untuk bantuan undangan, pembayaran, atau akses akun.">
    <div className="sam-guide">
      <div className="contact-channels">
        <section><h2>WhatsApp</h2><a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer">0851-2805-0685</a></section>
        <section><h2>Email</h2><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></section>
      </div>
      <p>Untuk kendala pembayaran, sertakan nomor transaksi dan email akun. Simpan kata sandi dan kode verifikasi untuk dirimu sendiri.</p>
      <Link to="/guide">Buka Panduan Samavaya</Link>
    </div>
  </DocumentLayout>;
}
