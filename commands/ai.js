const axios = require('axios');
const config = require('../config');

module.exports = {
    // ChatGPT-like response using free API
    async chatGPT(prompt) {
        try {
            const response = await axios.post(
                config.APIS.OPENAI_FREE,
                { inputs: prompt },
                { headers: { 'Authorization': 'Bearer hf_free_token' } }
            );
            
            return response.data[0]?.generated_text || 
                   "🤖 I'm thinking... Try again!";
        } catch (error) {
            // Fallback to local response
            const responses = [
                "That's an interesting question!",
                "I'm learning about that topic.",
                "Can you rephrase your question?",
                "Let me think about that...",
                "Based on available information..."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    },

    // Image generation
    async generateImage(prompt) {
        try {
            const response = await axios.post(
                config.APIS.DALL_E_FREE,
                { inputs: prompt },
                { responseType: 'arraybuffer' }
            );
            
            // Save image temporarily
            const fs = require('fs');
            const path = `./temp/${Date.now()}.png`;
            fs.writeFileSync(path, response.data);
            return path;
        } catch (error) {
            return "https://via.placeholder.com/512?text=Image+Generation+Failed";
        }
    },

    // Text translation
    async translate(text, targetLang = 'en') {
        try {
            const response = await axios.get(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
            );
            return response.data.responseData.translatedText;
        } catch (error) {
            return text;
        }
    },

    // Sentiment analysis
    async analyzeSentiment(text) {
        const positiveWords = ['good', 'great', 'awesome', 'happy', 'love'];
        const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'hate'];
        
        let score = 0;
        const words = text.toLowerCase().split(' ');
        
        words.forEach(word => {
            if (positiveWords.includes(word)) score++;
            if (negativeWords.includes(word)) score--;
        });
        
        if (score > 0) return "Positive 😊";
        if (score < 0) return "Negative 😔";
        return "Neutral 😐";
    }
};
