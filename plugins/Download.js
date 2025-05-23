const ytdl = require('ytdl-core');
const { cmd } = require('../command');

cmd({
    pattern: "download",
    alias: ["dl"],
    react: "⬇️",
    desc: "Download media from 50+ sites"
}, async (m, { text }) => {
    const url = text.match(/(https?:\/\/[^\s]+)/)?.[0];
    if (ytdl.validateURL(url)) {
        const info = await ytdl.getInfo(url);
        m.reply(`*${info.videoDetails.title}*\n⬇️ Downloading...`);
        conn.sendMessage(m.chat, { 
            video: { url: info.formats[0].url } 
        });
    }
});
