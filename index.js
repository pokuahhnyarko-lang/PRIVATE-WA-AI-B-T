const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const axios = require('axios');
const moment = require('moment-timezone');

// Import command modules
const aiCommands = require('./commands/ai');
const downloadCommands = require('./commands/downloader');
const utils = require('./commands/utils');
const menu = require('./commands/menu');

class WhatsAppBot {
    constructor() {
        this.sock = null;
        this.autoReplies = new Map();
        this.typingSessions = new Map();
        this.init();
    }

    async init() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState('./auth');
            
            const { version } = await fetchLatestBaileysVersion();
            this.sock = makeWASocket({
                version,
                printQRInTerminal: false,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, logger),
                },
                browser: ['Termux AI Bot', 'Chrome', '1.0.0'],
                generateHighQualityLinkPreview: true,
            });

            this.sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr) {
                    console.log('Scan QR Code:');
                    qrcode.generate(qr, { small: true });
                }
                
                if (connection === 'close') {
                    const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
                    if (shouldReconnect) {
                        this.init();
                    }
                } else if (connection === 'open') {
                    console.log('✅ Bot connected successfully!');
                    this.sendMessage(config.OWNER_NUMBER, { text: '🤖 Bot is now online!' });
                }
            });

            this.sock.ev.on('creds.update', saveCreds);
            
            // Handle incoming messages
            this.sock.ev.on('messages.upsert', async (m) => {
                const msg = m.messages[0];
                if (!msg.message || msg.key.fromMe) return;
                
                await this.handleMessage(msg);
            });

        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    async handleMessage(msg) {
        try {
            const from = msg.key.remoteJid;
            const text = this.extractText(msg);
            
            if (!text) return;

            // Auto-reply logic
            if (config.AUTO_REPLY.enabled) {
                await this.handleAutoReply(from, text.toLowerCase());
            }

            // Auto-typing indicator
            if (config.AUTO_TYPING.enabled) {
                await this.showTyping(from);
            }

            // Check for command
            if (text.startsWith(config.PREFIX)) {
                await this.handleCommand(from, text, msg);
            }

        } catch (error) {
            console.error('Message handling error:', error);
        }
    }

    async handleAutoReply(from, text) {
        const responses = config.AUTO_REPLY.responses;
        
        if (config.AUTO_REPLY.greetings.some(greet => text.includes(greet))) {
            await this.sendMessage(from, { text: responses.greeting });
            return true;
        }
        
        if (config.AUTO_REPLY.farewell.some(farewell => text.includes(farewell))) {
            await this.sendMessage(from, { text: responses.farewell });
            return true;
        }
        
        // Default auto-reply for non-command messages
        if (!text.startsWith(config.PREFIX) && text.split(' ').length > 3) {
            await this.sendMessage(from, { text: responses.default });
            return true;
        }
        
        return false;
    }

    async showTyping(from) {
        const typingDuration = Math.random() * 
            (config.AUTO_TYPING.maxDuration - config.AUTO_TYPING.minDuration) + 
            config.AUTO_TYPING.minDuration;
        
        // Start typing
        await this.sock.sendPresenceUpdate('composing', from);
        
        // Store typing session
        this.typingSessions.set(from, {
            start: Date.now(),
            duration: typingDuration
        });

        // Stop typing after duration
        setTimeout(async () => {
            if (this.typingSessions.has(from)) {
                await this.sock.sendPresenceUpdate('paused', from);
                this.typingSessions.delete(from);
            }
        }, typingDuration);
    }

    extractText(msg) {
        if (msg.message?.conversation) return msg.message.conversation;
        if (msg.message?.extendedTextMessage?.text) return msg.message.extendedTextMessage.text;
        if (msg.message?.imageMessage?.caption) return msg.message.imageMessage.caption;
        if (msg.message?.videoMessage?.caption) return msg.message.videoMessage.caption;
        return '';
    }

    async handleCommand(from, text, msg) {
        const command = text.toLowerCase().split(' ')[0].slice(config.PREFIX.length);
        const args = text.slice(config.PREFIX.length + command.length).trim();
        
        switch(command) {
            case 'menu':
            case 'help':
                await this.sendMessage(from, { text: menu.getMainMenu() });
                break;
                
            case 'ai':
                if (args) {
                    const response = await aiCommands.chatGPT(args);
                    await this.sendMessage(from, { text: response });
                }
                break;
                
            case 'img':
                if (args) {
                    const imageUrl = await aiCommands.generateImage(args);
                    await this.sendMessage(from, { 
                        image: { url: imageUrl },
                        caption: `Generated: ${args}`
                    });
                }
                break;
                
            case 'song':
                if (args) {
                    await this.sendMessage(from, { text: '🎵 Searching for song...' });
                    const songInfo = await downloadCommands.searchSong(args);
                    await this.sendMessage(from, { 
                        text: `Found: ${songInfo.title}\nDownloading...` 
                    });
                    
                    const audioBuffer = await downloadCommands.downloadSong(songInfo.id);
                    await this.sendMessage(from, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${songInfo.title}.mp3`
                    });
                }
                break;
                
            case 'ytdl':
                if (args) {
                    await this.sendMessage(from, { text: '📥 Downloading video...' });
                    const videoInfo = await downloadCommands.downloadYouTube(args);
                    await this.sendMessage(from, {
                        video: videoInfo.buffer,
                        caption: videoInfo.title,
                        fileName: `${videoInfo.title}.mp4`
                    });
                }
                break;
                
            case 'quote':
                const quote = await utils.getQuote();
                await this.sendMessage(from, { text: quote });
                break;
                
            case 'joke':
                const joke = await utils.getJoke();
                await this.sendMessage(from, { text: joke });
                break;
                
            case 'news':
                const news = await utils.getNews();
                await this.sendMessage(from, { text: news });
                break;
                
            case 'time':
                const time = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
                await this.sendMessage(from, { text: `🕒 Current Time: ${time}` });
                break;
                
            case 'sticker':
                if (msg.message?.imageMessage) {
                    await utils.createSticker(this.sock, msg, from);
                }
                break;
                
            case 'ping':
                await this.sendMessage(from, { text: '🏓 Pong! Bot is alive!' });
                break;
                
            case 'info':
                const info = `🤖 *Bot Information*\n\n` +
                            `Name: ${config.BOT_NAME}\n` +
                            `Prefix: ${config.PREFIX}\n` +
                            `Status: Online ✅\n` +
                            `Uptime: ${process.uptime().toFixed(2)}s\n` +
                            `Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`;
                await this.sendMessage(from, { text: info });
                break;
                
            default:
                await this.sendMessage(from, { 
                    text: `❌ Unknown command. Type ${config.PREFIX}menu for help.` 
                });
        }
    }

    async sendMessage(to, content) {
        try {
            await this.sock.sendMessage(to, content);
        } catch (error) {
            console.error('Send message error:', error);
        }
    }
}

// Start the bot
const bot = new WhatsAppBot();
