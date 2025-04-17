const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: 'apk',
  desc: 'App download from Genux',
  category: 'downloader',
  filename: __filename
}, async (client, message, m, { q, reply }) => {
  if (!q) return reply('කරුණාකර app එකක් සෙවීමට නමක් ලබාදෙන්න.\n\nඋදාහරණයක්: *.apk whatsapp*');

  try {
    const apiKey = 'GENUX-WXSU5DK'; // ඔබේ Genux API Key එක
    const url = `https://api.genux.me/api/download/apk?query=${encodeURIComponent(q)}&apikey=${apiKey}`;
    const res = await axios.get(url);

    if (!res.data || !res.data.status || !res.data.result || res.data.result.length === 0) {
      return reply('App එක සොයාගත නොහැක.');
    }

    const app = res.data.result[0];
    const caption = `*📱 App Name:* ${app.name}
*🧑‍💻 Developer:* ${app.developer}
*🧮 Version:* ${app.version}
*🧷 Size:* ${app.size}
*⬇️ Downloads:* ${app.downloads}
*🔗 Link:* ${app.downloadLink}`;

    await client.sendMessage(m.chat, {
      image: { url: app.icon },
      caption
    }, { quoted: m });
  } catch (err) {
    console.log(err);
    reply('මට දැන් මේ app එක ලබාගන්න බෑ. ටිකක් විතරකින් නැවත උත්සහ කරන්න.');
  }
});
