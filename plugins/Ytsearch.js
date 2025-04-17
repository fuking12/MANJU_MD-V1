const axios = require("axios");
const { cmd } = require("../command.js");

cmd({
  pattern: "ytsearch",
  alias: ["yts"],
  desc: "YouTube වීඩියෝ සෙවීම",
  category: "downloader",
  use: '.ytsearch <video name>',
  filename: __filename,
}, async (m, sock, { args, reply }) => {
  const query = args.join(" ");
  if (!query) {
    return reply(
      "කරුණාකර සෙවිය යුතු වීඩියෝවක නමක් සඳහන් කරන්න!\n\n" +
      "උදා: `.ytsearch hiru news`"
    );
  }

  const apiKey = "GENUX-WXSU5DK";
  const apiUrl = `https://api.genux.me/api/search/yt-search?query=${encodeURIComponent(query)}&apikey=${apiKey}`;

  try {
    const res = await axios.get(apiUrl);

    // Check if response and data is valid
    if (!res || !res.data || !res.data.result || res.data.result.length === 0) {
      return reply("සෙවුමට ගැලපෙන කිසිවක් හමු නොවුණා.");
    }

    const results = res.data.result.slice(0, 5); // First 5 results
    let text = `🔎 *YouTube සෙවුම් ප්‍රතිඵල*\n\n`;

    results.forEach((video, index) => {
      text += `*${index + 1}. ${video.title}*\n`;
      text += `📺 නාලිකාව: ${video.channel.name}\n`;
      text += `⏱️ දිග: ${video.duration}\n`;
      text += `🔗 https://youtu.be/${video.videoId}\n\n`;
    });

    reply(text);

  } catch (error) {
    console.error("YTSearch Error:", error.message);
    reply("කණගාටුයි! සෙවුමක් කරන්න නොහැකි වුණා. කරුණාකර පසුව උත්සාහ කරන්න.");
  }
});
