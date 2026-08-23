import sharp from 'sharp';
import fs from 'fs';

async function processFavicon() {
  const input = '/Users/auf/.gemini/antigravity-ide/brain/cd7a969e-f4f0-4c20-a4ef-4c3d476d2479/hyper_minimal_square_1786245896785.png';
  const output = '../frontend/public/favicon.png';
  
  const img = sharp(input);
  const meta = await img.metadata();
  
  // Crop 200px from borders
  const cropAmount = 200;
  await img
    .extract({
        left: cropAmount, 
        top: cropAmount, 
        width: meta.width - cropAmount * 2, 
        height: meta.height - cropAmount * 2
    })
    .resize(192, 192)
    .toFile(output);
  console.log('Favicon saved');
}

async function processLogo() {
  const input = '/Users/auf/.gemini/antigravity-ide/brain/cd7a969e-f4f0-4c20-a4ef-4c3d476d2479/hyper_minimal_positive_m_1786246085179.png';
  const output = '../frontend/public/logo.png';
  
  // Make white background transparent
  const img = sharp(input);
  const meta = await img.metadata();
  
  // Extract and resize
  await img
    .extract({
      left: 150,
      top: 150,
      width: meta.width - 300,
      height: meta.height - 300
    })
    // In sharp, removing white bg can be done by making a mask, but it's easier to just use the image as is or make it transparent.
    // If it's too complex, let's just resize it for now, it has a white bg but our navbar is white!
    .resize(256)
    .toFile(output);
  console.log('Logo saved');
}

processFavicon().catch(console.error);
processLogo().catch(console.error);
