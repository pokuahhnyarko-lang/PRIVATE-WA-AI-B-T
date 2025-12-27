const config = require('../config');

module.exports = {
    getMainMenu() {
        return `
🤖 *${config.BOT_NAME} - Command Menu* 🤖

*🎯 Prefix:* ${config.PREFIX}

*📱 CORE COMMANDS*
${config.PREFIX}menu - Show this menu
${config.PREFIX}info - Bot information
${config.PREFIX}ping - Check bot status
${config.PREFIX}time - Current time

*🤖 AI FEATURES*
${config.PREFIX}ai <text> - Chat with AI
${config.PREFIX}img <text> - Generate AI image
${config.PREFIX}tr <lang> <text> - Translate text
${config.PREFIX}senti <text> - Sentiment analysis

*🎵 MEDIA DOWNLOAD*
${config.PREFIX}song <name> - Download song
${config.PREFIX}ytdl <url> - Download YouTube video
${config.PREFIX}igdl <url> - Download Instagram video
${config.PREFIX}fbdl <url> - Download Facebook video

*🛠️ UTILITIES*
${config.PREFIX}sticker - Create sticker from image
${config.PREFIX}quote - Random quote
${config.PREFIX}joke - Random joke
${config.PREFIX}news - Latest news
${config.PREFIX}short <url> - Shorten URL
${config.PREFIX}qr <text> - Generate QR code
${config.PREFIX}calc <expression> - Calculator
${config.PREFIX}weather <city> - Weather forecast

*⚙️ SETTINGS*
${config.PREFIX}autoreply on/off - Toggle auto-reply
${config.PREFIX}autotype on/off - Toggle auto-typing

*👑 OWNER ONLY*
${config.PREFIX}broadcast <msg> - Broadcast message
${config.PREFIX}eval <code> - Execute code
${config.PREFIX}restart - Restart bot

📌 *Note:* Replace <> with actual values
🔗 *API Status:* All Free APIs Active
⏰ *Uptime:* 24/7 with Auto-Restart

Type ${config.PREFIX}help <command> for detailed info
Example: ${config.PREFIX}help song
        `.trim();
    },

    getHelp(command) {
        const helpMap = {
            'ai': `Usage: ${config.PREFIX}ai <question>\nExample: ${config.PREFIX}ai What is AI?\n\nUses free GPT API for responses`,
            'song': `Usage: ${config.PREFIX}song <song name>\nExample: ${config.PREFIX}song shape of you\n\nDownloads MP3 from YouTube`,
            'img': `Usage: ${config.PREFIX}img <description>\nExample: ${config.PREFIX}img a sunset over mountains\n\nGenerates AI image using DALL-E`,
            'ytdl': `Usage: ${config.PREFIX}ytdl <youtube url>\nExample: ${config.PREFIX}ytdl https://youtu.be/dQw4w9WgXcQ\n\nDownloads video in MP4 format`
        };
        
        return helpMap[command] || `No help available for ${command}`;
    }
};
