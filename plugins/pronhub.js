const { cmd } = require('../command');
const phub = require("pornhub-api");
const { fetchJson, getBuffer } = require('../lib/functions');

// Pornhub video download command
cmd({
    pattern: "pornhub",
    desc: "Downloads a video from Pornhub",
    use: ".pornhub <search_term>",
    react: "🤤",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, q, reply }) => {
    const searchTerm = q.trim();
    if (!searchTerm) return reply(`𝖯𝗅𝖾𝖺𝗌𝖾 𝖯𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝖲𝖾𝖺𝗋𝖼𝗁 𝖳𝖾𝗋𝗆`);

    reply(`𝖲𝖾𝖺𝗋𝖼𝗁𝗂𝗇𝗀 𝖥𝗈𝗋 𝖸𝗈𝗎𝗋 𝖵𝗂𝖽𝖾𝗈 𝗂𝗇 𝖲𝖺𝗁𝖺𝗌-𝖬𝖣 𝖶𝖠 𝖡𝖮𝖳 ➤...`);
    try {
        // Search for the video and download
        const videoInfo = await phub.search(searchTerm);
        if (!videoInfo || !videoInfo.videos || videoInfo.videos.length === 0) {
            return await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        }

        const video = videoInfo.videos[0]; // Get the first result
        const videoUrl = video.url;

        reply(`𝖣𝗈𝗐𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 𝖵𝗂𝖽𝖾𝗈 𝖯𝗅𝖾𝖺𝗌𝖾 𝖶𝖺𝗂𝗍 ➤...`);

        await conn.sendMessage(
            from,
            { video: { url: videoUrl }, caption: '> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꜱᴀʜᴀꜱ ᴛᴇᴄʜ*', mimetype: 'video/mp4' },
            { quoted: mek }
        );

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`Error: ${e.message}`);
    }
});
