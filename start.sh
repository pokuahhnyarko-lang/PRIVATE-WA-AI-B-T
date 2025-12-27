#!/bin/bash
echo "🤖 Starting WhatsApp AI Bot..."

# Check Node.js version
node --version || echo "Node.js not found. Installing..." && pkg install nodejs -y

# Install PM2 globally
npm install -g pm2

# Start bot with PM2 for auto-restart
pm2 start index.js --name "whatsapp-bot"

# Save PM2 process
pm2 save

# Enable auto-start
pm2 startup

echo "✅ Bot started successfully!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs whatsapp-bot"
