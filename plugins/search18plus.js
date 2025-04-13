const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

// 18+ video search by name
cmd({
    pattern: "search18plus",
    desc: "Searches for 18+ videos by name",
    use: ".search18plus <video_name>",
    react: "🔥",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    const searchTerm = q.trim();
    if (!searchTerm) return reply("කරුණාකර search term එකක් ලබා දුන්නු බව මතක තබා ගන්න.");

    reply("18+ විඩියෝ සෙවීම පටන් ගනී. කරුණාකර රැදී සිටින්න...");

    try {
        const res = await axios.get(`https://www.xvideos.com/?k=${encodeURIComponent(searchTerm)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            }
        });

        const $ = cheerio.load(res.data);
        const videoLinks = [];

        // Example: Find video links based on search term
        $('a.thumb').each((i, elem) => {
            const videoUrl = $(elem).attr('href');
            if (videoUrl && videoUrl.includes('https://www.xvideos.com')) {
                videoLinks.push(videoUrl);
            }
        });

        if (videoLinks.length === 0) return reply("18+ විඩියෝ සොයා ගත නොහැක.");

        let videoList = '18+ සෙවුම් ප්‍රතිඵල:\n\n';
        videoLinks.forEach((url, index) => {
            videoList += `${index + 1}. ${url}\n`;
        });

        reply(videoList);
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`Error: ${e.message}`);
    }
});
