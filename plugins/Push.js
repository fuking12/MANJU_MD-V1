// Manju MD 2025 😏
//Credits By Manju MD 😅❤️🍃🕊️

const { cmd, commands } = require('../command');

cmd({
  pattern: "push",
  alias: [],
  use: ".push <message>",
  react: "✉️",
  desc: "Group එකේ හැමෝටම inbox msg/Media යවන්න",
  category: "group",
  filename: __filename
}, async (conn, m, mek, { participants, reply }) => {
  try {
      
    if (!m.isGroup) 
        return await reply("මෙම command එක group එකක් තුළ විතරයි භාවිතා කරන්න.");

    const mentionedJids = participants.map(u => u.id);
    const caption = (m.message?.extendedTextMessage?.text || m.body || "").replace(/^\.push\s+/i, "").trim();

    if (m.mtype === 'imageMessage' || m.mtype === 'videoMessage' || m.mtype === 'audioMessage') {
      const buffer = await m.download();

      for (let jid of mentionedJids) {
        if (m.mtype === 'imageMessage') {
          await conn.sendMessage(jid, { image: buffer, caption });
        } else if (m.mtype === 'videoMessage') {
          await conn.sendMessage(jid, { video: buffer, caption });
        } else if (m.mtype === 'audioMessage') {
          await conn.sendMessage(jid, { audio: buffer, mimetype: 'audio/mp4', ptt: true });
        }
      }

    } else if (caption) {
      for (let jid of mentionedJids) {
        await conn.sendMessage(jid, { text: caption }, { quoted: mek });
      }
    } else {
      return await reply("කරුණාකර `.push <message>` හෝ media එකක් attach කරන්න.");
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: mek.key } });

  } catch (err) {
    console.error("*ERROR* :", err);
    await reply("*ERROR*");
    await conn.sendMessage(m.chat, { react: { text: '❌', key: mek.key } });
  }
});
