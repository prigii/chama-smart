#!/bin/bash

# PWA Icon Generator Script
# This script generates all required PWA icon sizes from a source image

SOURCE_IMAGE="$1"

if [ -z "$SOURCE_IMAGE" ]; then
    echo "Usage: ./generate-pwa-icons.sh <source-image.png>"
    echo "Example: ./generate-pwa-icons.sh icon.png"
    exit 1
fi

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image '$SOURCE_IMAGE' not found!"
    exit 1
fi

echo "Generating PWA icons from $SOURCE_IMAGE..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed!"
    echo "Please install it first:"
    echo "  - Windows: choco install imagemagick"
    echo "  - macOS: brew install imagemagick"
    echo "  - Linux: sudo apt-get install imagemagick"
    exit 1
fi

# Create public directory if it doesn't exist
mkdir -p public

# Generate all required sizes
echo "Generating icons..."

convert "$SOURCE_IMAGE" -resize 72x72 public/icon-72x72.png
echo "✓ Generated icon-72x72.png"

convert "$SOURCE_IMAGE" -resize 96x96 public/icon-96x96.png
echo "✓ Generated icon-96x96.png"

convert "$SOURCE_IMAGE" -resize 128x128 public/icon-128x128.png
echo "✓ Generated icon-128x128.png"

convert "$SOURCE_IMAGE" -resize 144x144 public/icon-144x144.png
echo "✓ Generated icon-144x144.png"

convert "$SOURCE_IMAGE" -resize 152x152 public/icon-152x152.png
echo "✓ Generated icon-152x152.png"

convert "$SOURCE_IMAGE" -resize 192x192 public/icon-192x192.png
echo "✓ Generated icon-192x192.png"

convert "$SOURCE_IMAGE" -resize 384x384 public/icon-384x384.png
echo "✓ Generated icon-384x384.png"

convert "$SOURCE_IMAGE" -resize 512x512 public/icon-512x512.png
echo "✓ Generated icon-512x512.png"

# Apple Touch Icons
convert "$SOURCE_IMAGE" -resize 180x180 public/apple-icon-180x180.png
echo "✓ Generated apple-icon-180x180.png"

convert "$SOURCE_IMAGE" -resize 180x180 public/apple-icon.png
echo "✓ Generated apple-icon.png"

convert "$SOURCE_IMAGE" -resize 180x180 public/apple-icon-precomposed.png
echo "✓ Generated apple-icon-precomposed.png"

echo ""
echo "✅ All PWA icons generated successfully!"
echo "Icons saved to: public/"
echo ""
echo "Next steps:"
echo "1. Verify icons in public/ directory"
echo "2. Test PWA installation"
echo "3. Run Lighthouse audit"
