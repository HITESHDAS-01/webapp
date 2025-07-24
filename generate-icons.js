#!/usr/bin/env node

// Simple icon generation script for PWA
// This creates placeholder PNG icons from data URLs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base64 encoded 1x1 pixel PNG with blue color (#1976d2)
const bluePixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg==';

// Create a simple colored square SVG
function createIconSVG(size, text = 'EK') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="100%" height="100%" fill="#1976d2" rx="${size * 0.1}"/>
    <text x="50%" y="50%" font-size="${size * 0.3}" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-weight="bold">${text}</text>
  </svg>`;
}

// Create placeholder icons
const icons = [
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'maskable-icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

const publicDir = path.join(__dirname, 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Create SVG icons (these will serve as placeholders)
icons.forEach(icon => {
  const svgContent = createIconSVG(icon.size);
  const svgPath = path.join(publicDir, icon.name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Created ${svgPath}`);
});

// Create a simple HTML to PNG converter for development
const htmlTemplate = (size, content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; width: ${size}px; height: ${size}px; }
    .icon { width: ${size}px; height: ${size}px; background: #1976d2; display: flex; align-items: center; justify-content: center; border-radius: ${size * 0.1}px; }
    .text { color: white; font-size: ${size * 0.3}px; font-family: Arial, sans-serif; font-weight: bold; }
  </style>
</head>
<body>
  <div class="icon">
    <div class="text">EK</div>
  </div>
</body>
</html>
`;

// Create HTML files for manual conversion to PNG
icons.forEach(icon => {
  const htmlContent = htmlTemplate(icon.size, 'EK');
  const htmlPath = path.join(publicDir, icon.name.replace('.png', '.html'));
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`Created ${htmlPath} (convert to PNG manually)`);
});

console.log('\\nIcon generation complete!');
console.log('\\nTo convert HTML to PNG, you can:');
console.log('1. Open each HTML file in a browser');
console.log('2. Use developer tools to take a screenshot');
console.log('3. Or use a tool like puppeteer for automated conversion');
console.log('\\nAlternatively, replace these with your custom icons.');
