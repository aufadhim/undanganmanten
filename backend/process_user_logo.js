import sharp from 'sharp';

async function processUserLogo() {
  const input = '/Users/auf/.gemini/antigravity-ide/brain/cd7a969e-f4f0-4c20-a4ef-4c3d476d2479/media__1786248957359.png';
  const logoOutput = '../frontend/public/logo.png';
  const faviconOutput = '../frontend/public/favicon.png';
  
  const meta = await sharp(input).metadata();
  
  const cx = Math.floor(meta.width / 2);
  const cy = Math.floor(meta.height / 2);
  const boxSize = 400; 
  
  // Just extract and resize
  const centerExtracted = await sharp(input).extract({
    left: cx - (boxSize / 2),
    top: cy - (boxSize / 2),
    width: boxSize,
    height: boxSize
  }).toBuffer();
  
  await sharp(centerExtracted)
    .resize({ width: 256, withoutEnlargement: true })
    .toFile(logoOutput);
    
  await sharp(centerExtracted)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile(faviconOutput);
    
  console.log('User logo processed and saved!');
}

processUserLogo().catch(console.error);
