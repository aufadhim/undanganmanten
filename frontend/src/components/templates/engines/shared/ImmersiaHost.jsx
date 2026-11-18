import LoadingScreen from '../../../atelier/LoadingScreen.jsx';
import './immersia-preview-state.css';
import {getTemplate} from '../../../../config/templateRegistry.js';
import {loadCharacterRender} from '../../../../utils/characterRenderCache.js';
import ImmersiaConfirmation from '../../shared/ImmersiaConfirmation.jsx';
import ImmersiaGift from '../../shared/ImmersiaGift.jsx';
import ImmersiaPhotoFrame from '../../shared/ImmersiaPhotoFrame.jsx';
import ImmersiaLivestream from '../../shared/ImmersiaLivestream.jsx';
import Lightbox from '../../shared/Lightbox.jsx';
import ImmersiaSaveTheDate from '../../shared/ImmersiaSaveTheDate.jsx';
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../../../../api/client.js";
import { createGardenPayload } from "./adapter.js";

export default function ImmersiaHost({
  invitation,
  previewGuest,
  editorPreview = false,
  scenePack,
  entryPath = "/templates/viridarium/index.html",
  templateName = "Viridarium",
}) {
  const [galleryIndex,setGalleryIndex]=useState(null);
  const registeredTemplate=getTemplate(invitation?.themeId);
  templateName=registeredTemplate?.name||templateName;
  entryPath=registeredTemplate?.entryPath||entryPath;
  const frame = useRef(null),
    qr = useRef(null),
    latest = useRef(null),
    [ready, setReady] = useState(false),
    [problem, setProblem] = useState(""),
    [reload, setReload] = useState(0);
  const sourcePayload = useMemo(
    () =>
      createGardenPayload(invitation, previewGuest, editorPreview, scenePack),
    [invitation, previewGuest, editorPreview, scenePack],
  );
  const sourceKey=JSON.stringify([invitation.id,invitation.themeSettings?.coverImageUrl||invitation.themeSettings?.coverSecondImageUrl]);
  const localArt=invitation.id==='sandbox'&&/^data:image\/(?:png|jpeg|webp);base64,/i.test(invitation.themeSettings?.coverImageUrl||invitation.themeSettings?.coverSecondImageUrl||'');
  const needsRenderAssets=editorPreview&&!localArt&&invitation.themeSettings?.characterSettings?.mode!=='default'&&Boolean(invitation.themeSettings?.coverImageUrl||invitation.themeSettings?.coverSecondImageUrl);
  const [renderAssets,setRenderAssets]=useState(null);
  useEffect(()=>{if(!needsRenderAssets)return;let cancelled=false;loadCharacterRender(sourceKey,()=>api.get('/themes/character-assets',{params:{invitationId:invitation.id,coverImageUrl:invitation.themeSettings?.coverImageUrl||invitation.themeSettings?.coverSecondImageUrl||'',separatePose:'false'},headers:{'x-invitation-id':invitation.id}})).then(({data})=>{if(!cancelled)setRenderAssets({key:sourceKey,assets:data.assets})}).catch(()=>{if(!cancelled)setProblem('Ilustrasi belum bisa dimuat. Coba muat ulang pratinjau.')});return()=>{cancelled=true}},[sourceKey,needsRenderAssets,reload]);
  const waitingForArt=needsRenderAssets&&renderAssets?.key!==sourceKey;
  const payload=useMemo(()=>!needsRenderAssets||waitingForArt?sourcePayload:{...sourcePayload,config:{...sourcePayload.config,assets:{...sourcePayload.config.assets,...renderAssets.assets}}},[sourcePayload,renderAssets,needsRenderAssets,waitingForArt]);
  latest.current = { payload, invitation, previewGuest, editorPreview };
  const hasQr = Boolean(
    previewGuest?.id &&
    (invitation.entitlements?.qrGuestbook||invitation.orders?.some((order) => order.status==='SUCCESS'&&order.addons?.includes("QR_GUESTBOOK"))),
  );
  const withQr = (value) => ({
    ...value,
    qrImage: qr.current?.querySelector("svg")
      ? "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(qr.current.querySelector("svg").outerHTML)
      : "",
  });
  const assetSignature=Object.fromEntries(Object.entries(payload.config.assets).map(([key,value])=>[key,typeof value==='string'&&value.startsWith('data:image/')?sourceKey:value]));
  const artworkKey = JSON.stringify(assetSignature);
  useEffect(() => {
    setReady(false);
    setProblem("");
  }, [artworkKey]);
  useEffect(() => {
    const send = () =>
      frame.current?.contentWindow?.postMessage(
        { type: "garden:configure", payload: withQr(latest.current.payload) },
        location.origin,
      );
    async function receive(event) {
      if (
        event.origin !== location.origin ||
        event.source !== frame.current?.contentWindow
      )
        return;
      const m = event.data;
      if(m?.type==='garden:gallery'){
        if(Number.isInteger(m.index)&&m.index>=0&&m.index<(latest.current.payload.gallery?.length||0))setGalleryIndex(m.index);
        return;
      }
      if (m?.type === "garden:scene") {
        window.dispatchEvent(
          new CustomEvent("invitation:scene", { detail: m.scene }),
        );
        return;
      }
      if (m?.type === "garden:ready") {
        send();
        return;
      }
      if (m?.type === "garden:loaded") {
        setReady(true);
        setProblem("");
        return;
      }
      if (m?.type === "garden:failed") {
        setReady(false);
        setProblem(
          "Pratinjau taman belum bisa dimuat. Muat ulang untuk mencoba lagi.",
        );
        return;
      }
      if (m?.type !== "garden:submit") return;
      const {
        payload: current,
        invitation: inv,
        previewGuest: guest,
        editorPreview: preview,
      } = latest.current;
      const reply = (ok, message) =>
        event.source.postMessage(
          { type: "garden:result", requestId: m.requestId, ok, message },
          location.origin,
        );
      try {
        const p = m.payload || {};
        if (
          typeof p.name !== "string" ||
          !p.name.trim() ||
          p.name.length > 80 ||
          !["Hadir", "Tidak hadir"].includes(p.attendance) ||
          !Number.isInteger(p.count) ||
          p.count < 0 ||
          p.count > (guest?.paxLimit || 2) ||
          typeof p.message !== "string" ||
          p.message.length > 500
        )
          throw Error("Periksa nama, kehadiran, dan jumlah tamu.");
        if (preview) {
          reply(
            true,
            "Simulasi berhasil. Pratinjau tidak mengirim data ke mempelai.",
          );
          return;
        }
        const root = `/invitations/public/${encodeURIComponent(inv.slug)}`,
          suffix = guest?.id ? `?g=${encodeURIComponent(guest.linkToken || guest.id)}` : "";
        await api.post(root + "/confirmation" + suffix, {name:p.name.trim(),attending:p.attendance==='Hadir',guestCount:p.attendance==='Hadir'?p.count:0,message:p.message});
        reply(true,'Konfirmasi berhasil dikirim.');
      } catch (error) {
        reply(
          false,
          error.response?.data?.error ||
            error.message ||
            "Belum terkirim. Silakan coba lagi.",
        );
      }
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  const contentSignature=JSON.stringify({...payload,config:{...payload.config,assets:assetSignature,layout:null,cameras:null}});
  const lastContentSignature=useRef(null);
  useEffect(()=>{if(!ready)return;const same=lastContentSignature.current===contentSignature;frame.current?.contentWindow?.postMessage(same?{type:'garden:placement',layout:payload.config.layout,cameras:payload.config.cameras}:{type:'garden:configure',payload:withQr(payload)},location.origin);lastContentSignature.current=contentSignature},[payload,ready,contentSignature]);
  useEffect(()=>{const show=e=>frame.current?.contentWindow?.postMessage({type:'garden:placement-view',side:e.detail},location.origin);window.addEventListener('invitation:placement-view',show);return()=>window.removeEventListener('invitation:placement-view',show)},[]);
  return (
    <div
      className="garden-canvas-template"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "100%",
        background: "#efeddf",
      }}
    >
      {hasQr && (
        <div ref={qr} style={{ display: "none" }}>
          <QRCodeSVG
            value={`${location.origin}/dashboard?checkin=${encodeURIComponent(previewGuest.id)}`}
            size={160}
            level="M"
          />
        </div>
      )}
      {ready&&galleryIndex!==null&&<Lightbox mediaList={payload.gallery} initialIndex={galleryIndex} onClose={()=>setGalleryIndex(null)} portalTarget={frame.current?.contentDocument?.body}/>}
      {!ready && (
        <div className="immersia-preview-state" role={problem ? "alert" : undefined}>
          <div className="immersia-preview-state-copy">
            {problem ? (
              <>
                <strong>{editorPreview ? "Pratinjau belum bisa dimuat" : "Undangan belum bisa dimuat"}</strong>
                <p>{problem.includes("Ilustrasi") ? "Ilustrasi belum berhasil dimuat." : "Coba muat ulang untuk menyiapkan tampilan."}</p>
                <button type="button" onClick={() => { setProblem(""); setReload((n) => n + 1); }}>
                  Muat ulang
                </button>
              </>
            ) : <LoadingScreen compact label={editorPreview ? "Mempersiapkan taman cerita kalian…" : "Memuat undangan…"} />}
          </div>
        </div>
      )}
      <ImmersiaConfirmation frame={frame} ready={ready&&!waitingForArt} invitation={invitation} guest={previewGuest} previewMode={editorPreview}/>
      <ImmersiaGift frame={frame} ready={ready&&!waitingForArt} gift={invitation.giftSettings||{}}/>
      <ImmersiaPhotoFrame invitation={invitation} themeId={invitation.themeId} frame={frame} ready={ready&&!waitingForArt} frameUrl={invitation.themeSettings?.igFilterImageUrl}/>
      <ImmersiaLivestream frame={frame} ready={ready&&!waitingForArt} settings={invitation.livestreamSettings||{}}/>
      <ImmersiaSaveTheDate frame={frame} ready={ready&&!waitingForArt} event={payload.config.event} identity={payload.config.identity}/>
      {!waitingForArt&&<iframe
        key={artworkKey + reload}
        ref={frame}
        src={`${entryPath}${entryPath.includes('?')?'&':'?'}host=20261114-music&publicFullscreen=${editorPreview?0:1}&reload=${reload}`}
        title={`Undangan ${templateName}`}
        sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"
        allow="autoplay; fullscreen"
        style={{
          position: "absolute",
          inset: 0,
          border: 0,
          width: "100%",
          height: "100%",
          opacity: ready ? 1 : 0,
          pointerEvents: ready ? 'auto' : 'none',
          transition: "opacity .5s",
        }}
      />}
    </div>
  );
}
