const { cmd } = require("../command");

const axios = require('axios');

const NodeCache = require('node-cache');

// Cache එක ආරම්භ කිරීම (විනාඩි 1 TTL)

const animeCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// ======================

// FROZEN QUEEN තේමාව

// ======================

const frozenTheme = {

  header: `╭═══❖•°❄️°•❖═══╮\n   ༺ FROZEN-QUEEN-MD ༻\n   ❅ රාජකීය අයිස් රාජධානිය ❅\n╰═══❖•°❄️°•❖═══╯\n`,

  box: function(title, content) {

    return `${this.header}╔═════❖ ❄️ ❖═════╗\n   ✧ ${title} ✧\n╚═════❖ ❄️ ❖═════╝\n\n${content}\n\n❄═════❖ ❄️ ❖═════❄\n✧ සීතල මට කිසි විටෙක බාධාවක් නොවේ ✧`;

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

// Anime සෙවුම් සහ බාගත කිරීමේ command එක

cmd({

  pattern: "anime",

  react: "❄️",

  desc: "Frozen Queen ගේ අයිස් රාජධානියේ anime භාණ්ඩ ගවේෂණය කරන්න",

  category: "ice kingdom",

  filename: __filename

}, async (conn, mek, m, { from, q, reply }) => {

  console.log("Anime command triggered with query:", q);

  if (!q) {

    console.log("No query provided, sending usage message");

    return reply(frozenTheme.box("රාජකීය නියෝගය", 

      "❅ භාවිතය: .anime <anime නම>\n❅ උදා: .anime Perfect World\n❅ භාණ්ඩ: අයිස් රාජධානියේ anime භාණ්ඩ"));

  }

  try {

    // පියවර 1: Cache එකේ anime තොරතුරු තිබේදැයි පරීක්ෂා කිරීම

    const cacheKey = `anime_search_${q.toLowerCase()}`;

    let searchData = animeCache.get(cacheKey);

    if (!searchData) {

      const searchUrl = `https://vajira-api-seven.vercel.app/movie/animexinSearch?text=${encodeURIComponent(q)}`;

      console.log("Fetching data from API:", searchUrl);

      let retries = 3;

      while (retries > 0) {

        try {

          const searchResponse = await axios.get(searchUrl, { timeout: 5000 });

          console.log("API Response:", searchResponse.data);

          searchData = searchResponse.data;

          break;

        } catch (error) {

          retries--;

          console.error(`API retry ${3 - retries} failed:`, error.message);

          if (retries === 0) throw new Error("අයිස් භාණ්ඩාගාරයෙන් anime තොරතුරු ලබා ගැනීම අසාර්ථකයි");

          await new Promise(resolve => setTimeout(resolve, 1000));

        }

      }

      // API response එක object එකක් ලෙස ලැබෙනවා, 'result' key එක තිබේදැයි check කිරීම

      if (!searchData || typeof searchData !== "object" || !searchData.result) {

        console.log("API response does not contain 'result' key:", searchData);

        throw new Error("API response එකේ 'result' key එක නොමැත");

      }

      // 'result' key එක array එකක් ලෙස ලැබෙනවාදැයි check කිරීම

      if (!Array.isArray(searchData.result)) {

        console.log("API response 'result' is not an array:", searchData.result);

        throw new Error("API response එකේ 'result' array එකක් නොවේ");

      }

      if (searchData.result.length === 0) {

        console.log("API response 'result' is an empty array:", searchData.result);

        throw new Error("අයිස් රාජධානියේ anime කිසිවක් හමු නොවීය");

      }

      // searchData.result ලෙස cache කරමු

      animeCache.set(cacheKey, searchData.result);

      console.log("Cached search data:", cacheKey);

      searchData = searchData.result; // searchData update කරමු

    }

    // පියවර 2: Anime ලැයිස්තුව format කිරීම

    let animeList = `❄️ *FROZEN ANIME VAULT* ❄️\n\n`;

    const animes = searchData.map((anime, index) => ({

      number: index + 1,

      title: anime.title || "Unknown Title",

      url: anime.url || "",

      image: anime.image || "https://i.ibb.co/5Yb4VZy/snowflake.jpg",

      status: anime.status || "Unknown",

      subtitle: anime.subtitle || "N/A",

      type: anime.type || "N/A"

    }));

    console.log("Formatted anime list:", animes);

    if (animes.length === 0) {

      throw new Error("Anime ලැයිස්තුව හිස්ය");

    }

    animes.forEach(anime => {

      animeList += `${frozenTheme.resultEmojis[0]} ${anime.number}. *${anime.title}*\n`;

      animeList += `   ${frozenTheme.resultEmojis[1]} Link: ${anime.url}\n`;

      animeList += `   ${frozenTheme.resultEmojis[2]} Status: ${anime.status}\n`;

      animeList += `   ${frozenTheme.resultEmojis[3]} Subtitle: ${anime.subtitle}\n`;

      animeList += `   ${frozenTheme.resultEmojis[4]} Type: ${anime.type}\n\n`;

    });

    animeList += `${frozenTheme.resultEmojis[8]} Anime තෝරන්න: අංකය රිප්ලයි කරන්න\n`;

    animeList += `${frozenTheme.resultEmojis[9]} FROZEN-QUEEN BY MR.Chathura`;

    const sentMessage = await conn.sendMessage(from, {

      image: { url: animes[0].image },

      caption: frozenTheme.box("Anime ගවේෂණය", animeList),

      ...frozenTheme.getForwardProps()

    }, { quoted: mek });

    console.log("Sent anime list message with ID:", sentMessage.key.id);

    // පියවර 3: Anime තේරීම බලා සිටීම

    const animeSelectionHandler = async (update) => {

      const message = update.messages[0];

      if (!message.message || !message.message.extendedTextMessage) return;

      const userReply = message.message.extendedTextMessage.text.trim();

      if (message.message.extendedTextMessage.contextInfo.stanzaId !== sentMessage.key.id) return;

      console.log("User replied with:", userReply);

      const selectedNumber = parseInt(userReply);

      const selectedAnime = animes.find(anime => anime.number === selectedNumber);

      if (!selectedAnime) {

        console.log("Invalid selection:", userReply);

        await conn.sendMessage(from, {

          text: frozenTheme.box("FROZEN අවවාදය", 

            "❅ වලංගු නොවන තේරීමකි!\n❅ Anime අංකයක් තෝරන්න\n❅ Snowgies මවිත වී ඇත"),

          ...frozenTheme.getForwardProps()

        }, { quoted: message });

        return;

      }

      // Anime තේරීමේ listener ඉවත් කිරීම

      conn.ev.off("messages.upsert", animeSelectionHandler);

      console.log("Removed anime selection handler");

      // පියවර 4: Anime විස්තර ලබා ගැනීම

      const detailUrl = `https://vajira-api-seven.vercel.app/movie/animexinDetail?url=${encodeURIComponent(selectedAnime.url)}`;

      console.log("Fetching anime details from:", detailUrl);

      let detailData;

      let detailRetries = 3;

      while (detailRetries > 0) {

        try {

          const detailResponse = await axios.get(detailUrl, { timeout: 5000 });

          console.log("Anime Details Response:", detailResponse.data);

          detailData = detailResponse.data;

          break;

        } catch (error) {

          detailRetries--;

          console.error(`Detail API retry ${3 - detailRetries} failed:`, error.message);

          if (detailRetries === 0) throw new Error("Anime විස්තර ලබා ගැනීම අසාර්ථකයි");

          await new Promise(resolve => setTimeout(resolve, 1000));

        }

      }

      if (!detailData || !detailData.status || !detailData.data) {

        console.log("No valid detail data:", detailData);

        throw new Error("අයිස් භාණ්ඩාගාරයේ anime විස්තර නැත");

      }

      // Anime බාගත කිරීමේ ලින්ක් format කිරීම

      let downloadOptions = `${frozenTheme.resultEmojis[3]} *${selectedAnime.title}*\n\n`;

      downloadOptions += `${frozenTheme.resultEmojis[4]} *බාගත කිරීමේ විකල්ප*:\n\n`;

      const downloadLinks = (detailData.data.download_links || []).map((link, index) => ({

        number: index + 1,

        quality: link.quality || "Unknown Quality",

        url: link.url || ""

      }));

      if (downloadLinks.length === 0) {

        console.log("No download links found");

        throw new Error("බාගත කිරීමේ ලින්ක් නොමැත");

      }

      downloadLinks.forEach(link => {

        downloadOptions += `${frozenTheme.resultEmojis[0]} ${link.number}. *${link.quality}*\n`;

      });

      downloadOptions += `\n${frozenTheme.resultEmojis[8]} ගුණාත්මකභාවය තෝරන්න: අංකය රිප්ලයි කරන්න\n`;

      downloadOptions += `${frozenTheme.resultEmojis[9]} FROZEN-QUEEN BY MR.Chathura`;

      const downloadMessage = await conn.sendMessage(from, {

        image: { url: detailData.data.thumbnail || selectedAnime.image },

        caption: frozenTheme.box("රාජකීය භාණ්ඩාගාරය", downloadOptions),

        ...frozenTheme.getForwardProps()

      }, { quoted: message });

      console.log("Sent download options message with ID:", downloadMessage.key.id);

      // පියවර 5: ගුණාත්මකභාවය තේරීම බලා සිටීම

      const qualitySelectionHandler = async (updateQuality) => {

        const qualityMessage = updateQuality.messages[0];

        if (!qualityMessage.message || !qualityMessage.message.extendedTextMessage) return;

        const qualityReply = qualityMessage.message.extendedTextMessage.text.trim();

        if (qualityMessage.message.extendedTextMessage.contextInfo.stanzaId !== downloadMessage.key.id) return;

        console.log("User selected quality:", qualityReply);

        const selectedQualityNumber = parseInt(qualityReply);

        const selectedLink = downloadLinks.find(link => link.number === selectedQualityNumber);

        if (!selectedLink) {

          console.log("Invalid quality selection:", qualityReply);

          await conn.sendMessage(from, {

            text: frozenTheme.box("FROZEN අවවාදය", 

              "❅ වලංගු නොවන ගුණාත්මකභාවයකි!\n❅ ගුණාත්මක අංකයක් තෝරන්න\n❅ Snowgies මවිත වී ඇත"),

            ...frozenTheme.getForwardProps()

          }, { quoted: qualityMessage });

          return;

        }

        // ගුණාත්මකභාවය තේරීමේ listener ඉවත් කිරීම

        conn.ev.off("messages.upsert", qualitySelectionHandler);

        console.log("Removed quality selection handler");

        // පියවර 6: Anime ලේඛනයක් ලෙස එවීම

        try {

          console.log("Sending anime file:", selectedLink.url);

          await conn.sendMessage(from, {

            document: { url: selectedLink.url },

            mimetype: "video/mp4",

            fileName: `${selectedAnime.title} - ${selectedLink.quality}.mp4`,

            caption: frozenTheme.box("Anime භාණ්ඩය", 

              `${frozenTheme.resultEmojis[3]} *${selectedAnime.title}*\n${frozenTheme.resultEmojis[4]} ගුණාත්මකභාවය: ${selectedLink.quality}\n\n${frozenTheme.resultEmojis[8]} ඔබේ භාණ්ඩය අයිස් රාජධානියේ බැබලේ!\n${frozenTheme.resultEmojis[9]} FROZEN-QUEEN BY MR.Chathura`),

            ...frozenTheme.getForwardProps()

          }, { quoted: qualityMessage });

          await conn.sendMessage(from, { react: { text: frozenTheme.resultEmojis[0], key: qualityMessage.key } });

          console.log("Anime file sent successfully");

        } catch (downloadError) {

          console.error("Download error:", downloadError.message);

          await conn.sendMessage(from, {

            text: frozenTheme.box("ICE අවවාදය", 

              `❅ බාගත කිරීමේ දෝෂයකි: ${downloadError.message}\n❅ සෘජුව බාගන්න: ${selectedLink.url}\n❅ නැවත උත්සාහ කරන්න`),

            ...frozenTheme.getForwardProps()

          }, { quoted: qualityMessage });

        }

      };

      // ගුණාත්මකභාවය තේරීමේ listener ලියාපදිංචි කිරීම

      conn.ev.on("messages.upsert", qualitySelectionHandler);

      console.log("Registered quality selection handler");

    };

    // Anime තේරීමේ listener ලියාපදිංචි කිරීම

    conn.ev.on("messages.upsert", animeSelectionHandler);

    console.log("Registered anime selection handler");

  } catch (e) {

    console.error("Error in anime command:", e.message, e.stack);

    const errorMsg = frozenTheme.box("ICE කුණාටුව", 

      `❅ දෝෂය: ${e.message || "Ice Harpies භාණ්ඩාගාරය විනාශ කළා"}\n❅ රාජකීය භාණ්ඩාගාරය වසා ඇත\n❅ කුණාටුව ඉවත් වූ පසු යළි උත්සාහ කරන්න`);

    

    await reply(errorMsg);

    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });

  }

});