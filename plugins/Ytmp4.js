const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

// Retry function for API calls
const retry = async (fn, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Retry ${i + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

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
    const quality = argsArray[1] || '360'; // Default to 360p

    // Validate URL
    if (!ytUrl.includes('youtube.com') && !ytUrl.includes('youtu.be')) {
        await reply("❌ Valid YouTube URL එකක් දෙන්න.");
        return;
    }

    let tempFilePath;
    try {
        // Make API request with retry and increased timeout
        const apiUrl = `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(ytUrl)}&quality=${quality}`;
        console.log(`Fetching from API: ${apiUrl}`);
        const response = await retry(() =>
            axios.get(apiUrl, { timeout: 60000 }) // 60 seconds timeout
        );

        if (!response.data.status || !response.data.result.download.url) {
            await reply("❌ API එකෙන් download URL එක ලබාගන්න බැරි වුණා.");
            return;
        }

        const downloadUrl = response.data.result.download.url;
        const videoTitle = response.data.result.data.title || 'video';
        console.log(`Download URL: ${downloadUrl}`);

        // Download the video
        const videoResponse = await axios.get(downloadUrl, { responseType: 'stream', timeout: 60000 });
        tempFilePath = path.join(__dirname, `../temp/video_${Date.now()}.mp4`);

        // Ensure temp folder exists
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
            console.log(`Created temp directory: ${tempDir}`);
        }

        // Check write permissions for temp folder
        try {
            fs.accessSync(tempDir, fs.constants.W_OK);
            console.log(`Write permission confirmed for: ${tempDir}`);
        } catch (permError) {
            console.error(`Temp folder permission error: ${permError.message}`);
            await reply(`❌ Temp folder එකට write කිරීමට permission නැත: ${permError.message}`);
            return;
        }

        // Save video to temp file
        const writer = fs.createWriteStream(tempFilePath);
        videoResponse.data.pipe(writer);

        // Wait for the file to finish writing
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Verify file exists and has size
        if (!fs.existsSync(tempFilePath) || fs.statSync(tempFilePath).size === 0) {
            console.error(`File save failed: ${tempFilePath} does not exist or is empty.`);
            await reply("❌ Video එක save කරන්න බැරි වුණා.");
            return;
        }

        // Send video to WhatsApp
        await sock.sendMessage(from, {
            video: { url: tempFilePath },
            caption: `🎥 ${videoTitle} (${quality}p)`
        }, { quoted: mek });

        await reply("✅ Video successfully download කරලා එව්වා!");

    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (error.response) {
            console.error(`Response status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`);
        }
        await reply(`❌ Error downloading video: ${error.message}`);
    } finally {
        // Clean up temp file if it exists
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
                console.log(`Temporary file deleted: ${tempFilePath}`);
            } catch (unlinkError) {
                console.error(`Failed to delete temp file: ${unlinkError.message}`);
            }
        }
    }
});
