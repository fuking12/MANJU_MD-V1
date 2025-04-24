const { cmd } = require("../command");
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache එක initialize කිරීම (30 තත්පර TTL, max 100 keys)
const searchCache = new NodeCache({ stdTTL: 30, checkperiod: 60, maxKeys: 100 });

// Constants
const TIMEOUT_DURATION = 60000; // 60 seconds timeout for listeners
const API_TIMEOUT = 5000; // 5 seconds timeout for API calls
const MAX_RETRIES = 3; // Maximum retries for API calls

// ======================
// FROZEN QUEEN තේමාව
// ======================
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

// Utility function to make API calls with retries
const makeApiCall = async (url, retries = MAX_RETRIES) => {
  while (retries > 0) {
    try {
      const response = await axios.get(url, { timeout: API_TIMEOUT });
      return response.data;
    } catch (error) {
      retries--;
      if (retries === 0) throw new Error(`Failed to fetch data: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Film සෙවුම් සහ ඩවුන්ලෝඩ් command එක
cmd({
  pattern: "film",
  react: "🎬",
  desc: "Gᴇᴛ Mᴏᴠɪᴇs ғʀᴏᴍ Mᴀɴᴊᴜ_Mᴅ's ᴛʀᴇᴀsᴜʀʏ ᴛᴏ ᴇɴᴊᴏʏ ᴄɪɴᴇᴍᴀ",
  category: "Dᴀʀᴋ Kɪɴᴅᴏᴍ",
  filename: __filename,
}, async (conn, mek, m, { from, q, pushname, reply }) => {
  if (!q) {
    return reply(frozenTheme.box("Sɪɴʜᴀʟᴀ Sᴜʙ Mᴏᴠɪᴇ",
      "Usᴇ : .film <ғɪʟᴍ ɴᴀᴍᴇ>\n❅ ᴇx: .film Deadpool\n ᴅᴀʀᴋ: Sɪɴʜᴀʟᴀsᴜʙ Mᴏᴠɪᴇ Lɪsᴛ"));
  }

  try {
    // Step 1: Cache එකේ චිත්‍රපට තොරතුරු තිබේදැයි පරීක්ෂා කිරීම
    const cacheKey = `film_search_${q.toLowerCase()}`;
    let searchData = searchCache.get(cacheKey);

    if (!searchData) {
      const searchUrl = `https://apis.davidcyriltech.my.id/movies/search?query=${encodeURIComponent(q)}`;
      searchData = await makeApiCall(searchUrl);

      if (!searchData.status || !searchData.results || searchData.results.length === 0) {
        throw new Error("No movies found in sinhalasub site");
      }

      searchCache.set(cacheKey, searchData);
    }

    // Step 2: චිත්‍රපට ලැයිස්තුව format කිරීම
    let filmList = `Sinhalasub Movie Risalts 🎬\n\n`;
    filmList += `Input : ${q}\n\n`;
    filmList += `Reply Below Number 🔢,\nsinhalasub.lk results\n\n`;

    const films = searchData.results.slice(0, 10).map((film, index) => ({
      number: index + 1,
      title: film.title,
      imdb: film.imdb,
      year: film.year,
      link: film.link,
      image: film.image
    }));

    for (let i = 1; i <= 10; i++) {
      const film = films.find(f => f.number === i);
      filmList += `${i} || ${film ? `${film.title} (${film.year}) Sinhala Subtitles | සිංහල උපසිරැසි සමඟ` : ''}\n`;
    }

    filmList += `\n*MANJU_MD SINHALASUB SITE*`;

    // Step 3: රූපයක් නොමැතිව ලැයිස්තුව යැවීම
    const sentMessage = await conn.sendMessage(from, {
      text: filmList,
      ...frozenTheme.getForwardProps()
    }, { quoted: mek });

    // Step 4: චිත්‍රපට තේරීම බලා සිටීම (Single Event Listener)
    const filmSelectionHandler = async (update) => {
      const message = update.messages[0];
      if (!message.message || !message.message.extendedTextMessage) return;

      const userReply = message.message.extendedTextMessage.text.trim();
      if (message.message.extendedTextMessage.contextInfo.stanzaId !== sentMessage.key.id) return;

      const selectedNumber = parseInt(userReply);
      const selectedFilm = films.find(film => film.number === selectedNumber);

      if (!selectedFilm) {
        await conn.sendMessage(from, {
          text: frozenTheme.box("Mᴀɴᴊᴜ Wᴀʀɴɪɴɢ",
            "❅ Invalid selection.!\n  Select a movie number\n Dᴀʀᴋ ɴɪɢʜᴛ are amazed"),
          ...frozenTheme.getForwardProps()
        }, { quoted: message });
        return;
      }

      // Remove film selection listener
      conn.ev.off("messages.upsert", filmSelectionHandler);

      // Step 5: ඩවුන්ලෝඩ් ලින්ක් ලබා ගැනීම
      const downloadUrl = `https://apis.davidcyriltech.my.id/movies/download?url=${encodeURIComponent(selectedFilm.link)}`;
      const downloadData = await makeApiCall(downloadUrl);

      if (!downloadData.status || !downloadData.movie || !downloadData.movie.download_links) {
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

      // Step 6: ඩවුන්ලෝඩ් බටන් format කිරීම
      let downloadOptions = `SɪɴʜᴀʟᴀSᴜʙ Mᴏᴠɪᴇ Dᴏᴡɴʟᴏᴀᴅ Sɪᴛᴇ 🎥\n\n`;
      downloadOptions += `*${selectedFilm.title} (${selectedFilm.year}) Sinhala Subtitles | සිංහල උපසිරැසි සමඟ*\n\n`;
      downloadOptions += `Mᴏᴠɪᴇ Qᴜᴀʟɪᴛʏ ☕︎>\n\n`;

      downloadLinks.forEach(link => {
        downloadOptions += `${link.number}.${link.quality} (${link.size})\n`;
      });

      downloadOptions += `\nPᴏᴡᴇʀᴅ Bʏ Mᴀɴᴊᴜ_MD ✔︎`;

      const downloadMessage = await conn.sendMessage(from, {
        image: { url: downloadData.movie.thumbnail || selectedFilm.image || "https://i.ibb.co/5Yb4VZy/snowflake.jpg" },
        caption: downloadOptions,
        ...frozenTheme.getForwardProps()
      }, { quoted: message });

      // Step 7: Quality selection awaits (Single Event Listener)
      const qualitySelectionHandler = async (updateQuality) => {
        const qualityMessage = updateQuality.messages[0];
        if (!qualityMessage.message || !qualityMessage.message.extendedTextMessage) return;

        const qualityReply = qualityMessage.message.extendedTextMessage.text.trim();
        if (qualityMessage.message.extendedTextMessage.contextInfo.stanzaId !== downloadMessage.key.id) return;

        const selectedQualityNumber = parseInt(qualityReply);
        const selectedLink = downloadLinks.find(link => link.number === selectedQualityNumber);

        if (!selectedLink) {
          await conn.sendMessage(from, {
            text: frozenTheme.box("Mᴀɴᴊᴜ Wᴀʀɴɪɴɢ",
              " Invalid quality!\n Choose a quality number\n Dᴀʀᴋʀᴀʏ are amazed"),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });
          return;
        }

        // Remove quality selection listener
        conn.ev.off("messages.upsert", qualitySelectionHandler);

        // Step 8: ගොනුවේ ප්‍රමාණය පරීක්ෂා කිරීම
        const sizeStr = selectedLink.size.toLowerCase();
        let sizeInGB = 0;

        if (sizeStr.includes("gb")) {
          sizeInGB = parseFloat(sizeStr.replace("gb", "").trim());
        } else if (sizeStr.includes("mb")) {
          sizeInGB = parseFloat(sizeStr.replace("mb", "").trim()) / 1024;
        }

        if (sizeInGB > 2) {
          await conn.sendMessage(from, {
            text: frozenTheme.box("Dᴀʀᴋ Wᴀʀɴɪɴɢ",
              ` The product is too big. (${selectedLink.size})!\n  Download directly: ${selectedLink.url}\n Choose a small quality`),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });
          return;
        }

        // Step 9: චිත්‍රපටය ලේඛන_TEAM_QUEEN_යක් ලෙස එවීම
        try {
          await conn.sendMessage(from, {
            document: { url: selectedLink.url },
            mimetype: "video/mp4",
            fileName: `${selectedFilm.title} - ${selectedLink.quality}.mp4`,
            caption: frozenTheme.box("Sɪɴʜᴀʟᴀ sᴜʙ Mᴏᴠɪᴇs",
              `${frozenTheme.resultEmojis[3]} *${selectedFilm.title}*\n${frozenTheme.resultEmojis[4]} ǫᴜᴀʟʟɪᴛʏ: ${selectedLink.quality}\n${frozenTheme.resultEmojis[2]} Bɪɢ ғɪʟᴇ: ${selectedLink.size}\n\n${frozenTheme.resultEmojis[8]} Your item shines in the Mᴀɴᴊᴜ_Mᴅ.!\n${frozenTheme.resultEmojis[9]} Mᴀɴᴊᴜ_ᴍᴅ ᴘᴏᴡᴇʀᴅ ʙʏ ᴘᴀᴛʜᴜᴍ ʀᴀᴢᴀᴘᴀᴋsʜᴇ`),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });

          await conn.sendMessage(from, { react: { text: frozenTheme.resultEmojis[0], key: qualityMessage.key } });
        } catch (downloadError) {
          await conn.sendMessage(from, {
            text: frozenTheme.box("sɪɴʜᴀʟᴀsᴜʙ ᴡᴀʀɴɪɴɢ",
              ` ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ғᴀɪʟᴅ: ${downloadError.message}\n❅ ᴅɪʀᴇᴄᴛ ᴅᴏᴡɴʟᴏᴀᴅ: ${selectedLink.url}\n ᴛʀʏ ᴀɢᴀɪɴ`),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });
        }
      };

      // Register quality selection listener with timeout
      conn.ev.on("messages.upsert", qualitySelectionHandler);
      setTimeout(() => conn.ev.off("messages.upsert", qualitySelectionHandler), TIMEOUT_DURATION);
    };

    // Register film selection listener with timeout
    conn.ev.on("messages.upsert", filmSelectionHandler);
    setTimeout(() => conn.ev.off("messages.upsert", filmSelectionHandler), TIMEOUT_DURATION);

  } catch (e) {
    console.error("දෝෂය:", e);
    const errorMsg = frozenTheme.box("SɪɴʜᴀʟᴀSᴜʙ Aᴛᴛᴇɴᴛɪᴏɴ",
      `❅ දෝෂය: ${e.message || "sɪɴʜᴀʟᴀSᴜʙ destroyed the treasury"}\n❅ The sɪɴʜᴀʟᴀSᴜʙ sɪᴛᴇ is closed.\n❅ Fɪxᴇᴅ ᴢᴏᴏɴ Tʀʏ ʟᴀɪᴛᴇʀ`);

    await reply(errorMsg);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
