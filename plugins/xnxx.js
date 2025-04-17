const { cmd, commands } = require('../command');
const xnxx = require("xnxx-dl");
const { fetchJson, getBuffer } = require('../lib/functions');

// XNXX video download command
cmd({
    pattern: "xnxx",
    desc: "Downloads a video from XNXX",
    use: ".xnxx <search_term>",
    react: "🍑",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, q, reply }) => {
    const searchTerm = q.trim();
    if (!searchTerm) return reply(`𝖯𝗅𝖾𝖺𝗌𝖾 𝖯𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝖲𝖾𝖺𝗋𝖼𝗁 𝖳𝖾𝗋𝗆`);

    reply(`𝗦𝗘𝗔𝗥𝗖𝗛𝗜𝗡𝗚 𝗙𝗢𝗥 𝗬𝗢𝗨𝗥 𝗩𝗜𝗗𝗘𝗢 𝗜𝗡 𝗠𝗔𝗡𝗝𝗨_𝗠𝗗 𝗪𝗔 𝗕𝗢𝗧 ➤...`);
    try {
        // Search for the video and download
        const videoInfo = await xnxx.download(searchTerm);
        if (!videoInfo || !videoInfo.link_dl) {
            return await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        }

        reply(`𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚 𝗩𝗜𝗗𝗘𝗢 𝗣𝗟𝗘𝗔𝗦𝗘 𝗪𝗔𝗜𝗧 ➤...`);
        const videoUrl = videoInfo.link_dl;
        await conn.sendMessage(
            from,
            { video: { url: videoUrl }, caption: '> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀɴᴊᴜ_ᴍᴅ*', mimetype: 'video/mp4' }, 
            { quoted: mek }
        )

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`Error: ${e.message}`);
    }
});
