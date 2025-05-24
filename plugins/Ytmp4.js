const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

cmd({
    pattern: "ytmp4",
    desc: "YouTube video එකක් download කරලා WhatsApp එකට එවන්න",
    category: "media",
    react: "🎥",
    filename: __filename
},
async (sock, mek, m, { from, args, q, isOwner, reply }) => {
    // Optional: Restrict to owner
    if (!isOwner) {
        await reply("❌ මෙම command එක bot ownerට පමණයි.");
        return;
    }

    if (!q) {
        await reply("❌ YouTube URL එකක් දෙන්න. උදා: .ytmp4 https://youtube.com/watch?v=AFqtArWpv-w 360");
        return;
    }

    // Parse URL and quality
    const argsArray = q.split(' ');
    const ytUrl = argsArray[0];
    const quality = argsArray[1] || '360'; // Default to 360p if quality not provided

    // Validate URL
    if (!ytUrl.includes('youtube.com') && !ytUrl.includes('youtu.be')) {
        await reply("❌ Valid YouTube URL එකක් දෙන්න.");
        return;
    }

    try {
        // Make API request to dark-yasiya-api
        const apiUrl = `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(ytUrl)}&quality=${quality}`;
        console.log(`Fetching from API: ${apiUrl}`);
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.result.download.url) {
            await reply("❌ API එකෙන් download URL එක ලබාගන්න බැරි වුණා.");
            return;
        }

        const downloadUrl = response.data.result.download.url;
        const videoTitle = response.data.result.data.title || 'video';
        console.log(`Download URL: ${downloadUrl}`);

        // Download the video
        const videoResponse = await axios.get(downloadUrl, { responseType: 'stream' });
        const tempFilePath = path.join(__dirname, `../temp/video_${Date.now()}.mp4`);

        // Ensure temp folder exists
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Save video to temp file
        const writer = fs.createWriteStream(tempFilePath);
        videoResponse.data.pipe(writer);

        // Wait for the file to finish writing
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Verify file exists
        if (!fs.existsSync(tempFilePath)) {
            await reply("❌ Video එක save කරන්න බැරි වුණා.");
            return;
        }

        // Send video to WhatsApp
        await sock.sendMessage(from, {
            video: { url: tempFilePath },
            caption: `🎥 ${videoTitle} (${quality}p)`
        }, { quoted: mek });

        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        console.log(`Temporary file deleted: ${tempFilePath}`);

        await reply("✅ Video successfully download කරලා එව්වා!");

    } catch (error) {
        console.error(`Error: ${error.message}`);
        await reply(`❌ Error downloading video: ${error.message}`);
    }
});
