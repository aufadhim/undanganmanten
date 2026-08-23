import sharp from 'sharp';
import fs from 'fs';

async function processFavicon() {
  const input = '/Users/auf/.gemini/antigravity-ide/brain/cd7a969e-f4f0-4c20-a4ef-4c3d476d2479/elegant_ribbon_logo_1786246991783.png';
  const output = '../frontend/public/favicon.png';
  
  const img = sharp(input);
  const meta = await img.metadata();
  
  // Crop a bit around the ribbon for favicon
  await img
    .extract({
        left: 200, 
        top: 200, 
        width: meta.width - 400, 
        height: meta.height - 400
    })
    .resize(192, 192)
    .toFile(output);
  console.log('Favicon saved');
}

async function processLogo() {
  const input = '/Users/auf/.gemini/antigravity-ide/brain/cd7a969e-f4f0-4c20-a4ef-4c3d476d2479/elegant_ribbon_logo_1786246991783.png';
  const output = '../frontend/public/logo.png';
  
  const img = sharp(input);
  const meta = await img.metadata();
  
  await img
    .extract({
      left: 150,
      top: 150,
      width: meta.width - 300,
      height: meta.height - 300
    })
    .resize(256)
    .toFile(output);
  console.log('Logo saved');
}

processFavicon().catch(console.error);
processLogo().catch(console.error);
