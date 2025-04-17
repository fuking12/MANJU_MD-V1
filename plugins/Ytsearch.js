const axios = require("axios");

module.exports = {
  pattern: "ytsearch",
  alias: ["yts"],
  desc: "Search YouTube videos",
  category: "downloader",
  react: "🔎",
  use: ".ytsearch <video name>",

  async function(sock, m, msg, { q, reply }) {
    if (!q) return reply("කරුණාකර සෙවිය යුතු වීඩියෝවක නමක් දක්වන්න!\n\nඋදා: `.ytsearch hiru news`");

    const apiKey = "GENUX-WXSU5DK";
    const url = `https://api.genux.me/api/search/yt-search?query=${encodeURIComponent(q)}&apikey=${apiKey}`;

    try {
      const { data } = await axios.get(url);

      if (!data || !data.result || data.result.length === 0) {
        return reply("වීඩියෝ එකක් හමු නොවුණා!");
      }

      let txt = `🔎 *YouTube Search Results:*\n\n`;
      data.result.slice(0, 5).forEach((vid, i) => {
        txt += `*${i + 1}. ${vid.title}*\n`;
        txt += `📺 Channel: ${vid.channel.name}\n`;
        txt += `⏱ Duration: ${vid.duration}\n`;
        txt += `🔗 https://youtu.be/${vid.videoId}\n\n`;
      });

      reply(txt);
    } catch (e) {
      console.error("YouTube Search Error:", e);
      reply("කණගාටුයි, YouTube සෙවීමේදී දෝෂයක් ඇතිවුණා!");
    }
  },
};
