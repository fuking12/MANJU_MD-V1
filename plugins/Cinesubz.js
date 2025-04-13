const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  cmd: ['film'],
  help: 'සිනමා ලිපිනයක් හෝ නාමයක් ලබා දී සිනමා පිළිබඳ විස්තර සහ බාගැනීමේ සබැඳි ලබා ගන්න',
  desc: 'Movie Downloader with Sinhala UI',
  use: '.film [movie name or link]',
  category: 'Movie Downloader',
  async handler(m, { text, args, used, prefix, command }) {
    if (!text) return m.reply("කරුණාකර සිනමා නාමය හෝ link එකක් ලබා දෙන්න.");

    const searchUrl = `https://cinesubz.xyz/?s=${encodeURIComponent(text)}`;
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    };

    // --- Step 1: Search for movies ---
    let searchRes = await axios.get(searchUrl, { headers });
    const $ = cheerio.load(searchRes.data);
    let movies = [];

    $('.result-item').each((i, el) => {
      const title = $(el).find('.title').text().trim();
      const link = $(el).find('a').attr('href');
      const thumbnail = $(el).find('img').attr('src');
      if (title && link) movies.push({ title, link, thumbnail });
    });

    if (movies.length === 0) return m.reply("කිසිඳු සිනමාක් සොයාගත නොහැකි විය!");

    // --- Step 2: Show movie list to user ---
    let listMsg = `🎬 ඔබ සෙවූ "${text}" සඳහා ගැළපෙන සිනමා:\n\n`;
    for (let i = 0; i < movies.length; i++) {
      listMsg += `${i + 1}. ${movies[i].title}\n`;
    }
    listMsg += `\nකරුණාකර බාගත කිරීමට අවශ්‍ය සිනමා අංකය ලබා දෙන්න (1-${movies.length}):`;

    await m.sendMessage(m.chat, { image: { url: movies[0].thumbnail }, caption: listMsg }, { quoted: m });

    const response = await m.bot.waitForMessage(m.chat, m.sender, 30);
    const selection = parseInt(response?.text?.trim());

    if (!selection || selection < 1 || selection > movies.length) {
      return m.reply("වලංගු අංකයක් ලබා දෙන්න!");
    }

    const selectedMovie = movies[selection - 1];

    // --- Step 3: Scrape download links ---
    const moviePage = await axios.get(selectedMovie.link, { headers });
    const $$ = cheerio.load(moviePage.data);

    const scripts = $$("script").map((i, el) => $$(el).html()).get();
    const jsonScript = scripts.find(s => s.includes("fileSize"));
    if (!jsonScript) return m.reply("බාගත කිරීමේ සබැඳි හමු නොවීය.");

    const jsonMatch = jsonScript.match(/.*/);
    if (!jsonMatch) return m.reply("JSON තොරතුරු හමු නොවීය.");

    let jsonResponses = [];
    try {
      jsonResponses = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return m.reply("බාගත කිරීම් තොරතුරු කියවිය නොහැක.");
    }

    const linksMsg = jsonResponses.map((res, i) => {
      return `📥 *${i + 1}. ${res.label}*\nFile Size: ${res.fileSize}`;
    }).join("\n");

    await m.reply(`📀 සෙරීස් / චිත්‍රපටය සඳහා ලබාගත හැකි ගුණාත්මතාවයන්:\n\n${linksMsg}\n\nකරුණාකර බාගත කිරීමට අවශ්‍ය අංකය යොදන්න:`);

    const res2 = await m.bot.waitForMessage(m.chat, m.sender, 30);
    const selectedIndex = parseInt(res2?.text?.trim());

    if (!selectedIndex || selectedIndex < 1 || selectedIndex > jsonResponses.length) {
      return m.reply("වලංගු අංකයක් ලබා දෙන්න!");
    }

    const selectedDownload = jsonResponses[selectedIndex - 1];

    // --- Step 4: Check file size before sending link ---
    const sizeText = selectedDownload.fileSize || "0 MB";
    const sizeMatch = sizeText.match(/([\d.]+)\s*(GB|MB)/i);
    let fileSizeMB = 0;

    if (sizeMatch) {
      fileSizeMB = parseFloat(sizeMatch[1]) * (sizeMatch[2].toUpperCase() === "GB" ? 1024 : 1);
    }

    if (fileSizeMB > 3072) {
      return m.reply(`⛔ මෙම ගුණාත්මතාවය සඳහා ගොනුවේ විශාලත්වය (${selectedDownload.fileSize}) වඩා වැඩිය. කරුණාකර අනෙක් ගුණාත්මතාවයක් තෝරන්න.`);
    }

    // --- Step 5: Generate final link ---
    const finalLink = await generateModifiedLink(selectedDownload.src, headers);
    if (!finalLink) return m.reply("බාගත සබැඳිය ලබා ගැනීම අසාර්ථක විය.");

    // --- Step 6: Send final download link ---
    await m.sendMessage(m.chat, {
      image: { url: selectedMovie.thumbnail },
      caption:
        `🎬 *${selectedMovie.title}*\n\n` +
        `📥 ගුණාත්මතාව: ${selectedDownload.label}\n` +
        `💾 File Size: ${selectedDownload.fileSize}\n\n` +
        `➡️ බාගත කිරීම: ${finalLink}`
    }, { quoted: m });
  }
};

async function generateModifiedLink(url, headers) {
  try {
    const res = await axios.get(url, { headers, maxRedirects: 5 });
    const $ = cheerio.load(res.data);
    const iframe = $("iframe").attr("src");
    if (!iframe) return null;

    const hostRes = await axios.get(iframe, { headers, maxRedirects: 5 });
    const host$ = cheerio.load(hostRes.data);
    const script = host$("script").map((i, el) => host$(el).html()).get().find(s => s.includes("sources"));

    const match = script?.match(/sources:\s*\s*\{.*?file:\s*["'](.+?)["']/);
    return match ? match[1] : null;
  } catch (err) {
    return null;
  }
}
