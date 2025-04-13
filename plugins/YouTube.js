const axios = require('axios');

module.exports = {
  name: 'youtube',
  alias: ['yt', 'ytmp4'],
  description: 'YouTube Video Downloader using Y2mate API',
  category: 'downloader',
  use: '<youtube_url>',
  async execute(m, { conn, args }) {
    if (!args[0]) return m.reply('කරුණාකර YouTube ලින්ක් එකක් ලබා දෙන්න.');

    const url = args[0];
    if (!url.match(/(youtu\.be|youtube\.com)/)) {
      return m.reply('වලංගු YouTube ලින්ක් එකක් ලබා දෙන්න.');
    }

    await m.reply('විඩියෝ විස්තර ලබා ගන්නා中...');

    try {
      const res = await axios.get(`https://y2mate.guru/api/v1/ytmp4?url=${encodeURIComponent(url)}`);
      const data = res.data;

      if (!data || !data.status || !data.result || !data.result.link) {
        return m.reply('වීඩියෝව බාගත කළ නොහැක. වෙනත් ලින්ක් එකක් අためය.');
      }

      const { title, link, thumbnail } = data.result;

      await conn.sendMessage(m.chat, {
        video: { url: link },
        caption: `✅ *මාතෘකාව:* ${title}`
      }, { quoted: m });

    } catch (error) {
      console.error('Y2mate Error:', error);
      m.reply('දෝෂයක් ඇතිවී ඇත. කරුණාකර නැවත උත්සාහ කරන්න.');
    }
  }
};
