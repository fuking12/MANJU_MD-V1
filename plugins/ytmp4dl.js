module.exports = {
  name: 'ytmp4dl',
  description: 'YouTube Video Downloader Button Handler',
  category: 'downloader',
  use: '<direct_download_url>',
  async execute(m, { conn, args }) {
    if (!args[0]) return m.reply('බාගත කිරීමේ ලින්ක් එක නොමැත.');

    let url = args[0];
    m.reply('වීඩියෝව බාගත කරමින් පවතී...');
    try {
      await conn.sendMessage(m.chat, {
        video: { url },
        caption: 'ඔබේ වීඩියෝව මෙන්න!'
      }, { quoted: m });
    } catch (err) {
      console.error(err);
      m.reply('බාගත කිරීමේදී දෝෂයක් ඇතිවිය. වෙනත් quality එකක් උත්සාහ කරන්න.');
    }
  }
};
