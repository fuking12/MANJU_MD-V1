const ytdl = require('ytdl-core');

module.exports = {
  name: 'youtube',
  alias: ['yt', 'ytmp4'],
  description: 'YouTube වීඩියෝවක් බාගත කරන්න - MP4 පමණි',
  category: 'downloader',
  use: '<youtube_url>',
  async execute(m, { conn, args }) {
    if (!args[0]) return m.reply('කරුණාකර YouTube ලින්ක් එකක් ලබා දෙන්න.');

    const url = args[0];
    if (!ytdl.validateURL(url)) {
      return m.reply('වලංගු YouTube ලින්ක් එකක් ලබා දෙන්න.');
    }

    await m.reply('විඩියෝව ලබා ගන්නා中...');

    try {
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: '18' }); // 360p

      if (!format || !format.url) {
        return m.reply('වීඩියෝව ලබා ගත නොහැක.');
      }

      await conn.sendMessage(m.chat, {
        video: { url: format.url },
        caption: `✅ *මාතෘකාව:* ${info.videoDetails.title}`
      }, { quoted: m });

    } catch (err) {
      console.error('YouTube Plugin Error:', err);
      m.reply('දෝෂයක් ඇතිවී ඇත. නැවත උත්සාහ කරන්න.');
    }
  }
};
