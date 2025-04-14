cmd({
    pattern: 'owner',
    desc: 'Bot owner contact info',
    category: 'info',
    filename: __filename,
}, async (m) => {
    const ownerNumber = '94766863255';
    const ownerName = 'Pathum Rajapakshe';

    const caption = `
*👑 BOT OWNER DETAILS 👑*

╭───────────────◆
│ *📛 නම:* ${ownerName}
│ *📞 නම්බර්:* wa.me/${ownerNumber}
│ *💬 WhatsApp:* Always Active
│ *🌐 GitHub:* github.com/Manju362
╰───────────────◆

_ඔබට ගැටලුවක් ඇත්නම් Ownerව සම්බන්ධ කරන්න._
`.trim();

    await m.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            externalAdReply: {
                title: 'Pathum Rajapakshe - Owner',
                body: 'Click to Contact via WhatsApp',
                mediaType: 1,
                thumbnailUrl: 'https://telegra.ph/file/ea0ae33a6e3cdb3c160dd.jpg',
                renderLargerThumbnail: true,
                showAdAttribution: true,
                sourceUrl: `https://wa.me/${ownerNumber}`
            }
        }
    }, { quoted: m });
});
