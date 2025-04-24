const { cmd } = require("../command");
const axios = require('axios');
const NodeCache = require('node-cache');

const searchCache = new NodeCache({ stdTTL: 300, checkperiod: 60, maxKeys: 100 });
const TIMEOUT_DURATION = 20000;
const API_TIMEOUT = 2000;
const MAX_RETRIES = 2;
const AUTO_SELECT_HD = true;

const frozenTheme = {
  header: `╭═══❖•°✴️°•❖═══╮\n   𝗠𝗔𝗡𝗝𝗨_𝗠𝗗 𝗠𝗢𝗩𝗜𝗘 𝗦𝗜𝗧𝗘🎥\n   ❅ 𝗧𝗛𝗘 𝗥𝗢𝗟𝗔𝗬 𝗗𝗔𝗥𝗞 𝗞𝗜𝗡𝗗𝗢𝗠 ❅\n╰═══❖•°〽✴️°•❖═══╯\n`,
  box: function(title, content) {
    return `${this.header}╔═════❖ ✴️ ❖═════╗\n   ✧ ${title} ✧\n╚═════❖ ✴️ ❖═════╝\n\n${content}\n\n✴️═════❖ ✴️ ❖═════✴️\n✧ 𝗜,𝗔𝗠  𝗗𝗘𝗠𝗢𝗡 𝗧𝗢 𝗧𝗛𝗜𝗦 𝗪𝗛𝗢𝗟𝗘 𝗪𝗢𝗥𝗟𝗗. ✧`;
  },
  getForwardProps: function() {
    return {
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        stanzaId: "BAE5" + Math.random().toString(16).substr(2, 12).toUpperCase(),
        mentionedJid: [],
        conversionData: {
          conversionDelaySeconds: 0,
          conversionSource: "frozen_queen",
          conversionType: "message"
        }
      }
    };
  },
  resultEmojis: ["📽️", "🧊", "👑", "🎥", "🎬", "📽️", "🎞️", "❅", "✧", "✳️"]
};

const makeApiCall = async (url, retries = MAX_RETRIES) => {
  while (retries > 0) {
    try {
      const response = await axios.get(url, { timeout: API_TIMEOUT });
      console.log(`API Response for ${url}: Success`);
      return response.data;
    } catch (error) {
      console.error(`API Error for ${url}:`, error.message);
      retries--;
      if (retries === 0) throw new Error(`Failed to fetch data: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};

const streamFile = async (url, fileName, caption, quoted, conn, from, frozenTheme) => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: API_TIMEOUT
    });

    await conn.sendMessage(from, {
      document: response.data,
      mimetype: "video/mp4",
      fileName,
      caption,
      ...frozenTheme.getForwardProps()
    }, { quoted });
  } catch (error) {
    throw new Error(`Streaming failed: ${error.message}`);
  }
};

cmd({
  pattern: "film",
  react: "🎬",
  desc: "Gᴇᴛ Mᴏᴠɪᴇs ғʀᴏᴍ Mᴀɴᴢᴜ_Mᴅ's ᴛʀᴇᴀsᴜʀʏ ᴛᴏ ᴇɴᴊᴏʏ ᴄɪɴᴇᴍᴀ",
  category: "Dᴀʀᴋ Kɪɴᴅᴏᴍ",
  filename: __filename,
}, async (conn, mek, m, { from, q, pushname, reply }) => {
  if (!q) {
    return reply(frozenTheme.box("Sɪɴʜᴀʟᴀ Sᴜʙ Mᴏᴠɪᴇ",
      "Usᴇ : .film <ғɪʟᴍ ɴᴀᴍᴇ>\n❅ ᴇx: .film Deadpool\n ᴅᴀʀᴋ: Sɪɴʜᴀʟᴀsᴜʙ Mᴏᴠɪᴇ Lɪsᴛ"));
  }

  try {
    const cacheKey = `film_search_${q.toLowerCase()}`;
    let searchData = searchCache.get(cacheKey);

    if (!searchData) {
      const searchUrl = `https://apis.davidcyriltech.my.id/movies/search?query=${encodeURIComponent(q)}`;
      searchData = await makeApiCall(searchUrl);
      if (!searchData || !searchData.status || !searchData.results || searchData.results.length === 0) {
        throw new Error("No movies found in sinhalasub site");
      }
      searchCache.set(cacheKey, searchData);
    }

    let filmList = `Sinhalasub Movie Risalts 🎬\n\nInput : ${q}\n\nReply Below Number 🔢,\nsinhalasub.lk results\n\n`;
    const films = searchData.results.slice(0, 10).map((film, index) => ({
      number: index + 1,
      title: film.title,
      imdb: film.imdb,
      year: film.year,
      link: film.link,
      image: film.image
    }));

    const prefetchPromises = films.slice(0, 3).map(async (film) => {
      const cacheKey = `download_${film.link}`;
      if (!searchCache.get(cacheKey)) {
        const downloadUrl = `https://apis.davidcyriltech.my.id/movies/download?url=${encodeURIComponent(film.link)}`;
        const downloadData = await makeApiCall(downloadUrl);
        searchCache.set(cacheKey, downloadData);
      }
    });
    await Promise.all(prefetchPromises);

    for (let i = 1; i <= 10; i++) {
      const film = films.find(f => f.number === i);
      filmList += `${i} || ${film ? `${film.title} (${film.year}) Sinhala Subtitles | සිංහල උපසිරැසි සමඟ` : ''}\n`;
    }
    filmList += `\n*MANJU_MD SINHALASUB SITE*`;

    const sentMessage = await conn.sendMessage(from, {
      text: filmList,
      ...frozenTheme.getForwardProps()
    }, { quoted: mek });

    const filmSelectionHandler = async (update) => {
      const message = update.messages[0];
      if (!message.message || !message.message.extendedTextMessage) return;

      const userReply = message.message.extendedTextMessage.text.trim();
      const stanzaId = message.message.extendedTextMessage.contextInfo.stanzaId;

      if (stanzaId !== sentMessage.key.id) return;

      const selectedNumber = parseInt(userReply);
      const selectedFilm = films.find(film => film.number === selectedNumber);

      if (!selectedFilm) {
        await conn.sendMessage(from, {
          text: frozenTheme.box("Mᴀɴᴊᴜ Wᴀʀɴɪɴɢ",
            "❅Invalid selection.!\n  Select a movie number\n Dᴀʀᴋ ɴɪɢʜᴛ are amazed"),
          ...frozenTheme.getForwardProps()
        }, { quoted: message });
        return;
      }

      conn.ev.off("messages.upsert", filmSelectionHandler);

      const downloadCacheKey = `download_${selectedFilm.link}`;
      let downloadData = searchCache.get(downloadCacheKey);

      if (!downloadData) {
        const downloadUrl = `https://apis.davidcyriltech.my.id/movies/download?url=${encodeURIComponent(selectedFilm.link)}`;
        downloadData = await makeApiCall(downloadUrl);
        searchCache.set(downloadCacheKey, downloadData);
      }

      if (!downloadData || !downloadData.status || !downloadData.movie || !downloadData.movie.download_links) {
        throw new Error("There is no download link for sinhalasub site.");
      }

      const downloadLinks = [];
      const allLinks = downloadData.movie.download_links;

      const sdLink = allLinks.find(link => link.quality === "SD 480p" && link.direct_download);
      if (sdLink) {
        downloadLinks.push({
          number: 1,
          quality: "SD QUALITY",
          size: sdLink.size,
          url: sdLink.direct_download
        });
      }

      let hdLink = allLinks.find(link => link.quality === "HD 720p" && link.direct_download);
      if (!hdLink) {
        hdLink = allLinks.find(link => link.quality === "FHD 1080p" && link.direct_download);
      }

      if (hdLink) {
        downloadLinks.push({
          number: 2,
          quality: "HD QUALITY",
          size: hdLink.size,
          url: hdLink.direct_download
        });
      }

      if (downloadLinks.length === 0) {
        throw new Error("SD හෝ HD ගුණාත්මක ලින්ක් නොමැත");
      }

      let selectedLink;
      if (AUTO_SELECT_HD && downloadLinks.length > 0) {
        selectedLink = downloadLinks.find(link => link.quality === "HD QUALITY") || downloadLinks[0];
      } else {
        let downloadOptions = `SɪɴʜᴀʟᴀSᴜʙ Mᴏᴠɪᴇ Dᴏᴡɴʟᴏᴀᴅ Sɪᴛᴇ 🎥\n\n`;
        downloadOptions += `*${selectedFilm.title} (${selectedFilm.year}) Sinhala Subtitles | සිංහල උපසිරැසි සමඟ*\n\n`;
        downloadOptions += `Mᴏᴠɪᴇ Qᴜᴀʟɪᴛʏ ☕︎>\n\n`;

        downloadLinks.forEach(link => {
          downloadOptions += `${link.number}.${link.quality} (${link.size})\n`;
        });
        downloadOptions += `\nPᴏᴡᴇʀᴅ Bʏ Mᴀɴᴢᴜ_MD ✔︎`;

        const downloadMessage = await conn.sendMessage(from, {
          image: { url: downloadData.movie.thumbnail || selectedFilm.image || "https://i.ibb.co/5Yb4VZy/snowflake.jpg" },
          caption: downloadOptions,
          ...frozenTheme.getForwardProps()
        }, { quoted: message });

        const qualitySelectionHandler = async (updateQuality) => {
          const qualityMessage = updateQuality.messages[0];
          if (!qualityMessage.message || !qualityMessage.message.extendedTextMessage) return;

          const qualityReply = qualityMessage.message.extendedTextMessage.text.trim();
          const qualityStanzaId = qualityMessage.message.extendedTextMessage.contextInfo.stanzaId;

          if (qualityStanzaId !== downloadMessage.key.id) return;

          const selectedQualityNumber = parseInt(qualityReply);
          selectedLink = downloadLinks.find(link => link.number === selectedQualityNumber);

          if (!selectedLink) {
            await conn.sendMessage(from, {
              text: frozenTheme.box("Mᴀɴᴊᴜ Wᴀʀɴɪɴɢ",
                " Invalid quality!\n Choose a quality number\n Dᴀʀᴋʀᴀʏ are amazed"),
              ...frozenTheme.getForwardProps()
            }, { quoted: qualityMessage });
            return;
          }

          conn.ev.off("messages.upsert", qualitySelectionHandler);
          await processDownload(selectedLink, selectedFilm, qualityMessage, conn, from, frozenTheme);
        };

        conn.ev.on("messages.upsert", qualitySelectionHandler);
        setTimeout(() => {
          conn.ev.off("messages.upsert", qualitySelectionHandler);
        }, TIMEOUT_DURATION);
        return;
      }

      await processDownload(selectedLink, selectedFilm, message, conn, from, frozenTheme);
    };

    conn.ev.on("messages.upsert", filmSelectionHandler);
    setTimeout(() => {
      conn.ev.off("messages.upsert", filmSelectionHandler);
    }, TIMEOUT_DURATION);

  } catch (e) {
    console.error("දෝෂය:", e);
    const errorMsg = frozenTheme.box("SɪɴʜᴀʟᴀSᴜʙ Aᴛᴛᴇɴᴛɪᴏɴ",
      `❅ දෝෂය: ${e.message || "sɪɴʜ�.aʟ�.aSᴜʙ destroyed the treasury"}\n❅ The sɪɴʜ�.aʟ�.aSᴜʙ sɪᴛᴇ is closed.\n❅ Fɪxᴇᴅ ᴢᴏᴏɴ Tʀʏ ʟ�.aɪᴛᴇʀ`);

    await reply(errorMsg);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});

async function processDownload(selectedLink, selectedFilm, message, conn, from, frozenTheme) {
  const sizeStr = selectedLink.size.toLowerCase();
  let sizeInGB = 0;

  if (sizeStr.includes("gb")) {
    sizeInGB = parseFloat(sizeStr.replace("gb", "").trim());
  } else if (sizeStr.includes("mb")) {
    sizeInGB = parseFloat(sizeStr.replace("mb", "").trim()) / 1024;
  }

  if (sizeInGB > 1) {
    await conn.sendMessage(from, {
      text: frozenTheme.box("Dᴀʀᴋ Wᴀʀɴɪɴɢ",
        ` The product is too big. (${selectedLink.size})!\n  Download directly: ${selectedLink.url}\n Choose a small quality`),
      ...frozenTheme.getForwardProps()
    }, { quoted: message });
    return;
  }

  try {
    await streamFile(
      selectedLink.url,
      `${selectedFilm.title} - ${selectedLink.quality}.mp4`,
      frozenTheme.box("Sɪɴʜᴀʟᴀ sᴜʙ Mᴏᴠɪᴇs",
        `${frozenTheme.resultEmojis[3]} *${selectedFilm.title}*\n${frozenTheme.resultEmojis[4]} ǫᴜᴀʟʟɪᴛʏ: ${selectedLink.quality}\n${frozenTheme.resultEmojis[2]} Bɪɢ ғɪʟᴇ: ${selectedLink.size}\n\n${frozenTheme.resultEmojis[8]} Your item shines in the Mᴀɴᴢᴜ_Mᴅ.!\n${frozenTheme.resultEmojis[9]} Mᴀɴᴢᴜ_ᴍᴅ ᴘᴏᴡᴇʀᴅ ʙʏ ᴘᴀᴛʜᴜᴍ ʀᴀᴢᴀᴘᴀᴋsʜᴇ`),
      message,
      conn,
      from,
      frozenTheme
    );

    await conn.sendMessage(from, { react: { text: frozenTheme.resultEmojis[0], key: message.key } });
  } catch (downloadError) {
    await conn.sendMessage(from, {
      text: frozenTheme.box("sɪɴʜᴀʟᴀsᴜʙ ᴡᴀʀɴɪɴɢ",
        ` ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ғᴀɪʟᴅ: ${downloadError.message}\n❅ ᴅɪʀᴇᴄᴛ ᴅᴏᴡɴʟᴏᴀᴅ: ${selectedLink.url}\n ᴛʀʏ ᴀɢᴀɪɴ`),
      ...frozenTheme.getForwardProps()
    }, { quoted: message });
  }
}
