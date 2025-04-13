const { youtubedl } = require('@bochilteam/scraper');

module.exports = {
  name: 'youtube',
  alias: ['yt', 'ytmp4'],
  description: 'Simple YouTube Video Downloader - MP4 only',
  category: 'downloader',
  use: '<youtube_url>',
  async execute(m, { conn, args }) {
    if (!args[0]) return m.reply('කරුණාකර YouTube ලින්ක් එකක් දෙන්න.');

    let url = args[0];
    if (!url.match(/(youtu.be|youtube.com)/)) return m.reply('වලංගු YouTube ලින්ක් එකක් දෙන්න.');

    m.reply('විඩියෝව ලබා ගන්නා中...');

    try {
      const result = await youtubedl(url);
      const { title, video, thumbnail } = result;

      const mp4 = video['360p'] || video['480p'] || video['720p'] || Object.values(video)[0];
      const downloadUrl = mp4?.url;

      if (!downloadUrl) return m.reply('වීඩියෝව ලබා ගත නොහැක.');

      await conn.sendMessage(m.chat, {
        video: { url: downloadUrl },
        caption: `✅ *මාතෘකාව:* ${title}`
      }, { quoted: m });

    } catch (err) {
      console.error(err);
      m.reply('දෝෂයක් ඇතිවී ඇත. නැවත උත්සාහ කරන්න.');
    }
  }
};
