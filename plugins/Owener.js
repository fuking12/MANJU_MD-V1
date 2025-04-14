const { cmd } = require('../command');

cmd({
    pattern: 'owner',
    desc: 'Bot owner contact info',
    category: 'info',
    filename: __filename,
}, async (m, sock) => {
    const ownerNumber = '94766863255'; // ඔයාගේ number එක
    const ownerName = 'pathum Rajapakshe'; // ඔයාගේ නම

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

    await sock.sendMessage(m.chat, {
        text: message,
        contextInfo: {
            externalAdReply: {
                title: "Contact Owner",
                body: "Message me on WhatsApp",
                thumbnailUrl: 'https://telegra.ph/file/ea0ae33a6e3cdb3c160dd.jpg',
                sourceUrl: `https://wa.me/${ownerNumber}`,
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: true
            }
        }
    }, { quoted: m });
});
