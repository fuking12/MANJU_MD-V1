const axios = require('axios');

module.exports = {
  name: 'apk',
  alias: ['.apk'],
  desc: 'Download Android APKs using Genux API',
  category: 'Downloader',
  async execute(client, m, { text, prefix, command }) {
    if (!text) return m.reply(`පාවිච්චිය:\n${prefix}${command} whatsapp`);
    try {
      let res = await axios.get(`https://api.genux.me/api/download/apk?query=${encodeURIComponent(text)}&apikey=GENUX-WXSU5DK`);
      let result = res.data.result;

      if (!result || result.length === 0) return m.reply('App එක හමු නොවීය.');

      let msg = `*📲 APK Search Result: ${text}*\n\n`;
      result.slice(0, 5).forEach((app, i) => {
        msg += `*${i + 1}. ${app.name}*\n`;
        msg += `📦 Package: ${app.package}\n`;
        msg += `📥 Download: ${app.download}\n\n`;
      });

      m.reply(msg);
    } catch (e) {
      console.error(e);
      m.reply('App එක download කරන්න බැරිවුණා. කරුණාකර නැවත උත්සාහ කරන්න.');
    }
  }
};
