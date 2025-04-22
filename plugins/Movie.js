const { cmd } = require("../command");
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache එක initialize කිරීම (1 විනාඩියක TTL)
const searchCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// ======================
// FROZEN QUEEN තේමාව
// ======================
const frozenTheme = {
  header: `╭═══❖•°❄️°•❖═══╮\n   ༺ FROZEN-QUEEN-MD ༻\n   ❅ THE ROYAL ICE KINGDOM ❅\n╰═══❖•°❄️°•❖═══╯\n`,
  box: function(title, content) {
    return `${this.header}╔═════❖ ❄️ ❖═════╗\n   ✧ ${title} ✧\n╚═════❖ ❄️ ❖═════╝\n\n${content}\n\n❄═════❖ ❄️ ❖═════❄\n✧ THE COLD NEVER BOTHERED ME ANYWAY ✧`;
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
  resultEmojis: ["❄️", "🧊", "👑", "🎥", "🎬", "📽️", "🎞️", "❅", "✧", "🌬️"]
};

// Film සෙවුම් සහ ඩවුන්ලෝඩ් command එක
cmd({
  pattern: "film", // Pattern එක "film" ලෙස වෙනස් කර ඇත
  react: "❄️",
  desc: "සිනමා රස විඳීමට Frozen Queen ගේ භාණ්ඩාගාරයෙන් චිත්‍රපට ලබා ගන්න",
  category: "ice kingdom",
  filename: __filename,
}, async (conn, mek, m, { from, q, pushname, reply }) => {
  // චිත්‍රපටයේ නමක් ලබාදී තිබේදැයි පරීක්ෂා කිරීම
  if (!q) {
    return reply(frozenTheme.box("රාජකීය නියෝගය", 
      "❅ භාවිතය: .film <චිත්‍රපට නම>\n❅ උදා: .film Deadpool\n❅ බැඳුම්: Ice Vaults හි චිත්‍රපට භාණ්ඩ"));
  }

  try {
    // Step 1: Cache එකේ චිත්‍රපට තොරතුරු තිබේදැයි පරීක්ෂා කිරීම
    const cacheKey = `film_search_${q.toLowerCase()}`;
    let searchData = searchCache.get(cacheKey);

    if (!searchData) {
      // Cache එකේ නැත්නම් API එකෙන් තොරතුරු ලබා ගැනීම
      const searchUrl = `https://apis.davidcyriltech.my.id/movies/search?query=${encodeURIComponent(q)}`;
      let retries = 3; // උත්සාහ 3ක් කරනවා
      while (retries > 0) {
        try {
          const searchResponse = await axios.get(searchUrl, { timeout: 5000 });
          searchData = searchResponse.data;
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw new Error("චිත්‍රපට භාණ්ඩාගාරයෙන් තොරතුරු ලබා ගැනීම අසාර්ථකයි");
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1s බලා යළි උත්සාහ කරනවා
        }
      }

      if (!searchData.status || !searchData.results || searchData.results.length === 0) {
        throw new Error("Ice Kingdom හි චිත්‍රපට කිසිවක් හමු නොවීය");
      }

      // තොරතුරු cache එකට එකතු කිරීම
      searchCache.set(cacheKey, searchData);
    }

    // Step 2: චිත්‍රපට ලැයිස්තුව format කිරීම
    let filmList = `❄️ *FROZEN CINEMATIC VAULT* ❄️\n\n`;
    const films = searchData.results.map((film, index) => ({
      number: index + 1,
      title: film.title,
      imdb: film.imdb,
      year: film.year,
      link: film.link,
      image: film.image
    }));

    films.forEach(film => {
      filmList += `${frozenTheme.resultEmojis[0]} ${film.number}. *${film.title}*\n`;
      filmList += `   ${frozenTheme.resultEmojis[2]} IMDB: ${film.imdb}\n`;
      filmList += `   ${frozenTheme.resultEmojis[1]} Year: ${film.year}\n\n`;
    });
    filmList += `${frozenTheme.resultEmojis[8]} චිත්‍රපටය තෝරන්න: අංකය රිප්ලයි කරන්න\n`;
    filmList += `${frozenTheme.resultEmojis[9]} FROZEN-QUEEN BY MR.Chathura`;

    // චිත්‍රපට ලැයිස්තුව එවීම (පළමු චිත්‍රපටයේ thumbnail සමඟ)
    const sentMessage = await conn.sendMessage(from, {
      image: { url: films[0].image },
      caption: frozenTheme.box("සිනමා ගවේෂණය", filmList),
      ...frozenTheme.getForwardProps()
    }, { quoted: mek });

    // Step 3: චිත්‍රපට තේරීම බලා සිටීම
    conn.ev.on("messages.upsert", async (update) => {
      const message = update.messages[0];
      if (!message.message || !message.message.extendedTextMessage) return;

      const userReply = message.message.extendedTextMessage.text.trim();
      if (message.message.extendedTextMessage.contextInfo.stanzaId !== sentMessage.key.id) return;

      const selectedNumber = parseInt(userReply);
      const selectedFilm = films.find(film => film.number === selectedNumber);

      if (!selectedFilm) {
        await conn.sendMessage(from, {
          text: frozenTheme.box("FROZEN අවවාදය", 
            "❅ වලංගු නොවන තේරීමකි!\n❅ චිත්‍රපට අංකයක් තෝරන්න\n❅ Snowgies මවිත වී ඇත"),
          ...frozenTheme.getForwardProps()
        }, { quoted: message });
        return;
      }

      // Step 4: ඩවුන්ලෝඩ් ලින්ක් ලබා ගැනීම
      const downloadUrl = `https://apis.davidcyriltech.my.id/movies/download?url=${encodeURIComponent(selectedFilm.link)}`;
      let downloadData;
      let downloadRetries = 3;

      while (downloadRetries > 0) {
        try {
          const downloadResponse = await axios.get(downloadUrl, { timeout: 5000 });
          downloadData = downloadResponse.data;
          break;
        } catch (error) {
          downloadRetries--;
          if (downloadRetries === 0) throw new Error("ඩවුන්ලෝඩ් ලින්ක් ලබා ගැනීම අසාර්ථකයි");
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!downloadData.status || !downloadData.movie || !downloadData.movie.download_links) {
        throw new Error("Ice Vaults හි ඩවුන්ලෝඩ් ලින්ක් නැත");
      }

      // SD (480p) සහ HD (720p හෝ 1080p) ලින්ක් filter කිරීම
      const downloadLinks = [];
      const allLinks = downloadData.movie.download_links;

      // SD (480p) ලින්ක් validate කිරීම
      const sdLink = allLinks.find(link => link.quality === "SD 480p" && link.direct_download);
      if (sdLink) {
        downloadLinks.push({
          number: 1,
          quality: "SD Quality",
          size: sdLink.size,
          url: sdLink.direct_download
        });
      }

      // HD (720p හෝ 1080p) ලින්ක් validate කිරීම
      let hdLink = allLinks.find(link => link.quality === "HD 720p" && link.direct_download);
      if (!hdLink) {
        hdLink = allLinks.find(link => link.quality === "FHD 1080p" && link.direct_download);
      }
      if (hdLink) {
        downloadLinks.push({
          number: 2,
          quality: "HD Quality",
          size: hdLink.size,
          url: hdLink.direct_download
        });
      }

      if (downloadLinks.length === 0) {
        throw new Error("SD හෝ HD ගුණාත්මක ලින්ක් නොමැත");
      }

      // ඩවුන්ලෝඩ් විකල්ප format කිරීම
      let downloadOptions = `${frozenTheme.resultEmojis[3]} *${selectedFilm.title}*\n\n`;
      downloadOptions += `${frozenTheme.resultEmojis[4]} *ගුණාත්මකභාවය තෝරන්න*:\n\n`;
      downloadLinks.forEach(link => {
        downloadOptions += `${frozenTheme.resultEmojis[0]} ${link.number}. *${link.quality}* (${link.size})\n`;
      });
      downloadOptions += `\n${frozenTheme.resultEmojis[8]} ගුණාත්මකභාවය තෝරන්න: අංකය රිප්ලයි කරන්න\n`;
      downloadOptions += `${frozenTheme.resultEmojis[9]} FROZEN-QUEEN BY MR.Chathura`;

      // ඩවුන්ලෝඩ් විකල්ප එවීම
      const downloadMessage = await conn.sendMessage(from, {
        image: { url: downloadData.movie.thumbnail || selectedFilm.image || "https://i.ibb.co/5Yb4VZy/snowflake.jpg" },
        caption: frozenTheme.box("රාජකීය භාණ්ඩාගාරය", downloadOptions),
        ...frozenTheme.getForwardProps()
      }, { quoted: message });

      // Step 5: ගුණාත්මකභාවය තේරීම බලා සිටීම
      conn.ev.on("messages.upsert", async (updateQuality) => {
        const qualityMessage = updateQuality.messages[0];
        if (!qualityMessage.message || !qualityMessage.message.extendedTextMessage) return;

        const qualityReply = qualityMessage.message.extendedTextMessage.text.trim();
        if (qualityMessage.message.extendedTextMessage.contextInfo.stanzaId !== downloadMessage.key.id) return;

        const selectedQualityNumber = parseInt(qualityReply);
        const selectedLink = downloadLinks.find(link => link.number === selectedQualityNumber);

        if (!selectedLink) {
          await conn.sendMessage(from, {
            text: frozenTheme.box("FROZEN අවවාදය", 
              "❅ වලංගු නොවන ගුණාත්මකභාවයකි!\n❅ ගුණාත්මක අංකයක් තෝරන්න\n❅ Snowgies මවිත වී ඇත"),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });
          return;
        }

        // Step 6: ගොනුවේ ප්‍රමාණය පරීක්ෂා කිරීම
        const sizeInGB = parseFloat(selectedLink.size);
        if (sizeInGB > 2) {
          await conn.sendMessage(from, {
            text: frozenTheme.box("ICE අවවාදය", 
              `❅ භාණ්ඩය ඉතා විශාලයි (${selectedLink.size})!\n❅ සෘජුව බාගන්න: ${selectedLink.url}\n❅ කුඩා ගුණාත්මකභාවයක් තෝරන්න`),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });
          return;
        }

        // Step 7: චිත්‍රපටය ලේඛනයක් ලෙස එවීම
        await conn.sendMessage(from, {
          document: { url: selectedLink.url },
          mimetype: "video/mp4",
          fileName: `${selectedFilm.title} - ${selectedLink.quality}.mp4`,
          caption: frozenTheme.box("සිනමා භාණ්ඩය", 
            `${frozenTheme.resultEmojis[3]} *${selectedFilm.title}*\n${frozenTheme.resultEmojis[4]} ගුණාත්මකභාවය: ${selectedLink.quality}\n${frozenTheme.resultEmojis[2]} ප්‍රමාණය: ${selectedLink.size}\n\n${frozenTheme.resultEmojis[8]} ඔබේ භාණ්ඩය Ice Kingdom හි බැබලේ!\n${frozenTheme.resultEmojis[9]} FROZEN-QUEEN BY MR.Chathura`),
          ...frozenTheme.getForwardProps()
        }, { quoted: qualityMessage });

        await conn.sendMessage(from, { react: { text: frozenTheme.resultEmojis[0], key: qualityMessage.key } });
      });
    });

  } catch (e) {
    console.error("දෝෂය:", e);
    const errorMsg = frozenTheme.box("ICE කුණාටුව", 
      `❅ දෝෂය: ${e.message || "Ice Harpies භාණ්ඩාගාරය විනාශ කළා"}\n❅ රාජකීය භාණ්ඩාගාරය වසා ඇත\n❅ කුණාටුව ඉවත් වූ පසු යළි උත්සාහ කරන්න`);
    
    await reply(errorMsg);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
