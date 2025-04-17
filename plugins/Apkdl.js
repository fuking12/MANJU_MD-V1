const axios = require("axios");

module.exports = {
  cmd: ['app', 'apk', 'apkdl'],
  desc: "APK App Downloader via Ginux API",
  category: "downloader",
  use: "<app name>",
  async handler(m, { text, sendMessage }) {
    if (!text) {
      return m.reply("ඇප් එකේ නම ලබාදෙන්න.\n\nඋදා: `.app whatsapp`");
    }

    try {
      const query = encodeURIComponent(text);
      const url = `https://api.genux.me/api/download/apk?query=${query}&apikey=GENUX-WXSU5DK`;

      const res = await axios.get(url);
      const result = res.data.result;

      if (!result || !result.app_name) {
        return m.reply("ඇප් එකක් හමු නොවුණා. වෙනත් නමක් ට්‍රයි කරන්න.");
      }

      const msg = `*📱 APP NAME:* ${result.app_name}
*🆔 PACKAGE:* ${result.package_name}
*🧑‍💻 DEVELOPER:* ${result.developer}
*🆚 VERSION:* ${result.version}
*📦 SIZE:* ${result.size}
*🔗 DOWNLOAD:* ${result.download_link}
`;

      await sendMessage(m.chat, {
        image: { url: result.icon },
        caption: msg
      }, { quoted: m });

    } catch (err) {
      console.error("APK Plugin Error:", err);
      m.reply("ඇප් එක ලබා ගැනීමේදී දෝෂයක් ඇතිවිය.");
    }
  }
};
