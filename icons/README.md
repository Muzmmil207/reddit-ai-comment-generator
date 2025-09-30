# Extension Icons

This directory contains the icons for the Reddit AI Comment Helper Chrome Extension.

## Current Icons (SVG Format)

- `icon16.svg` - 16x16 pixel icon for browser toolbar
- `icon48.svg` - 48x48 pixel icon for extension management page
- `icon128.svg` - 128x128 pixel icon for Chrome Web Store

## Converting SVG to PNG

The manifest.json expects PNG files, but we've provided SVG files that can be easily converted:

### Method 1: Using the HTML Generator

1. Open `create_icons.html` in your browser
2. Right-click each generated icon and "Save image as..."
3. Save as `icon16.png`, `icon48.png`, and `icon128.png`

### Method 2: Using Online Converter

1. Go to any SVG to PNG converter (e.g., convertio.co, cloudconvert.com)
2. Upload each SVG file
3. Set the appropriate dimensions (16x16, 48x48, 128x128)
4. Download the PNG files

### Method 3: Using Command Line (if you have ImageMagick)

```bash
convert icon16.svg -resize 16x16 icon16.png
convert icon48.svg -resize 48x48 icon48.png
convert icon128.svg -resize 128x128 icon128.png
```

### Method 4: Using GIMP or Photoshop

1. Open the SVG file
2. Set the canvas size to the required dimensions
3. Export as PNG

## Icon Design

The icons feature:

- Gradient background (purple to blue)
- Reddit Snoo head (simplified)
- Golden sparkles representing AI/magic
- Clean, modern design suitable for browser toolbar

## Temporary Solution

If you want to test the extension immediately without converting icons:

1. Copy any 16x16, 48x48, and 128x128 PNG files
2. Rename them to `icon16.png`, `icon48.png`, and `icon128.png`
3. Place them in this directory

The extension will work with any PNG icons of the correct dimensions.
