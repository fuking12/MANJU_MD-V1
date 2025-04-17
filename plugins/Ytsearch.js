const axios = require("axios");
const { cmd } = require("../command.js");

cmd({
  pattern: "ytsearch",
  alias: ["yts"],
  desc: "YouTube වීඩියෝ සෙවීම",
  category: "downloader",
  use: '.ytsearch <search term>',
  filename: __filename,
}, async (m, sock, { args, reply }) => {
  const q = args.join(" ");
  if (!q) return reply("කරුණාකර සෙවිය යුතු වීඩියෝවක නමක් සඳහන් කරන්න!\n\nඋදා: `.ytsearch hiru news`");

  const apiKey = "GENUX-WXSU5DK";
  const url = `https://api.genux.me/api/search/yt-search?query=${encodeURIComponent(q)}&apikey=${apiKey}`;

  try {
    const { data } = await axios.get(url);

    if (!data || !data.result || data.result.length === 0) {
      return reply("කිසිදු වීඩියෝවක් හමු නොවුණා!");
    }

    let responseText = `🔎 *YouTube සෙවුම් ප්‍රතිඵල*\n\n`;

    data.result.slice(0, 5).forEach((vid, i) => {
      responseText += `*${i + 1}. ${vid.title}*\n`;
      responseText += `📺 නාලිකාව: ${vid.channel.name}\n`;
      responseText += `⏱ දිග: ${vid.duration}\n`;
      responseText += `🔗 https://youtu.be/${vid.videoId}\n\n`;
    });

    reply(responseText);
  } catch (err) {
    console.error("YT Search Error:", err);
    reply("කණගාටුයි, YouTube සෙවීමේදී දෝෂයක් සිදුවුණා!");
  }
});
