const { ytdl } = require('@bochilteam/scraper');
const { default: axios } = require('axios');

module.exports = {
  name: 'youtube',
  alias: ['yt', 'ytmp4', 'ytvideo'],
  description: 'YouTube Video Downloader - MP4',
  category: 'downloader',
  use: '<youtube_url>',
  async execute(m, { conn, args }) {
    if (!args[0]) return m.reply('කරුණාකර YouTube වීඩියෝ ලින්ක් එකක් ලබා දෙන්න.');

    let yturl = args[0];
    if (!yturl.match(/^(https?:\/\/)?(www\.youtube\.com|youtu\.be)\//))
      return m.reply('වලංගු YouTube වීඩියෝ ලින්ක් එකක් ලබා දෙන්න.');

    m.reply('වීඩියෝ විස්තර ලබා ගන්නා중...');

    try {
      const data = await ytdl(yturl);
      const { title, thumbnail, video, author } = data;

      let qualities = Object.keys(video)
        .filter(q => video[q].hasOwnProperty('url'))
        .sort((a, b) => parseInt(b) - parseInt(a)); // high to low

      let buttons = qualities.slice(0, 5).map(q => ({
        buttonId: `.ytmp4dl ${video[q].url}`,
        buttonText: { displayText: `${q} (${(video[q].fileSize / 1024 / 1024).toFixed(1)}MB)` },
        type: 1,
      }));

      let caption = `*📽️ මාතෘකාව:* ${title}\n*👤 නාලිකාව:* ${author.name}\n*📊 ගුණාත්මතාවක් තෝරන්න:*\n\n_ඔබට ගැලපෙන quality එක තෝරන්න_`;

      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption,
        footer: 'MANJU_MD YouTube Downloader',
        buttons,
        headerType: 4
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      m.reply('විඩියෝ එක ලබා ගැනීමේදී දෝෂයක් ඇතිවී ඇත. නැවත උත්සාහ කරන්න.');
    }
  }
};
