const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'owner',
    desc: 'Bot owner contact info',
    category: 'info',
    filename: __filename,
}, async (m, sock) => {
    const ownerNumber = '94766863255';
    const ownerName = 'Pathum Rajapakshe';

    const message = `
*👑 OWNER INFO 👑*

╭───────────────◆
│ *📛 නම:* ${ownerName}
│ *📞 නම්බර්:* wa.me/${ownerNumber}
│ *💬 WhatsApp:* Active
│ *🌐 GitHub:* github.com/Manju362
╰───────────────◆

_ඔබට ගැටලුවක් ඇත්නම් Ownerව සම්බන්ධ කරන්න._
`.trim();

    // Thumbnail එක base64 එකට convert කරන්න
    let thumbnailBuffer;
    try {
        const thumbnailUrl = 'https://telegra.ph/file/ea0ae33a6e3cdb3c160dd.jpg';
        const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
        thumbnailBuffer = Buffer.from(response.data, 'binary');
    } catch (e) {
        thumbnailBuffer = null;
    }

    await sock.sendMessage(m.chat, {
        text: message,
        contextInfo: {
            externalAdReply: {
                title: "Contact Owner",
                body: "Click here to contact via WhatsApp",
                mediaType: 1,
                thumbnail: thumbnailBuffer,
                renderLargerThumbnail: true,
                showAdAttribution: true,
                sourceUrl: `https://wa.me/${ownerNumber}`
            }
        }
    }, { quoted: m });
});
