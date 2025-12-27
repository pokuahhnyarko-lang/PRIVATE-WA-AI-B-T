module.exports = {
    // Bot Configuration
    BOT_NAME: "🤖 AI Bot",
    OWNER_NUMBER: "+233535502036", // Your number with country code
    PREFIX: "!",
    
    // Free API Configurations
    APIS: {
        // AI APIs
        OPENAI_FREE: "https://api-inference.huggingface.co/models/gpt2",
        GEMINI_FREE: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        
        // Song Download APIs
        YOUTUBE_API: "https://www.youtube.com/youtubei/v1/search",
        JIO_SAAVN: "https://www.jiosaavn.com/api.php",
        
        // Other Free APIs
        QUOTES: "https://api.quotable.io/random",
        JOKES: "https://official-joke-api.appspot.com/random_joke",
        NEWS: "https://newsapi.org/v2/top-headlines",
        
        // Image Generation
        DALL_E_FREE: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2"
    },
    
    // Auto-reply settings
    AUTO_REPLY: {
        enabled: true,
        greetings: ["hi", "hello", "hey", "hola"],
        farewell: ["bye", "goodbye", "see you"],
        responses: {
            greeting: "👋 Hello! I'm your AI assistant. Type !menu to see all commands.",
            farewell: "👋 Goodbye! Have a great day!",
            default: "🤖 I'm an AI bot. Use !help for commands."
        }
    },
    
    // Auto-typing settings
    AUTO_TYPING: {
        enabled: true,
        minDuration: 1000,
        maxDuration: 3000
    }
};
