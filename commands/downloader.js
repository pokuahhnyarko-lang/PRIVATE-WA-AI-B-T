const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    // Search for songs
    async searchSong(query) {
        try {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}+song&key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`
            );
            
            const video = response.data.items[0];
            return {
                id: video.id.videoId,
                title: video.snippet.title,
                thumbnail: video.snippet.thumbnails.default.url
            };
        } catch (error) {
            // Fallback search
            return {
                id: 'dQw4w9WgXcQ', // Fallback ID
                title: query,
                thumbnail: ''
            };
        }
    },

    // Download song from YouTube
    async downloadSong(videoId) {
        try {
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const outputPath = `./downloads/${Date.now()}.mp3`;
            
            // Using youtube-dl via Python
            const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${videoUrl}"`;
            
            await execPromise(command);
            
            // Read file as buffer
            const audioBuffer = fs.readFileSync(outputPath);
            
            // Clean up
            fs.unlinkSync(outputPath);
            
            return audioBuffer;
        } catch (error) {
            console.error('Download error:', error);
            return null;
        }
    },

    // Download YouTube video
    async downloadYouTube(url) {
        try {
            const info = await ytdl.getInfo(url);
            const format = ytdl.chooseFormat(info.formats, { quality: 'lowest' });
            
            const videoStream = ytdl(url, { format });
            const chunks = [];
            
            for await (const chunk of videoStream) {
                chunks.push(chunk);
            }
            
            return {
                buffer: Buffer.concat(chunks),
                title: info.videoDetails.title,
                duration: info.videoDetails.lengthSeconds
            };
        } catch (error) {
            throw new Error('YouTube download failed');
        }
    },

    // Instagram video downloader
    async downloadInstagram(url) {
        try {
            const response = await axios.get(
                `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info`,
                {
                    params: { url },
                    headers: {
                        'X-RapidAPI-Key': 'free_tier_key',
                        'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            throw new Error('Instagram download failed');
        }
    }
};
