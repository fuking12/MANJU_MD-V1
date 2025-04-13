module.exports = {
  name: 'ping',
  alias: ['speed', 'pong'],
  description: 'Bot එකේ ප්‍රතිචාර වේගය පෙන්වයි',
  category: 'info',
  async execute(m, { conn }) {
    const start = Date.now();
    const msg = await m.reply('පරීක්ෂා කරමින්...');
    const end = Date.now();
    const ping = end - start;

    await conn.sendMessage(m.chat, {
      text: `🏓 *Ping ප්‍රතිචාර වේගය:* ${ping} ms`,
      edit: msg.key
    });
  }
};
