const { cmd } = require('../command');

const axios = require('axios');

const cheerio = require('cheerio');

const fs = require('fs');

const path = require('path');

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

        const response = await axios.get(searchUrl, {

            headers: {

                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',

                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',

                'Accept-Language': 'en-US,en;q=0.5',

                'Referer': 'https://www.xvideos.com/'

            },

            timeout: 15000

        });

        const $ = cheerio.load(response.data);

        const results = [];

        $('div.mozaique .thumb-block').each((i, element) => {

            const title = $(element).find('.title a').text().trim();

            const url = 'https://www.xvideos.com' + $(element).find('.title a').attr('href');

            if (title && url) {

                results.push({ title, url });

            }

        });

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

        const response = await axios.get(q, {

            headers: {

                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',

                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',

                'Accept-Language': 'en-US,en;q=0.5',

                'Referer': 'https://www.xvideos.com/'

            },

            timeout: 15000

        });

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

        if (!videoUrl) {

            return reply("වීඩියෝ URL එක හමු නොවීය. URL එක valid බව තහවුරු කරන්න.");

        }

        // Get video title

        const title = $('meta[property="og:title"]').attr('content') || 

                      $('title').text().split(' - ')[0] || 

                      "XNXX වීඩියෝ";

        // Create downloads directory

        const downloadsDir = './downloads';

        if (!fs.existsSync(downloadsDir)) {

            fs.mkdirSync(downloadsDir, { recursive: true });

        }

        // Download video

        const outputPath = path.join(downloadsDir, `${Date.now()}.mp4`);

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

            writer.on('finish', resolve);

            writer.on('error', reject);

        });

        // Check if file exists

        if (!fs.existsSync(outputPath)) {

            return reply("වීඩියෝ බාගත කිරීම අසාර්ථකයි. URL එක valid බව තහවුරු කරන්න.");

        }

        // Send video as local file

        await sock.sendMessage(m.from, {

            video: fs.readFileSync(outputPath),

            caption: `🎥 *${title}*\nMANJU_MD Bot හරහා බාගත කරන ලදී`,

        }, { quoted: mek });

        // Clean up

        fs.unlinkSync(outputPath);

    } catch (error) {

        console.error("XNXX Download (Scraping) error:", error.message);

        let errorMsg = error.message;

        if (error.response) {

            errorMsg += ` (HTTP ${error.response.status})`;

        }

        await reply(`දෝෂයක් ඇතිවිය: ${errorMsg}. URL එක valid බව තහවුරු කරන්න.`);

    }

});