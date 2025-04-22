const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const disk = require('diskusage');

cmd({
    pattern: "xnxxsearch",
    desc: "XNXX වීඩියෝ සෙවීම (Scraping)",
    category: "බාගත කිරීම",
    filename: __filename,
    react: "🔍"
},
async (sock, mek, m, { args, q, reply }) => {
    try {
        if (!q) {
            return reply("කරුණාකර සෙවුම් පදයක් ලබාදෙන්න! උදා: .xnxxsearch kalifa");
        }

        const searchUrl = `https://www.xvideos.com/?k=${encodeURIComponent(q)}`;
        console.log("Fetching search URL:", searchUrl);
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.xvideos.com/'
            },
            timeout: 15000
        });

        console.log("Search page fetched. HTML length:", response.data.length);
        const $ = cheerio.load(response.data);
        const results = [];

        $('div.mozaique .thumb-block').each((i, element) => {
            const title = $(element).find('.title a').text().trim();
            const url = 'https://www.xvideos.com' + $(element).find('.title a').attr('href');
            if (title && url) {
                results.push({ title, url });
            }
        });

        console.log("Search results found:", results.length);
        if (results.length === 0) {
            return reply("කිසිදු ප්‍රතිඵලයක් හමු නොවීය.");
        }

        let message = "🔍 *XNXX Search Results* 🔍\n\n";
        results.slice(0, 5).forEach((item, index) => {
            message += `${index + 1}. *${item.title}*\n🔗 ${item.url}\n\n`;
        });
        message += "වීඩියෝ බාගත කිරීමට: .xnxxdl <url>";

        await reply(message);

    } catch (error) {
        console.error("XNXX Search (Scraping) error:", error.message);
        let errorMsg = error.message;
        if (error.response) {
            errorMsg += ` (HTTP ${error.response.status})`;
        }
        await reply(`දෝෂයක් ඇතිවිය: ${errorMsg}.`);
    }
});

cmd({
    pattern: "xnxxdl",
    desc: "XNXX වීඩියෝ බාගත කිරීම (Scraping)",
    category: "බාගත කිරීම",
    filename: __filename,
    react: "📽️"
},
async (sock, mek, m, { args, q, reply }) => {
    try {
        if (!q) {
            return reply("කරුණාකර වලංගු XNXX URL එකක් ලබාදෙන්න! උදා: .xnxxdl <url>");
        }

        if (!q.startsWith("https://www.xvideos.com/")) {
            return reply("වලංගු නොවන XNXX URL එකක්! කරුණාකර වලංගු XNXX වීඩියෝ URL එකක් ලබාදෙන්න.");
        }

        // Validate m.from
        if (!m?.from) {
            console.error("m.from is undefined. Cannot send message.");
            return reply("Bot එකේ connection එකේ ගැටලුවක් ඇත. Bot එක restart කරන්න.");
        }
        console.log("Chat ID (m.from):", m.from);

        // Check bot connection
        const connectionState = sock?.ws?.readyState;
        console.log("WebSocket connection state:", connectionState);
        if (connectionState !== 1) { // 1 = OPEN
            console.error("Bot is not connected to WhatsApp.");
            return reply("Bot එක WhatsApp එකට connect වී නැත. Bot එක restart කරන්න.");
        }

        // Check disk space
        const downloadsDir = './downloads';
        console.log("Checking disk space...");
        const diskInfo = await disk.check(downloadsDir);
        const freeSpaceMB = diskInfo.free / (1024 * 1024); // Convert to MB
        console.log("Free disk space:", freeSpaceMB.toFixed(2), "MB");
        if (freeSpaceMB < 100) {
            return reply(`දෝෂයක්: Server එකේ ඉඩ ප්‍රමාණවත් නැත! (Free: ${freeSpaceMB.toFixed(2)} MB). Space free කරන්න.`);
        }

        // Create downloads directory
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        // Scrape video page
        console.log("Fetching video URL:", q);
        const response = await axios.get(q, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.xvideos.com/'
            },
            timeout: 15000
        });

        console.log("Video page fetched. HTML length:", response.data.length);
        const $ = cheerio.load(response.data);

        // Find video URL
        let videoUrl = '';
        const scripts = $('script').filter((i, el) => $(el).text().includes('setVideoUrlHigh'));
        for (let script of scripts) {
            const scriptText = $(script).text();
            const match = scriptText.match(/setVideoUrlHigh\('([^']+)'\)/);
            if (match) {
                videoUrl = match[1];
                break;
            }
        }

        console.log("Extracted video URL:", videoUrl);
        if (!videoUrl) {
            return reply("වීඩියෝ URL එක හමු නොවීය. URL එක valid බව තහවුරු කරන්න.");
        }

        // Get video title
        const title = $('meta[property="og:title"]').attr('content') || 
                      $('title').text().split(' - ')[0] || 
                      "XNXX වීඩියෝ";
        console.log("Video Title:", title);

        // Download video
        const outputPath = path.join(downloadsDir, `${Date.now()}.mp4`);
        console.log("Downloading video to:", outputPath);
        await reply("වීඩියෝ බාගත කරමින්...");

        const videoResponse = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                'Referer': 'https://www.xvideos.com/'
            }
        });

        const writer = fs.createWriteStream(outputPath);
        videoResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log("Video downloaded successfully to:", outputPath);
                resolve();
            });
            writer.on('error', (err) => {
                console.error("Download error:", err.message);
                reject(err);
            });
        });

        // Check if file exists
        if (!fs.existsSync(outputPath)) {
            return reply("වීඩියෝ බාගත කිරීම අසාර්ථකයි. URL එක valid බව තහවුරු කරන්න.");
        }

        // Send video as local file
        console.log("Sending video via WhatsApp...");
        await sock.sendMessage(m.from, {
            video: fs.readFileSync(outputPath),
            caption: `🎥 *${title}*\nMANJU_MD Bot හරහා බාගත කරන ලදී`,
        }, { quoted: mek });

        // Clean up
        console.log("Cleaning up downloaded file...");
        fs.unlinkSync(outputPath);

    } catch (error) {
        console.error("XNXX Download (Scraping) error:", error.message, error.stack);
        let errorMsg = error.message;
        if (error.response) {
            errorMsg += ` (HTTP ${error.response.status})`;
        }
        if (error.code === 'ENOSPC') {
            errorMsg = "Server එකේ ඉඩ ප්‍රමාණවත් නැත! Space free කරන්න.";
        }
        await reply(`දෝෂයක් ඇතිවිය: ${errorMsg}. URL එක valid බව තහවුරු කරන්න.`);
    }
});
