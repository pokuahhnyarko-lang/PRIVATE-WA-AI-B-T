const axios = require('axios');
const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = {
    // Get random quote
    async getQuote() {
        try {
            const response = await axios.get(config.APIS.QUOTES);
            return `💬 *Quote of the Day*\n\n"${response.data.content}"\n\n- ${response.data.author}`;
        } catch (error) {
            return "💬 The best way to predict the future is to create it.";
        }
    },

    // Get random joke
    async getJoke() {
        try {
            const response = await axios.get(config.APIS.JOKES);
            return `😂 *Joke*\n\n${response.data.setup}\n\n${response.data.punchline}`;
        } catch (error) {
            return "😂 Why don't scientists trust atoms? Because they make up everything!";
        }
    },

    // Get news headlines
    async getNews() {
        try {
            const response = await axios.get(
                `${config.APIS.NEWS}?country=us&apiKey=free_api_key`
            );
            
            const articles = response.data.articles.slice(0, 5);
            let newsText = "📰 *Top News Headlines*\n\n";
            
            articles.forEach((article, index) => {
                newsText += `${index + 1}. ${article.title}\n`;
            });
            
            return newsText;
        } catch (error) {
            return "📰 News service temporarily unavailable.";
        }
    },

    // Create sticker from image
    async createSticker(sock, msg, from) {
        try {
            const stream = await sock.downloadMediaMessage(msg);
            const stickerPath = `./temp/${Date.now()}.webp`;
            
            // Save and convert to webp (simplified)
            fs.writeFileSync(stickerPath, stream);
            
            await sock.sendMessage(from, {
                sticker: { url: stickerPath }
            });
            
            // Clean up
            fs.unlinkSync(stickerPath);
        } catch (error) {
            console.error('Sticker creation error:', error);
        }
    },

    // URL shortener
    async shortenUrl(url) {
        try {
            const response = await axios.post('https://tinyurl.com/api-create.php', null, {
                params: { url }
            });
            return response.data;
        } catch (error) {
            return url;
        }
    },

    // QR Code generator
    async generateQR(text) {
        try {
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
            return qrCodeUrl;
        } catch (error) {
            return null;
        }
    }
};
