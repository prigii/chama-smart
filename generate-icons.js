const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512, 180];
const sourceImage = path.join(__dirname, 'public', 'icon.png');
const outputDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('Generating PWA icons from icon.png...\n');

  try {
    // Check if source image exists
    if (!fs.existsSync(sourceImage)) {
      console.error('Error: icon.png not found in public directory!');
      process.exit(1);
    }

    // Generate standard PWA icons
    for (const size of sizes.slice(0, -1)) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated icon-${size}x${size}.png`);
    }

    // Generate Apple Touch Icons (180x180)
    const appleSize = 180;
    const appleIcons = [
      'apple-icon-180x180.png',
      'apple-icon.png',
      'apple-icon-precomposed.png'
    ];

    for (const iconName of appleIcons) {
      const outputPath = path.join(outputDir, iconName);
      await sharp(sourceImage)
        .resize(appleSize, appleSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${iconName}`);
    }

    console.log('\n✅ All PWA icons generated successfully!');
    console.log('Icons saved to: public/\n');
    console.log('Next steps:');
    console.log('1. Verify icons in public/ directory');
    console.log('2. Test PWA installation');
    console.log('3. Run Lighthouse audit');

  } catch (error) {
    console.error('Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
