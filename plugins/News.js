const axios = require("axios");
const cheerio = require("cheerio");
const { cmd } = require("../command");

cmd({
  pattern: "news",
  alias: ["පුවත්", "sinhala-news"],
  desc: "අද ශ්‍රී ලංකාවේ ප්‍රධාන පුවත්",
  category: "Sinhala",
  react: "📰",
  filename: __filename,
}, async (client, m, msg) => {
  try {
    const { data } = await axios.get("https://www.adaderana.lk/");
    const $ = require("cheerio").load(data);
    let response = "📰 *AdaDerana.lk – අද ප්‍රධාන පුවත්:*\n\n";

    $("div.lead-news-content > h2 > a").each((i, el) => {
      if (i < 5) {
        const title = $(el).text().trim();
        const link = $(el).attr("href");
        response += `*${i + 1}. ${title}*\n🔗 ${link}\n\n`;
      }
    });

    await msg.reply(response.trim());
  } catch (err) {
    console.error("News Plugin Error:", err);
    await msg.reply("⚠️ පුවත් ලබා ගැනීමේදී දෝෂයක් ඇතිවුණා. කරුණාකර පසුව උත්සාහ කරන්න.");
  }
});
