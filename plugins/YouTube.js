const { youtubedl } = require('@bochilteam/scraper');

module.exports = {
  name: 'youtube',
  alias: ['yt', 'ytmp4'],
  description: 'YouTube වීඩියෝවක් බාගත කරන්න - MP4 පමණි',
  category: 'downloader',
  use: '<youtube_url>',
  async execute(m, { conn, args }) {
    if (!args[0]) return m.reply('කරුණාකර YouTube ලින්ක් එකක් ලබා දෙන්න.');

    const url = args[0];
    if (!url.match(/(youtu\.be|youtube\.com)/)) {
      return m.reply('වලංගු YouTube ලින්ක් එකක් ලබා දෙන්න.');
    }

    await m.reply('විඩියෝව ලබා ගන්නා中...');

    try {
      const result = await youtubedl(url);
      console.log('YouTube Result:', result);

      if (!result || !result.video) {
        return m.reply('වීඩියෝ එක සොයාගත නොහැක.');
      }

      const { title, video, thumbnail } = result;
      const mp4 = video['360p'] || video['480p'] || video['720p'] || Object.values(video)[0];

      if (!mp4 || !mp4.url) {
        return m.reply('බාගත කිරීම අසාර්ථකයි.');
      }

      await conn.sendMessage(m.chat, {
        video: { url: mp4.url },
        caption: `✅ *මාතෘකාව:* ${title}`
      }, { quoted: m });

    } catch (err) {
      console.error('YouTube Plugin Error:', err);
      m.reply('දෝෂයක් ඇතිවී ඇත. කරුණාකර නැවත උත්සාහ කරන්න.');
    }
  }
};
