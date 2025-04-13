const axios = require("axios");
const cheerio = require("cheerio");
const { fromBuffer } = require("file-type");

module.exports = {
  cmd: ["getfilm"],
  handler: async (m, { conn, args }) => {
    const url = args[0];
    if (!url) return m.reply("⛔ URL එකක් නොමැත!");

    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const title = $("h1.entry-title").text().trim();
    const thumb = $("img.attachment-full").first().attr("src");

    const links = [];
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      if (href && (href.includes("mega.nz") || href.includes("gofile") || href.includes("pixeldrain") || href.includes(".mkv") || href.includes(".mp4"))) {
        links.push(href);
      }
    });

    if (links.length === 0) return m.reply("⛔ බාගත කිරීමේ link හමු නොවුණා!");

    let text = `🎥 *${title}*\n\n`;
    links.forEach((l, i) => text += `📥 Link ${i + 1}: ${l}\n`);
    text += `\n⚠️ දැනට සෘජු බාගත කිරීම් නොකරන ලදි. මෙම Links භාවිතා කරන්න.`;

    await conn.sendMessage(m.chat, {
      image: { url: thumb },
      caption: text,
    }, { quoted: m });
  }
};
