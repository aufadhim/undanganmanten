import sharp from 'sharp';

async function fixFavicon() {
  const input = '/Users/auf/.gemini/antigravity-ide/brain/cd7a969e-f4f0-4c20-a4ef-4c3d476d2479/media__1786248957359.png';
  const output = '../frontend/public/favicon.png';
  
  const trimmedBuffer = await sharp(input)
    .trim({ threshold: 240 })
    .toBuffer();
    
  await sharp(trimmedBuffer)
    .resize(192, 192, { 
       fit: 'contain', 
       background: { r: 255, g: 255, b: 255, alpha: 1 } 
    })
    .toFile(output);
    
  console.log('Fixed favicon!');
}

fixFavicon().catch(console.error);
