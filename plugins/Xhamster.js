const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

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
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        const $ = cheerio.load(res.data);
        const json = JSON.parse($('script#__NEXT_DATA__').html());
        const video = json.props.pageProps.videoModel;

        const videoUrl = video.sources?.download?.high || video.sources?.download?.default;
        const title = video.title;

        if (!videoUrl) return reply("විඩියෝ එක බාගත කළ නොහැක.");

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: `> *${title}*\n\n_© Powered by MANJU_MD_`,
            mimetype: 'video/mp4'
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`Error: ${e.message}`);
    }
});
