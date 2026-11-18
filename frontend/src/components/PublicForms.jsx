import {DUMMY_WISHES} from '../config/dummyPreviewData.js';
import {QRCodeSVG} from 'qrcode.react';import GiftDetails from './templates/shared/GiftDetails.jsx';import GuestConfirmation from './templates/shared/GuestConfirmation.jsx';
export default function PublicForms({invitation,previewGuest,formType='all',previewMode=false,hideSectionTitle=false, replyCard=false}){
 if(!invitation)return null;const rsvp=invitation.invitationFeatures?.rsvpEnabled!==false;
 // The RSVP scene owns the unified form. A separate wishes scene is used only when RSVP is off.
 if((formType==='wishes'&&rsvp)||(formType==='rsvp'&&!rsvp))return null;
 const displayInvitation=previewMode&&!invitation.wishes?.length?{...invitation,wishes:DUMMY_WISHES}:invitation;
 return <div className="public-forms-root" style={{width:'100%',boxSizing:'border-box',padding:'0 12px'}}>{previewGuest&&formType!=='wishes'&&(invitation.entitlements?.qrGuestbook||invitation.orders?.some(o=>o.status==='SUCCESS'&&o.addons?.includes('QR_GUESTBOOK')))&&<div style={{textAlign:'center',marginBottom:20}}><QRCodeSVG value={`${location.origin}/dashboard?section=guests&invitation=${invitation.id}&checkin=${previewGuest.id}`} size={130} title={`QR check-in ${previewGuest.name}`}/><p>Tunjukkan kode ini kepada penerima tamu.</p></div>}<GuestConfirmation invitation={displayInvitation} guest={previewGuest} previewMode={previewMode} hideTitle={hideSectionTitle} replyCard={replyCard}/></div>
}
export function GiftSection({gift,hideTitle=false}){return <GiftDetails gift={gift} hideTitle={hideTitle}/>}
