const { cmd } = require('../command');
const ytdlp = require('yt-dlp-exec');  // yt-dlp package import

cmd({
    pattern: "xhamster",
    desc: "Downloads a video from XHamster",
    use: ".xhamster <video_url>",
    react: "🔥",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    const url = q.trim();
    if (!url || !url.includes("xhamster.com")) {
        return reply("කරුණාකර වලංගු *XHamster* ලින්ක් එකක් දාන්න.\n\nตัวอย่าง:\n.xhamster https://xhamster.com/videos/...");
    }

    reply("විඩියෝ එක බාගෙන යමින් පවතියි. කරුණාකර රැදී සිටින්න...");

    try {
        // Use yt-dlp to fetch video data from XHamster
        const result = await ytdlp(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificate: true,
            preferFreeFormats: true
        });

        // Extract video URL and title
        const videoUrl = result?.url;
        const title = result?.title;

        if (!videoUrl) return reply("විඩියෝ එක බාගත කළ නොහැක.");

        // Send video download message to WhatsApp
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: `> *${title}*\n\n_© Powered by MANJU_MD_`,
            mimetype: 'video/mp4'
        }, { quoted: mek });

        // React with success emoji
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`Error: ${e.message}`);
    }
});
