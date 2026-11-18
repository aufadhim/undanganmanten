import {framePhotoRect} from './photoFrame.js';

export function drawPhotoStrip(ctx, frame, photos, invitation, zoom, x, y) {
 const width = 800, height = 1200;
 ctx.fillStyle = '#f6f0e4';
 ctx.fillRect(0, 0, width, height);
 ctx.drawImage(frame, 0, 0, width, height);
 // Use the existing themed artwork as the printed surface of the cover.
 const grain = ctx.createImageData(800, 1200);
 let seed = 73;
 for (let i = 0; i < grain.data.length; i += 4) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const tone = seed & 128 ? 255 : 44;
  grain.data.set([tone, tone, tone, (seed >>> 24) % 13], i);
 }
 const texture = ctx.canvas.ownerDocument.createElement('canvas');
 texture.width = width;
 texture.height = height;
 texture.getContext('2d').putImageData(grain, 0, 0);
 ctx.drawImage(texture, 0, 0);

 const bevel = ctx.createLinearGradient(0, 0, width, height);
 bevel.addColorStop(0, '#fff9e8');
 bevel.addColorStop(.4, '#ffffff45');
 bevel.addColorStop(1, '#302619a6');
 ctx.strokeStyle = bevel;
 ctx.lineWidth = 12;
 ctx.strokeRect(6, 6, width - 12, height - 12);
 ctx.strokeStyle = '#44352355';
 ctx.lineWidth = 2;
 ctx.strokeRect(15, 15, width - 30, height - 30);

 for (const [index, top] of [88, 535].entries()) {
  const left = 66, w = 668, h = 421;
  ctx.fillStyle = '#e7dfce';
  ctx.fillRect(left, top, w, h);
  const image = photos[index] || photos[0];
  if (image) {
  const rect = framePhotoRect(image.width, image.height, w, h, zoom, x, y);
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, w, h);
  ctx.clip();
  ctx.drawImage(image, left + rect.x, top + rect.y, rect.width, rect.height);
  ctx.restore();
  }
  const recess = ctx.createLinearGradient(0, top, 0, top + 24);
  recess.addColorStop(0, '#30261975');
  recess.addColorStop(1, '#30261900');
  ctx.fillStyle = recess;
  ctx.fillRect(left, top, w, 24);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#3b30245e';
  ctx.strokeRect(left, top, w, h);
  ctx.fillStyle = '#fff9e6aa';
  ctx.fillRect(left, top + h, w, 3);
 }
 const profile = invitation?.coupleProfile;
 const names = [profile?.brideName, profile?.groomName].filter(Boolean).join(' & ');
 const date = new Date(invitation?.weddingDate || invitation?.events?.[0]?.date || '');
 ctx.fillStyle = '#fffaf0';
 ctx.save();
 ctx.shadowColor = '#3b2b2455';
 ctx.shadowBlur = 12;
 ctx.shadowOffsetY = 5;
 ctx.fillRect(66, 983, 668, 150);
 ctx.restore();
 ctx.strokeStyle = '#8a745569';
 ctx.lineWidth = 2;
 ctx.strokeRect(73, 990, 654, 136);
 ctx.fillStyle = '#344337';
 ctx.textAlign = 'center';
 ctx.font = '24px Georgia';
 ctx.fillText('Samavaya', 400, 57, 650);
 ctx.font = '42px Georgia';
 ctx.fillText(names || 'Kenangan Pernikahan', 400, 1047, 635);
 if (!Number.isNaN(date.getTime())) {
  ctx.font = '24px Georgia';
  ctx.fillText(new Intl.DateTimeFormat('id-ID', {dateStyle:'long',timeZone:'Asia/Jakarta'}).format(date), 400, 1095);
 }
}
