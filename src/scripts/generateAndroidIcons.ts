/**
 * Generate Android launcher icons for Capacitor.
 * Usage: npx tsx src/scripts/generateAndroidIcons.ts
 */
import sharp from 'sharp';
import { resolve } from 'path';

const bgColor = { r: 250, g: 245, b: 239, alpha: 1 };

const mipmapSizes: Record<string, number> = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Foreground icons for adaptive icons (108dp with 72dp safe zone)
const foregroundSizes: Record<string, number> = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

async function generate() {
  const logoBuffer = await sharp(resolve('public/images/logo.png')).toBuffer();
  const resDir = resolve('android/app/src/main/res');

  for (const [folder, size] of Object.entries(mipmapSizes)) {
    const padding = Math.round(size * 0.12);
    const logoWidth = size - padding * 2;
    const resizedLogo = await sharp(logoBuffer)
      .resize(logoWidth, undefined, { fit: 'inside' })
      .toBuffer();
    const meta = await sharp(resizedLogo).metadata();
    const top = Math.round((size - (meta.height || 0)) / 2);
    const left = Math.round((size - (meta.width || 0)) / 2);

    // ic_launcher.png
    await sharp({
      create: { width: size, height: size, channels: 4, background: bgColor },
    })
      .composite([{ input: resizedLogo, top, left }])
      .png()
      .toFile(resolve(resDir, folder, 'ic_launcher.png'));

    // ic_launcher_round.png (same for now)
    await sharp({
      create: { width: size, height: size, channels: 4, background: bgColor },
    })
      .composite([{ input: resizedLogo, top, left }])
      .png()
      .toFile(resolve(resDir, folder, 'ic_launcher_round.png'));

    console.log(`Generated: ${folder}/ic_launcher.png (${size}x${size})`);
  }

  // Foreground icons for adaptive icons
  for (const [folder, size] of Object.entries(foregroundSizes)) {
    const padding = Math.round(size * 0.25);
    const logoWidth = size - padding * 2;
    const resizedLogo = await sharp(logoBuffer)
      .resize(logoWidth, undefined, { fit: 'inside' })
      .toBuffer();
    const meta = await sharp(resizedLogo).metadata();
    const top = Math.round((size - (meta.height || 0)) / 2);
    const left = Math.round((size - (meta.width || 0)) / 2);

    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: resizedLogo, top, left }])
      .png()
      .toFile(resolve(resDir, folder, 'ic_launcher_foreground.png'));

    console.log(`Generated: ${folder}/ic_launcher_foreground.png (${size}x${size})`);
  }

  console.log('\nDone!');
}

generate().catch(console.error);
