const { cmd } = require('../command');

cmd({
  name: 'ping',
  alias: ['speed'],
  category: 'info',
  desc: 'Bot response speed test',
  filename: __filename
}, async (m, { conn }) => {
  const start = Date.now();
  const msg = await m.reply('පරීක්ෂා කරමින්...');
  const end = Date.now();
  const ping = end - start;

  await conn.sendMessage(m.chat, {
    text: `🏓 *Ping ප්‍රතිචාර වේගය:* ${ping} ms`,
    edit: msg.key
  });
});
