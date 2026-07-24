const sharp = require('sharp');
const path = require('path');

const userUploadedDir = 'C:\\Users\\Sanchit Gupta\\.gemini\\antigravity\\brain\\bedca0a7-962d-4e1a-83f0-3cba7587863c\\.user_uploaded';

const realScreenshots = [
  'media__1784791464916.png',
  'media__1784791472797.png',
  'media__1784791478637.png',
  'media__1784791484916.png',
  'media__1784791489570.png',
];

async function resizeRealScreenshots() {
  for (let i = 0; i < realScreenshots.length; i++) {
    const inputPath = path.join(userUploadedDir, realScreenshots[i]);
    const outputPath = `public/webflow-screenshot-${i + 1}.png`;

    await sharp(inputPath)
      .resize(1280, 846, {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3
      })
      .png({ quality: 100, compressionLevel: 6 })
      .toFile(outputPath);

    console.log(`✅ Resized real UI screenshot ${i + 1}: ${outputPath} (1280x846)`);
  }
}

resizeRealScreenshots().catch(console.error);
