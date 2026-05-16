/**
 * Generate PWA icons from the logo.
 * Creates square icons with the logo centered on a warm cream background.
 *
 * Usage: npx tsx src/scripts/generateIcons.ts
 */
import sharp from 'sharp';
import { resolve } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const bgColor = { r: 250, g: 245, b: 239, alpha: 1 }; // --color-warm-cream

async function generate() {
  const logoBuffer = await sharp(resolve('public/images/logo.png'))
    .resize(300, undefined, { fit: 'inside' })
    .toBuffer();

  const logoMeta = await sharp(logoBuffer).metadata();

  for (const size of sizes) {
    // Create square background with centered logo
    const padding = Math.round(size * 0.15);
    const logoWidth = size - padding * 2;
    const resizedLogo = await sharp(logoBuffer)
      .resize(logoWidth, undefined, { fit: 'inside' })
      .toBuffer();

    const resizedMeta = await sharp(resizedLogo).metadata();
    const top = Math.round((size - (resizedMeta.height || 0)) / 2);
    const left = Math.round((size - (resizedMeta.width || 0)) / 2);

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: bgColor,
      },
    })
      .composite([{ input: resizedLogo, top, left }])
      .png()
      .toFile(resolve(`public/icons/icon-${size}x${size}.png`));

    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Also generate maskable icon (with more padding for safe zone)
  const maskableSize = 512;
  const maskablePadding = Math.round(maskableSize * 0.25);
  const maskableLogoWidth = maskableSize - maskablePadding * 2;
  const maskableLogo = await sharp(logoBuffer)
    .resize(maskableLogoWidth, undefined, { fit: 'inside' })
    .toBuffer();

  const maskableMeta = await sharp(maskableLogo).metadata();
  const maskableTop = Math.round((maskableSize - (maskableMeta.height || 0)) / 2);
  const maskableLeft = Math.round((maskableSize - (maskableMeta.width || 0)) / 2);

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: bgColor,
    },
  })
    .composite([{ input: maskableLogo, top: maskableTop, left: maskableLeft }])
    .png()
    .toFile(resolve('public/icons/maskable-512x512.png'));

  console.log('Generated: maskable-512x512.png');

  // Generate apple-touch-icon
  const appleSize = 180;
  const applePadding = Math.round(appleSize * 0.15);
  const appleLogoWidth = appleSize - applePadding * 2;
  const appleLogo = await sharp(logoBuffer)
    .resize(appleLogoWidth, undefined, { fit: 'inside' })
    .toBuffer();

  const appleMeta = await sharp(appleLogo).metadata();
  const appleTop = Math.round((appleSize - (appleMeta.height || 0)) / 2);
  const appleLeft = Math.round((appleSize - (appleMeta.width || 0)) / 2);

  await sharp({
    create: {
      width: appleSize,
      height: appleSize,
      channels: 4,
      background: bgColor,
    },
  })
    .composite([{ input: appleLogo, top: appleTop, left: appleLeft }])
    .png()
    .toFile(resolve('public/icons/apple-touch-icon.png'));

  console.log('Generated: apple-touch-icon.png');

  console.log('\nDone!');
}

generate().catch(console.error);
