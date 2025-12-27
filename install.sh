#!/bin/bash
echo "📦 Installing WhatsApp AI Bot..."

# Install dependencies
npm install

# Create necessary directories
mkdir -p auth downloads temp assets

# Install Python dependencies
pip install yt-dlp

# Install FFmpeg in Termux
pkg install ffmpeg -y

# Set permissions
chmod +x start.sh

echo "✅ Installation complete!"
echo "🚀 Start bot: npm start"
echo "📱 Scan QR code when prompted"
