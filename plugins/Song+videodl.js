const { cmd, commands } = require('../command');
const fg = require('api-dylux');
const yts = require('yt-search');

cmd({
    pattern: "audio",
    desc: "download songs",
    react: '🎶',
    category: "download",
    filename: __filename
},
async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Get query from q or args
        const p = q || args.join(" ");
        if (!p) return reply("Please provide a URL or title");

        // Search YouTube
        const search = await yts(p);
        if (!search.videos || search.videos.length === 0) return reply("No videos found for your query");

        const data = search.videos[0];
        const url = data.url;

        // Prepare description
        let desc = `
🎵 *MANJU_MD SONG DOWNLOADER* 🎵

Title: ${data.title}
Description: ${data.description}
Duration: ${data.timestamp}
Uploaded: ${data.ago}
Views: ${data.views}

MADE BY MANJU_MD V1 ✅
`;
        // Send thumbnail with description
await robin.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek });

// Download audio
let down;
try {
    // Validate URL
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
        return await reply('Invalid YouTube URL. Please provide a valid YouTube link.');
    }

    down = await fg.yta(url);
    if (!down || !down.dl_url) {
        return await reply('ඩවුන්ලෝඩ් ලින්ක් එක හමු වුණේ නැහැ. URL එක බලලා නැවත උත්සාහ කරන්න.');
    }
} catch (e) {
    console.error('fg.yta Error:', e);
    return await reply(`❌ ගීතය ඩවුන්ලෝඩ් කිරීමේදී දෝෂයක්: ${e.message}`);
}

const downloadUrl = down.dl_url;

// Send audio message
await robin.sendMessage(from, { audio: { url: downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });

} catch (e) {
    console.error("Error:", e);
    await reply(`❌ Error: ${e.message}`);
}
});
