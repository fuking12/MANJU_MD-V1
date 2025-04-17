const axios = require("axios");

module.exports = {
  cmd: ['xnxx'],
  desc: "Ginux XNXX Video Downloader",
  category: "downloader",
  use: '<search terms>',
  async handler(m, { text, sendMessage }) {
    if (!text) {
      return m.reply("වැදගත් වචනයක් සෙවීම සඳහා ලබාදෙන්න.\n\nඋදා: `.xnxx fuck`");
    }

    try {
      const query = encodeURIComponent(text);
      const apiUrl = `https://api.genux.me/api/download/xnxx-download?query=${query}&apikey=GENUX-WXSU5DK`;

      const res = await axios.get(apiUrl);
      const result = res.data.result;

      if (!result || !result.video || !result.title) {
        return m.reply("වීඩියෝවක් හමු නොවුණා.");
      }

      const caption = `*🎥 ශීර්ෂය:* ${result.title}
*⏱️ ධාවන කාලය:* ${result.duration}
*📁 විශාලත්වය:* ${result.filesize}
*🔗 Source:* ${result.source}`;

      await sendMessage(m.chat, {
        video: { url: result.video },
        caption,
      }, { quoted: m });

    } catch (err) {
      console.error("Ginux XNXX Plugin Error:", err);
      m.reply("වීඩියෝව ලබා ගැනීමේ දෝෂයක් හට ගෙන ඇත.");
    }
  }
};
