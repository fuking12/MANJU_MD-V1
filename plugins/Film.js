const { cmd } = require("../command");
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache එක initialize කිරීම (30 තත්පර TTL, max 100 keys)
const searchCache = new NodeCache({ stdTTL: 30, checkperiod: 60, maxKeys: 100 });
const downloadCache = new NodeCache({ stdTTL: 30, checkperiod: 60, maxKeys: 50 });

// Constants
const TIMEOUT_DURATION = 60000; // 60 seconds timeout for listeners
const API_TIMEOUT = 3000; // 3 seconds timeout for API calls
const MAX_RETRIES = 2; // Reduced retries to minimize delay
const RETRY_DELAY = 500; // Reduced retry delay to 500ms
const MAX_FILE_SIZE_GB = 2; // Maximum file size in GB

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
      console.log(`API Response for ${url}:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error(`API Error for ${url}:`, error.message);
      retries--;
      if (retries === 0) throw new Error(`Failed to fetch data: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

// Utility function to stream file to WhatsApp with progress updates
const streamFileToWhatsApp = async (conn, from, stream, fileName, caption, quoted) => {
  try {
    // Progress message: Movie uploading
    await conn.sendMessage(from, {
      text: frozenTheme.box("Sɪɴʜᴀʟᴀ Sᴜʙ Mᴏᴠɪᴇ",
        `Movie uploading... Please wait.`),
      ...frozenTheme.getForwardProps()
    }, { quoted });

    await conn.sendMessage(from, {
      document: stream,
      mimetype: "video/mp4",
      fileName: fileName,
      caption: caption,
      ...frozenTheme.getForwardProps()
    }, { quoted });

    return true;
  } catch (error) {
    throw new Error(`Failed to stream file: ${error.message}`);
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

      if (!searchData) {
        throw new Error("No response from the API");
      }

      if (!searchData.status || !searchData.results || searchData.results.length === 0) {
        throw new Error("No movies found in sinhalasub site");
      }

      searchCache.set(cacheKey, searchData);
      console.log(`Cache set for key ${cacheKey}:`, searchData);
    } else {
      console.log(`Cache hit for key ${cacheKey}:`, searchData);
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

    console.log("Film list sent with message ID:", sentMessage.key.id);

    // Step 4: චිත්‍රපට තේරීම බලා සිටීම (Single Event Listener)
    const filmSelectionHandler = async (update) => {
      const message = update.messages[0];
      if (!message.message || !message.message.extendedTextMessage) return;

      const userReply = message.message.extendedTextMessage.text.trim();
      const stanzaId = message.message.extendedTextMessage.contextInfo.stanzaId;
      console.log(`Received reply: ${userReply}, stanzaId: ${stanzaId}, expected: ${sentMessage.key.id}`);

      if (stanzaId !== sentMessage.key.id) return;

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
      console.log("Film selection listener removed");

      // Step 5: ඩවුන්ලෝඩ් ලින්ක් ලබා ගැනීම
      const downloadCacheKey = `download_${selectedFilm.link}`;
      let downloadData = downloadCache.get(downloadCacheKey);

      if (!downloadData) {
        const downloadUrl = `https://apis.davidcyriltech.my.id/movies/download?url=${encodeURIComponent(selectedFilm.link)}`;
        downloadData = await makeApiCall(downloadUrl);

        if (!downloadData) {
          throw new Error("No response from the download API");
        }

        if (!downloadData.status || !downloadData.movie || !downloadData.movie.download_links) {
          throw new Error("There is no download link for sinhalasub site.");
        }

        downloadCache.set(downloadCacheKey, downloadData);
        console.log(`Download cache set for key ${downloadCacheKey}`);
      } else {
        console.log(`Download cache hit for key ${downloadCacheKey}`);
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

      console.log("Download options sent with message ID:", downloadMessage.key.id);

      // Step 7: Quality selection awaits (Single Event Listener)
      const qualitySelectionHandler = async (updateQuality) => {
        const qualityMessage = updateQuality.messages[0];
        if (!qualityMessage.message || !qualityMessage.message.extendedTextMessage) return;

        const qualityReply = qualityMessage.message.extendedTextMessage.text.trim();
        const qualityStanzaId = qualityMessage.message.extendedTextMessage.contextInfo.stanzaId;
        console.log(`Received quality reply: ${qualityReply}, stanzaId: ${qualityStanzaId}, expected: ${downloadMessage.key.id}`);

        if (qualityStanzaId !== downloadMessage.key.id) return;

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
        console.log("Quality selection listener removed");

        // Step 8: ගොනුවේ ප්‍රමාණය පරීක්ෂා කිරීම
        try {
          const sizeStr = selectedLink.size.toLowerCase();
          let sizeInGB = 0;

          if (sizeStr.includes("gb")) {
            sizeInGB = parseFloat(sizeStr.replace("gb", "").trim());
          } else if (sizeStr.includes("mb")) {
            sizeInGB = parseFloat(sizeStr.replace("mb", "").trim()) / 1024;
          }

          console.log(`File size: ${sizeInGB} GB`);

          if (sizeInGB > MAX_FILE_SIZE_GB) {
            await conn.sendMessage(from, {
              text: frozenTheme.box("Dᴀʀᴋ Wᴀʀɴɪɴɢ",
                ` The product is too big. (${selectedLink.size})!\n  Download directly: ${selectedLink.url}\n Choose a small quality`),
              ...frozenTheme.getForwardProps()
            }, { quoted: qualityMessage });
            return;
          }
        } catch (error) {
          console.error("Error during file size check:", error);
          await conn.sendMessage(from, {
            text: frozenTheme.box("SɪɴʜᴀʟᴀSᴜʙ Aᴛᴛᴇɴᴛɪᴏɴ",
              `❅ Error during file size check: ${error.message}\n❅ Please try again.`),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });
          return;
        }

        // Step 9: Download එක ආරම්භ කිරීම
        let downloadStream;
        try {
          const response = await axios({
            url: selectedLink.url,
            method: 'GET',
            responseType: 'stream',
            timeout: 30000 // 30 seconds timeout for download
          });
          downloadStream = response.data;

          console.log("Download stream created successfully");

          // Progress message: Download successfully
          await conn.sendMessage(from, {
            text: frozenTheme.box("Sɪɴʜᴀʟᴀ Sᴜʙ Mᴏᴠɪᴇ",
              `Download successfully`),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });

        } catch (error) {
          console.error("Error during download:", error);
          await conn.sendMessage(from, {
            text: frozenTheme.box("sɪɴʜᴀʟᴀsᴜʙ ᴡᴀʀɴɪɴɢ",
              ` ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ғᴀɪʟᴅ: ${error.message}\n❅ ᴅɪʀᴇᴄᴛ ᴅᴏᴡɴʟᴏᴀᴅ: ${selectedLink.url}\n ᴛʀʏ ᴀɢᴀɪɴ`),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });
          return;
        }

        // Step 10: චිත්‍රපටය stream කරලා එවන්න with "Movie uploading" message
        try {
          const startTime = Date.now();
          await streamFileToWhatsApp(
            conn,
            from,
            downloadStream,
            `${selectedFilm.title} - ${selectedLink.quality}.mp4`,
            frozenTheme.box("Sɪɴʜᴀʟᴀ sᴜʙ Mᴏᴠɪᴇs",
              `${frozenTheme.resultEmojis[3]} *${selectedFilm.title}*\n${frozenTheme.resultEmojis[4]} ǫᴜᴀʟʟɪᴛʏ: ${selectedLink.quality}\n${frozenTheme.resultEmojis[2]} Bɪɢ ғɪʟᴇ: ${selectedLink.size}\n\n${frozenTheme.resultEmojis[8]} Your item shines in the Mᴀɴᴊᴜ_Mᴅ.!\n${frozenTheme.resultEmojis[9]} Mᴀɴᴊᴜ_ᴍᴅ ᴘᴏᴡᴇʀᴅ ʙʏ ᴘᴀᴛʜᴜᴍ ʀᴀᴢᴀᴘᴀᴋsʜᴇ`),
            qualityMessage
          );

          const endTime = Date.now();
          const uploadTime = (endTime - startTime) / 1000; // seconds
          console.log(`Upload completed in ${uploadTime} seconds`);

          await conn.sendMessage(from, { react: { text: frozenTheme.resultEmojis[0], key: qualityMessage.key } });
        } catch (uploadError) {
          console.error("Error during upload:", uploadError);
          await conn.sendMessage(from, {
            text: frozenTheme.box("sɪɴʜᴀʟᴀsᴜʙ ᴡᴀʀɴɪɴɢ",
              ` ᴜᴘʟᴏᴀᴅɪɴɢ ғᴀɪʟᴅ: ${uploadError.message}\n❅ ᴅɪʀᴇᴄᴛ ᴅᴏᴡɴʟᴏᴀᴅ: ${selectedLink.url}\n ᴛʀʏ ᴀɢᴀɪɴ`),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });
        }
      };

      // Register quality selection listener with timeout
      conn.ev.on("messages.upsert", qualitySelectionHandler);
      setTimeout(() => {
        conn.ev.off("messages.upsert", qualitySelectionHandler);
        console.log("Quality selection listener timed out and removed");
      }, TIMEOUT_DURATION);
    };

    // Register film selection listener with timeout
    conn.ev.on("messages.upsert", filmSelectionHandler);
    setTimeout(() => {
      conn.ev.off("messages.upsert", filmSelectionHandler);
      console.log("Film selection listener timed out and removed");
    }, TIMEOUT_DURATION);

  } catch (e) {
    console.error("දෝෂය:", e);
    const errorMsg = frozenTheme.box("SɪɴʜᴀʟᴀSᴜʙ Aᴛᴛᴇɴᴛɪᴏɴ",
      `❅ දෝෂය: ${e.message || "sɪɴʜᴀʟᴀSᴜʙ destroyed the treasury"}\n❅ The sɪɴʜᴀʟᴀSᴜʙ sɪᴛᴇ is closed.\n❅ Fɪxᴇᴅ ᴢᴏᴏɴ Tʀʏ ʟᴀɪᴛᴇʀ`);

    await reply(errorMsg);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
