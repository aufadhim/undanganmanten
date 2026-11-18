import { useState } from 'react';
import { api } from '../../api/client.js';

export default function AccountProfile({ account, onUpdated, onLogout }) {
  const [action, setAction] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function choose(next) {
    setAction(next);
    setError('');
    setNotice('');
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      if (action === 'phone') {
        const { data } = await api.patch('/auth/me', { phone: fields.get('phone') });
        onUpdated({ ...account, ...data.user });
        setNotice('Nomor telepon disimpan.');
      } else if (action === 'password') {
        if (fields.get('newPassword') !== fields.get('repeatPassword')) {
          setError('Konfirmasi kata sandi baru belum cocok.');
          return;
        }
        await api.post('/auth/change-password', {
          oldPassword: fields.get('oldPassword'), newPassword: fields.get('newPassword'),
        });
        setNotice('Kata sandi berhasil diubah.');
      } else if (action === 'delete') {
        const confirmationEmail = fields.get('confirmationEmail').trim();
        if (confirmationEmail.toLowerCase() !== account.email.toLowerCase()) {
          setError('Alamat email yang diketik belum cocok.');
          return;
        }
        await api.delete('/auth/delete-account', { data: { confirmationEmail } });
        onLogout();
      }
      setAction('');
    } catch (err) {
      setError(err.response?.data?.error || 'Perubahan belum berhasil. Coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <p className="workspace-subtitle">Akun yang sedang digunakan untuk mengelola undangan dan pernikahan.</p>
    <dl>
      <div><dt>Email akun</dt><dd>{account.email}</dd></div>
      <div className="workspace-account-phone-row"><dt>Nomor telepon</dt><dd className="workspace-account-phone">
        <span>{account.phone || 'Belum diisi'}</span>
        <button type="button" className="workspace-account-edit" aria-label="Edit nomor telepon" title="Edit nomor telepon" aria-expanded={action === 'phone'} disabled={busy} onClick={() => choose(action === 'phone' ? '' : 'phone')}>
          <i className="fa-solid fa-pen" aria-hidden="true" />
        </button>
      </dd></div>
      <div><dt>Peran akun</dt><dd>{account.role === 'ADMIN' ? 'Administrator' : 'Pengguna'}</dd></div>
      <div><dt>Status email</dt><dd>{account.isVerified ? 'Terverifikasi' : 'Belum terverifikasi'}</dd></div>
      <div><dt>Terdaftar sejak</dt><dd>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(account.createdAt))}</dd></div>
    </dl>
    <div className="workspace-profile-actions">
      {account.hasPassword && <button type="button" className="workspace-profile-password" disabled={busy} aria-expanded={action === 'password'} onClick={() => choose(action === 'password' ? '' : 'password')}><i className="fa-solid fa-key" aria-hidden="true" /><span>Ganti kata sandi</span><i className="fa-solid fa-chevron-right" aria-hidden="true" /></button>}
      {account.role !== 'ADMIN' && <button type="button" className="workspace-account-danger workspace-profile-delete" aria-expanded={action === 'delete'} disabled={busy} onClick={() => choose('delete')}>Hapus akun</button>}
    </div>
    {account.role === 'ADMIN' && <p className="workspace-subtitle">Alihkan peran administrator sebelum menghapus akun ini.</p>}
    {notice && <p role="status">{notice}</p>}
    {action && <form key={action} className="workspace-account-form" onSubmit={submit}>
      {action === 'phone' && <label>Nomor telepon<input type="tel" name="phone" autoComplete="tel" maxLength={30} defaultValue={account.phone || ''} /></label>}
      {action === 'password' && <>
        <label>Kata sandi saat ini<input name="oldPassword" type="password" autoComplete="current-password" required /></label>
        <label>Kata sandi baru<input name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></label>
        <label>Ulangi kata sandi baru<input name="repeatPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></label>
      </>}
      {action === 'delete' && <>
        <p>Penghapusan ini permanen. Undangan dan data terkait akan ikut terhapus. Ketik <strong>{account.email}</strong> untuk mengonfirmasi.</p>
        <label>Email akun<input name="confirmationEmail" type="email" autoComplete="off" required /></label>
      </>}
      {error && <p role="alert">{error}</p>}
      <div className="workspace-actions">
        <button type="submit" disabled={busy} className={action === 'delete' ? 'workspace-account-danger' : 'workspace-primary'}>{busy ? 'Memproses…' : action === 'delete' ? 'Hapus akun permanen' : 'Simpan'}</button>
        <button type="button" disabled={busy} onClick={() => choose('')}>Batal</button>
      </div>
    </form>}
  </>;
}
