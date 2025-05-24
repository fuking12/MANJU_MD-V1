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
    pattern: "henati",
    desc: "Hentai video එකක් download කරනවා හෝ search කරනවා",
    category: "media",
    react: "🎥",
    filename: __filename
},
async (sock, mek, m, { from, args, q, isOwner, reply }) => {
    // Restrict to owner for safety
    if (!isOwner) {
        await reply("❌ මෙම command එක bot ownerට පමණයි.");
        return;
    }

    if (!q) {
        await reply("❌ Hentai video URL එකක් හෝ search keyword එකක් දෙන්න. උදා:\n.henati https://hentaihaven.xxx/video/example\n.henati search <keyword>\n.henati urlsearch <keyword>");
        return;
    }

    // Parse command
    const argsArray = q.split(' ');
    const commandType = argsArray[0].toLowerCase();
    const query = argsArray.slice(1).join(' ');

    // Direct URL download
    if (!['search', 'urlsearch'].includes(commandType)) {
        const videoUrl = q;

        // Validate URL
        if (!videoUrl.includes('hentai') && !videoUrl.includes('hanime') && !videoUrl.includes('hentaisea')) {
            await reply("⚠️ Valid hentai video URL එකක් දෙන්න (උදා: hentaihaven.xxx, hanime.tv).");
            return;
        }

        let tempFilePath;
        try {
            // Make API request for direct download
            const apiUrl = `https://www.dark-yasiya-api.site/download/henati?url=${encodeURIComponent(videoUrl)}`;
            console.log(`Fetching from API: ${apiUrl}`);
            const response = await retry(() =>
                axios.get(apiUrl, { timeout: 60000 })
            );

            if (!response.data.status || !response.data.result.download.url) {
                await reply("❌ API එකෙන් download URL එක ලබාගන්න බැරි වුණා.");
                return;
            }

            const downloadUrl = response.data.result.download.url;
            const videoTitle = response.data.result.data.title || 'hentai_video';
            console.log(`Download URL: ${downloadUrl}`);

            // Download the video
            const videoResponse = await axios.get(downloadUrl, { responseType: 'stream', timeout: 60000 });
            tempFilePath = path.join(__dirname, `../temp/hentai_${Date.now()}.mp4`);

            // Ensure temp folder exists
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
                console.log(`Created temp directory: ${tempDir}`);
            }

            // Check write permissions
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

            // Wait for file to finish writing
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
                caption: `🎥 ${videoTitle}`
            }, { quoted: mek });

            await reply("✅ Hentai video successfully download කරලා එව්වා!");

        } catch (error) {
            console.error(`Direct download error: ${error.message}`);
            if (error.response) {
                console.error(`Response status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`);
            }
            await reply(`❌ Error downloading hentai video: ${error.message}`);
        } finally {
            // Clean up temp file
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                try {
                    fs.unlinkSync(tempFilePath);
                    console.log(`Temporary file deleted: ${tempFilePath}`);
                } catch (unlinkError) {
                    console.error(`Failed to delete temp file: ${unlinkError.message}`);
                }
            }
        }
        return;
    }

    // Search functionality
    if (commandType === 'search') {
        if (!query) {
            await reply("❌ Search keyword එකක් දෙන්න. උදා: .henati search schoolgirl");
            return;
        }

        try {
            // Make API request for search
            const searchUrl = `https://www.dark-yasiya-api.site/search/henati?q=${encodeURIComponent(query)}`;
            console.log(`Searching with API: ${searchUrl}`);
            const response = await retry(() =>
                axios.get(searchUrl, { timeout: 60000 })
            );

            if (!response.data.status || !response.data.results || response.data.results.length === 0) {
                await reply("❌ Search results ලබාගන්න බැරි වුණා හෝ results හම්බුනේ නැත.");
                return;
            }

            // Format search results
            const results = response.data.results.slice(0, 5); // Limit to 5 results
            let message = "🔍 Search Results for: " + query + "\n\n";
            results.forEach((result, index) => {
                message += `${index + 1}. ${result.title}\nURL: ${result.url}\n\n`;
            });
            message += "Video එක download කරන්න: .henati <URL>";

            await reply(message);

        } catch (error) {
            console.error(`Search error: ${error.message}`);
            if (error.response) {
                console.error(`Response status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`);
            }
            await reply(`❌ Error searching hentai videos: ${error.message}`);
        }
        return;
    }

    // URL search and download
    if (commandType === 'urlsearch') {
        if (!query) {
            await reply("❌ Search keyword එකක් දෙන්න. උදා: .henati urlsearch schoolgirl");
            return;
        }

        let tempFilePath;
        try {
            // Make API request for search
            const searchUrl = `https://www.dark-yasiya-api.site/search/henati?q=${encodeURIComponent(query)}`;
            console.log(`Searching with API: ${searchUrl}`);
            const response = await retry(() =>
                axios.get(searchUrl, { timeout: 60000 })
            );

            if (!response.data.status || !response.data.results || response.data.results.length === 0) {
                await reply("❌ Search results ලබාගන්න බැරි වුණා හෝ results හම්බුනේ නැත.");
                return;
            }

            // Get first result
            const videoUrl = response.data.results[0].url;
            const videoTitle = response.data.results[0].title || 'hentai_video';
            console.log(`Selected video URL: ${videoUrl}`);

            // Make API request for download
            const apiUrl = `https://www.dark-yasiya-api.site/download/henati?url=${encodeURIComponent(videoUrl)}`;
            console.log(`Fetching from API: ${apiUrl}`);
            const downloadResponse = await retry(() =>
                axios.get(apiUrl, { timeout: 60000 })
            );

            if (!downloadResponse.data.status || !downloadResponse.data.result.download.url) {
                await reply("❌ API එකෙන් download URL එක ලබාගන්න බැරි වුණා.");
                return;
            }

            const downloadUrl = downloadResponse.data.result.download.url;
            console.log(`Download URL: ${downloadUrl}`);

            // Download the video
            const videoResponse = await axios.get(downloadUrl, { responseType: 'stream', timeout: 60000 });
            tempFilePath = path.join(__dirname, `../temp/hentai_${Date.now()}.mp4`);

            // Ensure temp folder exists
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
                console.log(`Created temp directory: ${tempDir}`);
            }

            // Check write permissions
            try {
                fs.accessSync(tempDir, fs.constants.W_OK);
                console.log(`Write permission confirmed for: ${tempDir}`);
            } catch (permError) {
                console.error(`Temp folder permission error: ${permError.message}`);
                await reply(`❌ Temp folder එකටiprofwrite කිරීමට permission නැත: ${permError.message}`);
                return;
            }

            // Save video to temp file
            const writer = fs.createWriteStream(tempFilePath);
            videoResponse.data.pipe(writer);

            // Wait for file to finish writing
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
                caption: `🎥 ${videoTitle}`
            }, { quoted: mek });

            await reply("✅ Hentai video successfully download කරලා එව්වා!");

        } catch (error) {
            console.error(`URL search error: ${error.message}`);
            if (error.response) {
                console.error(`Response status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`);
            }
            await reply(`❌ Error downloading hentai video from search: ${error.message}`);
        } finally {
            // Clean up temp file
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                try {
                    fs.unlinkSync(tempFilePath);
                    console.log(`Temporary file deleted: ${tempFilePath}`);
                } catch (unlinkError) {
                    console.error(`Failed to delete temp file: ${unlinkError.message}`);
                }
            }
        }
    }
});
