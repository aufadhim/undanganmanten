import Brand from '../components/atelier/Brand.jsx';
import {useEffect,useState,useMemo} from 'react';
import axios from 'axios';
import {API_BASE_URL} from '../config/env.js';
import GuestCheckIn from '../components/GuestCheckIn.jsx';
export default function GuestDesk(){
 const[token]=useState(()=>{const fragment=location.hash.slice(1);if(/^[a-f0-9]{64}$/.test(fragment)){return fragment}try{return sessionStorage.getItem('um_guestdesk')||''}catch{return ''}});
 const[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 // Dedicated client: never attaches the owner's login token, and never logs out the owner.
 const client=useMemo(()=>axios.create({baseURL:API_BASE_URL,timeout:20000,headers:{'x-guestdesk-token':token}}),[token]);
 async function load(){if(!token){setError('Buka tautan petugas dari pemilik undangan.');return}setLoading(true);try{const r=await client.get('/guest-desk/session');setData(r.data);setError('')}catch(e){setData(null);setError(e.response?.data?.error||'Buku tamu belum dapat dimuat. Periksa koneksi.')}finally{setLoading(false)}}
 useEffect(()=>{load();const timer=setInterval(load,30000);return()=>clearInterval(timer)},[client]);
 const profile=data?.invitation?.coupleProfile;
 const couple=[profile?.brideName,profile?.groomName].filter(Boolean).join(' & ');
 return <main className="guest-desk-page">
   <header className="guest-desk-banner">
     <Brand />
     <h1>{couple || "Meja penerima tamu"}</h1>{couple && <p className="guest-desk-eyebrow">Meja penerima tamu</p>}
     <p>Pindai QR atau cari nama untuk mencatat kedatangan.</p>
   </header>
   <div className="guest-desk-workspace">
     <div className="guest-desk-refresh">
       <button type="button" disabled={loading || !token} onClick={load}>{loading ? 'Memuat…' : 'Muat ulang daftar'}</button>
     </div>
     {error && <p className="guest-hub-note" role="alert">{error}</p>}
     {data && <GuestCheckIn invitation={data.invitation} guests={data.guests} enabled staffClient={client}
       onUpdated={guest=>setData(current=>current&&({...current,guests:current.guests.map(row=>row.id===guest.id?{...row,...guest}:row)}))}/>}
   </div>
 </main>;
}