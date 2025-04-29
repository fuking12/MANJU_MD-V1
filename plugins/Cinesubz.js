const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { cmd } = require("../command");

async function getMovieDetailsAndDownloadLinks(query) {
  let browser;
  try {
    // Headless browser launch කරන්න
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // User-Agent set කරන්න
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');

    console.log(`Searching for: ${query}`);
    // Search page එකට යන්න
    await page.goto(`https://cinesubz.co/?s=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2', timeout: 60000 });

    // Cloudflare verification එක pass වෙන්න wait කරන්න
    await page.waitForTimeout(5000); // 5 seconds wait for Cloudflare to resolve

    // Page content ගන්න
    const html = await page.content();
    const $ = cheerio.load(html);
    const films = [];

    $('article').each((i, element) => {
      const filmName = $(element).find('.details .title a').text().trim();
      const imageUrl = $(element).find('.image .thumbnail img').attr('src');
      const description = $(element).find('.details .contenido p').text().trim();
      const year = $(element).find('.details .meta .year').text().trim();
      const imdbText = $(element).find('.details .meta .rating:first').text().trim();
      const imdb = imdbText.replace('IMDb', '').trim();
      const movieLink = $(element).find('.image .thumbnail a').attr('href');
      films.push({ filmName, imageUrl, description, year, imdb, movieLink });
    });

    console.log(`Found ${films.length} films`);

    for (const film of films) {
      if (!film.movieLink) continue;

      console.log(`Fetching page: ${film.movieLink}`);
      // Delay එකක් යොදන්න
      await page.waitForTimeout(2000); // 2 seconds delay between requests
      await page.goto(film.movieLink, { waitUntil: 'networkidle2', timeout: 60000 });

      // Page content ගන්න
      const moviePageHtml = await page.content();
      const $$ = cheerio.load(moviePageHtml);
      const downloadLinks = [];

      const isTvSeries = film.movieLink.includes('/episodes/') || $$('div.episode, div.episode-links, div.series').length > 0;
      console.log(`Is TV Series: ${isTvSeries}`);

      const selectors = [
        'div.download-links a',
        'div.episode-links a',
        'div.links a',
        'div.download a',
        'div.single-links a',
        'div.entry-content a',
        'div.post-content a',
        'div.content a',
        'a[href*="/api-"]',
        'a[href*=".mp4"]',
        'a[href*="download"]',
        'a[href*="mediafire"]',
        'a[href*="mega"]',
        'a[href*="drive.google"]',
        'a[href*="cinesubz.co"]'
      ];

      selectors.forEach(selector => {
        $$(selector).each((index, element) => {
          const link = $$(element).attr('href') || '';
          const qualityText = $$(element).text().trim().toLowerCase();

          console.log(`Found link: ${link}, Text: ${qualityText}`);

          if (link && !qualityText.includes('telegram')) {
            let quality = '';
            if (qualityText.includes('1080p') || link.includes('1080p')) quality = '1080p';
            else if (qualityText.includes('720p') || link.includes('720p')) quality = '720p';
            else if (qualityText.includes('480p') || link.includes('480p')) quality = '480p';
            else if (qualityText.includes('hd')) quality = 'HD';
            else if (qualityText.includes('sd')) quality = 'SD';
            else quality = 'Unknown Quality';

            if (quality === 'Unknown Quality') return;

            const size = qualityText.match(/\d+\.?\d*\s*(gb|mb)/i)?.[0] ||
                         $$(element).parent().text().match(/\d+\.?\d*\s*(gb|mb)/i)?.[0] ||
                         'Unknown';

            downloadLinks.push({ link, quality, size });
          }
        });
      });

      console.log(`Download links for ${film.filmName}:`, downloadLinks);
      film.downloadLinks = downloadLinks;
    }

    return films;
  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

cmd({
  pattern: "mv",
  alias: ["movie"],
  use: ".film <query>",
  desc: "Search and get details of films.",
  category: "search",
  filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
  try {
    if (!q) return reply('🔎 Please provide a film name.');

    await m.react('🎬');
    const os = require('os');
    let hostname;
    const hostNameLength = os.hostname().length;

    if (hostNameLength === 12) {
      hostname = "𝚁𝙴𝙿𝙻𝙸𝚃";
    } else if (hostNameLength === 36) {
      hostname = "𝙷𝙴𝚁𝙾𝙺𝚄";
    } else if (hostNameLength === 8) {
      hostname = "𝙺𝙾𝚈𝙴𝙱";
    } else {
      hostname = "𝚅𝙿𝚂 || 𝚄𝙽𝙺𝙽𝙾𝚆𝙽";
    }

    const jsonURL = 'https://github.com/haansaanaa/haansaanaa/raw/main/haansaanaa.js';
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(jsonURL);
    const jsonData = await response.json();
    const kramretaw = jsonData.kramretaw || "*ᴍᴏɴᴇʏ ʜᴇɪꜱᴛ ᴍᴅ*\n* ᴍʀ ᴅɪʟ�.a ᴏꜰᴄ";

    const films = await getMovieDetailsAndDownloadLinks(q);

    if (films.length === 0) {
      return reply('❌ No movies found for your query.');
    }

    let filmListMessage = "📢 *\`Money Heist MD\`*\n\n🎥 *Movie Search Results*\n*Reply Number ⤵️*\n\n";
    const numberEmojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    films.forEach((film, index) => {
      let adjustedIndex = index + 1;
      let emojiIndex = adjustedIndex.toString().split("").map(num => numberEmojis[num]).join("");
      filmListMessage += `${emojiIndex} *${film.filmName}*\n\n`;
    });

    const sentMessage = await conn.sendMessage(from, {
      image: { url: "https://drive.google.com/uc?export=download&id=16ub1c6GS8fxBLEHfRdEvCa2jyLGChB1p" },
      caption: `${filmListMessage}\n\n${kramretaw}`,
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363398681287064@newsletter',
          newsletterName: "Money Heist MD ツ",
          serverMessageId: 999,
        }
      }
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: "🔢", key: sentMessage.key } });

    conn.ev.on('messages.upsert', async (msgUpdate) => {
      const msg = msgUpdate.messages[0];
      if (!msg.message || !msg.message.extendedTextMessage) return;

      const selectedOption = msg.message.extendedTextMessage.text.trim();
      if (msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id) {
        const selectedIndex = parseInt(selectedOption.trim()) - 1;
        if (selectedIndex >= 0 && selectedIndex < films.length) {
          await conn.sendMessage(from, { react: { text: "🔄", key: msg.key } });
          const film = films[selectedIndex];

          let filmDetailsMessage = `📢 *\`Money Heist MD\`*\n\n*🎬 ${film.filmName}* (${film.year})\n`;
          filmDetailsMessage += `*⭐ IMDb: ${film.imdb}*\n`;
          filmDetailsMessage += `*📝 ${film.description}*\n\n`;

          const filteredDownloadLinks = film.downloadLinks.filter(dl => !dl.quality.toLowerCase().includes("telegram"));
          if (filteredDownloadLinks.length > 0) {
            filmDetailsMessage += `*Reply Number ⤵️*\n\n`;
            const numberEmojis1 = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
            filteredDownloadLinks.forEach((dl, index) => {
              const emojiIndex1 = (index + 1).toString().split("").map(num => numberEmojis1[num]).join("");
              let cleanedQuality = dl.quality.replace(/(SD|HD|BluRay|FHD|WEBRip|WEB-DL|WEBDL|Direct)/gi, "").trim();
              filmDetailsMessage += `${emojiIndex1} *${cleanedQuality} - ${dl.size}*\n`;
            });
          } else {
            filmDetailsMessage += `❌ No valid download links available.\n`;
          }

          const sentMessage1 = await conn.sendMessage(from, {
            image: { url: `${film.imageUrl}` },
            caption: `${filmDetailsMessage}\n\n${kramretaw}`,
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363398681287064@newsletter',
                newsletterName: "Money Heist MD ツ",
                serverMessageId: 999,
              }
            }
          }, { quoted: msg });

          await conn.sendMessage(from, { react: { text: "🔢", key: sentMessage1.key } });

          conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg1 = msgUpdate.messages[0];
            if (!msg1.message || !msg1.message.extendedTextMessage) return;

            const selectedOption = msg1.message.extendedTextMessage.text.trim();
            if (msg1.message.extendedTextMessage.contextInfo && msg1.message.extendedTextMessage.contextInfo.stanzaId === sentMessage1.key.id) {
              const selectedIndex1 = parseInt(selectedOption) - 1;
              if (selectedIndex1 >= 0 && selectedIndex1 < filteredDownloadLinks.length) {
                await conn.sendMessage(from, { react: { text: "⬇️", key: msg1.key } });
                const selectedLink = filteredDownloadLinks[selectedIndex1];

                if (["𝙷𝙴𝚁𝙾𝙺𝚄", "𝙺𝙾𝚈𝙴𝙱"].includes(hostname)) {
                  await conn.sendMessage(from, { react: { text: "🚫", key: msg1.key } });
                  await conn.sendMessage(from, { text: `🚫 *Cannot send large files on ${hostname}.*\n\n⚠️ Heroku and Koyeb platforms have restrictions on sending large media files. To proceed, please deploy this bot on a VPS (e.g., DigitalOcean, Linode) or a platform that supports large file transfers.` }, { quoted: msg1 });
                  return;
                }

                let fileSizeMB = 0;
                if (selectedLink.size !== 'Unknown') {
                  fileSizeMB = parseFloat(selectedLink.size) * (selectedLink.size.includes("GB") ? 1024 : 1);
                } else {
                  await conn.sendMessage(from, { react: { text: "🚫", key: msg1.key } });
                  await conn.sendMessage(from, { text: `🚫 *File size unknown.*\n\n⚠️ Cannot proceed with download due to unknown file size. Please try another link.` }, { quoted: msg1 });
                  return;
                }

                if (fileSizeMB > 2000) {
                  await conn.sendMessage(from, { react: { text: "🚫", key: msg1.key } });
                  await conn.sendMessage(from, { text: `🚫 *Cannot send files larger than 2GB.*\n\n⚠️ WhatsApp supports only up to 2GB for file uploads. Please try a lower quality link.` }, { quoted: msg1 });
                  return;
                }

                await conn.sendMessage(from, {
                  document: { url: `${selectedLink.link}` },
                  mimetype: "video/mp4",
                  fileName: `${film.filmName}.mp4`,
                  caption: `*🎥 ${film.filmName}*\n\n*⏳ Year ${film.year}*\n*⭐ Rating ${film.imdb}*\n*📦 Size ${selectedLink.size}*\n\n> 📝 *${film.description}*\n\n${kramretaw}`
                }, { quoted: msg1 });

                await conn.sendMessage(from, { react: { text: "✅", key: msg1.key } });
              } else {
                await conn.sendMessage(from, { react: { text: "❌", key: msg1.key } });
                await conn.sendMessage(from, { text: "❌ Invalid selection. Please select a valid number." }, { quoted: msg1 });
              }
            }
          });
        } else {
          await conn.sendMessage(from, { react: { text: "❌", key: msg.key } });
          await conn.sendMessage(from, { text: "❌ Invalid selection. Please select a valid number." }, { quoted: msg });
        }
      }
    });
  } catch (error) {
    console.error(error);
    reply('⚠️ An error occurred while searching for films.');
  }
});
