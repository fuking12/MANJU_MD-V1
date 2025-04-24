const { cmd } = require("../command");
const axios = require('axios');
const NodeCache = require('node-cache');
const Bottleneck = require('bottleneck');

// API ඇමතුම් පෝලිමට ගැනීමට Bottleneck initializer
const limiter = new Bottleneck({
  maxConcurrent: 2, // එකවර API ඇමතුම් 2කට සීමා කරන්න
  minTime: 1000, // එක් ඇමතුමකට තත්පර 1ක අවම කාලය
});

// Cache initializer (10 විනාඩි TTL)
const searchCache = new NodeCache({ stdTTL: 600, checkperiod: 1200 });

// Frozen Queen තේමාව
const frozenTheme = {
  header: `╭═══❖•°✴️°•❖═══╮\n   𝗠𝗔𝗡𝗝𝗨_𝗠𝗗 𝗠𝗢𝗩𝗜𝗘 𝗦𝗜𝗧𝗘🎥\n   ❅ 𝗧𝗛𝗘 𝗥𝗢𝗬𝗔𝗟 𝗗𝗔𝗥𝗞 𝗞𝗜𝗡𝗗𝗢𝗠 ❅\n╰═══❖•°〽✴️°•❖═══╯\n`,
  box: function (title, content) {
    return `${this.header}╔═════❖ ✴️ ❖═════╗\n   ✧ ${title} ✧\n╚═════❖ ✴️ ❖═════╝\n\n${content}\n\n✴️═════❖ ✴️ ❖═════✴️\n✧ 𝗜,𝗔𝗠 𝗗𝗘𝗠𝗢𝗡 𝗧𝗢 𝗧𝗛𝗜𝗦 𝗪𝗛𝗢𝗟𝗘 𝗪𝗢𝗥𝗟𝗗. ✧`;
  },
  getForwardProps: function () {
    return {
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        stanzaId: "BAE5" + Math.random().toString(16).substr(2, 12).toUpperCase(),
        mentionedJid: [],
        conversionData: {
          conversionDelaySeconds: 0,
          conversionSource: "frozen_queen",
          conversionType: "message",
        },
      },
    };
  },
  resultEmojis: ["📽️", "🧊", "👑", "🎥", "🎬", "📽️", "🎞️", "❅", "✧", "✳️"],
};

// චිත්‍රපට සෙවුම් සහ බාගත command
cmd(
  {
    pattern: "film",
    react: "🎬",
    desc: "සිංහල උපසිරැසි සමඟ චිත්‍රපට ලබා ගන්න",
    category: "Dark Kindom",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, pushname, reply }) => {
    if (!q) {
      return reply(
        frozenTheme.box(
          "සිංහල උපසිරැසි චිත්‍රපට",
          "භාවිතය: .film <චිත්‍රපට නම>\n❅ උදා: .film Deadpool\n Dark: සිංහල උපසිරැසි චිත්‍රපට ලැයිස්තුව"
        )
      );
    }

    try {
      console.log(`[${new Date().toISOString()}] සෙවුම ආරම්භය: ${q}`);

      // පියවර 1: කෑෂ් එකේ චිත්‍රපට තොරතුරු බලන්න
      const cacheKey = `film_search_${q.toLowerCase()}`;
      let searchData = searchCache.get(cacheKey);

      if (!searchData) {
        const searchUrl = `https://apis.davidcyriltech.my.id/movies/search?query=${encodeURIComponent(q)}`;
        const startTime = Date.now();
        searchData = await limiter.schedule(() =>
          axios.get(searchUrl, { timeout: 3000 }).then((res) => res.data).catch((error) => {
            console.error(`[${new Date().toISOString()}] සෙවුම් API දෝෂය: ${error.message}`);
            throw new Error("චිත්‍රපට භාණ්ඩාගාරයෙන් තොරතුරු ලබා ගැනීමට අපොහොසත් විය");
          })
        );
        console.log(`[${new Date().toISOString()}] සෙවුම් API කාලය: ${(Date.now() - startTime) / 1000}s`);

        if (!searchData.status || !searchData.results || searchData.results.length === 0) {
          throw new Error("සිංහල උපසිර祥ි වෙබ් අඩවියේ චිත්‍රපට හමු නොවීය");
        }

        searchCache.set(cacheKey, searchData);
      }

      // පියවර 2: චිත්‍රපට ලැයිස්තුව format කිරීම
      let filmList = `සිංහල උපසිරැසි චිත්‍රපට ප්‍රතිඵල 🎬\n\nආදානය: ${q}\n\nපහත අංකයට පිළිතුරු දෙන්න 🔢,\nsinhalasub.lk ප්‍රතිඵල\n\n`;
      const films = searchData.results.slice(0, 5).map((film, index) => ({
        number: index + 1,
        title: film.title,
        imdb: film.imdb,
        year: film.year,
        link: film.link,
        image: film.image,
      }));

      for (const film of films) {
        filmList += `${film.number} || ${film.title} (${film.year}) සිංහල උපසිරැසි සමඟ\n`;
      }
      filmList += `\n*MANJU_MD සිංහල උපසිරැසි වෙබ් අඩවිය*`;

      // පියවර 3: චිත්‍රපට ලැයිස්තුව යවන්න
      const sentMessage = await conn.sendMessage(
        from,
        { text: filmList, ...frozenTheme.getForwardProps() },
        { quoted: mek }
      );
      console.log(`[${new Date().toISOString()}] චිත්‍රපට ලැයිස්තුව යවන ලදි`);

      // පියවර 4: චිත්‍රපට තේරීම හසුරවන්න
      const filmSelectionHandler = async (update) => {
        const message = update.messages[0];
        if (
          !message.message ||
          !message.message.extendedTextMessage ||
          message.message.extendedTextMessage.contextInfo.stanzaId !== sentMessage.key.id
        )
          return;

        const userReply = message.message.extendedTextMessage.text.trim();
        const selectedNumber = parseInt(userReply);
        const selectedFilm = films.find((film) => film.number === selectedNumber);

        if (!selectedFilm) {
          await conn.sendMessage(
            from,
            {
              text: frozenTheme.box(
                "මංජු අවවාදය",
                "❅ වලංගු නොවන තේරීමක්.!\n චිත්‍රපට අංකයක් තෝරන්න\n Dark night are amazed"
              ),
              ...frozenTheme.getForwardProps(),
            },
            { quoted: message }
          );
          return;
        }

        // ලිස්නර් ඉවත් කරන්න
        conn.ev.off("messages.upsert", filmSelectionHandler);
        console.log(`[${new Date().toISOString()}] චිත්‍රපට තේරීම: ${selectedFilm.title}`);

        // පියවර 5: බාගත ලින්ක් ලබා ගන්න
        const downloadUrl = `https://apis.davidcyriltech.my.id/movies/download?url=${encodeURIComponent(
          selectedFilm.link
        )}`;
        const startTime = Date.now();
        const downloadData = await limiter.schedule(() =>
          axios.get(downloadUrl, { timeout: 3000 }).then((res) => res.data).catch((error) => {
            console.error(`[${new Date().toISOString()}] බාගත API දෝෂය: ${error.message}`);
            throw new Error("බාගත ලින්ක් ලබා ගැනීමට අපොහොසත් විය.");
          })
        );
        console.log(`[${new Date().toISOString()}] බාගත API කාලය: ${(Date.now() - startTime) / 1000}s`);

        if (!downloadData.status || !downloadData.movie || !downloadData.movie.download_links) {
          throw new Error("සිංහල උපසිරැසි වෙබ් අඩවියේ බාගත ලින්ක් නොමැත.");
        }

        const downloadLinks = [];
        const allLinks = downloadData.movie.download_links;

        const sdLink = allLinks.find((link) => link.quality === "SD 480p" && link.direct_download);
        if (sdLink) {
          downloadLinks.push({ number: 1, quality: "SD ගුණත්වය", size: sdLink.size, url: sdLink.direct_download });
        }

        let hdLink = allLinks.find((link) => link.quality === "HD 720p" && link.direct_download);
        if (!hdLink) {
          hdLink = allLinks.find((link) => link.quality === "FHD 1080p" && link.direct_download);
        }
        if (hdLink) {
          downloadLinks.push({ number: 2, quality: "HD ගුණත්වය", size: hdLink.size, url: hdLink.direct_download });
        }

        if (downloadLinks.length === 0) {
          throw new Error("SD හෝ HD ගුණාත්මක ලින්ක් නොමැත");
        }

        // පියවර 6: බාගත විකල්ප format කිරීම
        let downloadOptions = `සිංහල උපසිරැසි චිත්‍රපට බාගත වෙබ් අඩවිය 🎥\n\n*${selectedFilm.title} (${selectedFilm.year}) සිංහල උපසිරැසි සමඟ*\n\nචිත්‍රපට ගුණත්වය ☕︎>\n\n`;
        downloadLinks.forEach((link) => {
          downloadOptions += `${link.number}.${link.quality} (${link.size})\n`;
        });
        downloadOptions += `\nමංජු_MD මගින් බලගන්වන ලදී ✔︎`;

        const downloadMessage = await conn.sendMessage(
          from,
          {
            image: {
              url: downloadData.movie.thumbnail || selectedFilm.image || "https://i.ibb.co/5Yb4VZy/snowflake.jpg",
            },
            caption: downloadOptions,
            ...frozenTheme.getForwardProps(),
          },
          { quoted: message }
        );
        console.log(`[${new Date().toISOString()}] බාගත විකල්ප යවන ලදි`);

        // පියවර 7: ගුණත්ව තේරීම හසුරවන්න
        const qualitySelectionHandler = async (updateQuality) => {
          const qualityMessage = updateQuality.messages[0];
          if (
            !qualityMessage.message ||
            !qualityMessage.message.extendedTextMessage ||
            qualityMessage.message.extendedTextMessage.contextInfo.stanzaId !== downloadMessage.key.id
          )
            return;

          const qualityReply = qualityMessage.message.extendedTextMessage.text.trim();
          const selectedQualityNumber = parseInt(qualityReply);
          const selectedLink = downloadLinks.find((link) => link.number === selectedQualityNumber);

          if (!selectedLink) {
            await conn.sendMessage(
              from,
              {
                text: frozenTheme.box(
                  "මංජු අවවාදය",
                  "වලංගු නොවන ගුණත්වය!\n ගුණත්ව අංකයක් තෝරන්න\n Darkray are amazed"
                ),
                ...frozenTheme.getForwardProps(),
              },
              { quoted: qualityMessage }
            );
            return;
          }

          // ලිස්නර් ඉවත් කරන්න
          conn.ev.off("messages.upsert", qualitySelectionHandler);
          console.log(`[${new Date().toISOString()}] ගුණත්ව තේරීම: ${selectedLink.quality}`);

          // පියවර 8: ගොනු ප්‍රමාණය පරීක්ෂා කිරීම
          const sizeStr = selectedLink.size.toLowerCase();
          let sizeInGB = 0;
          if (sizeStr.includes("gb")) {
            sizeInGB = parseFloat(sizeStr.replace("gb", "").trim());
          } else if (sizeStr.includes("mb")) {
            sizeInGB = parseFloat(sizeStr.replace("mb", "").trim()) / 1024;
          }

          // පියවර 9: බාගත ලින්ක් ලබා දීම (ලේඛන යැවීම වෙනුවට)
          await conn.sendMessage(
            from,
            {
              text: frozenTheme.box(
                "සිංහල උපසිරැසි චිත්‍රපට",
                `${frozenTheme.resultEmojis[3]} *${selectedFilm.title}*\n${frozenTheme.resultEmojis[4]} ගුණත්වය: ${selectedLink.quality}\n${frozenTheme.resultEmojis[2]} ගොනු ප්‍රමාණය: ${selectedLink.size}\n${frozenTheme.resultEmojis[5]} බාගත ලින්ක්: ${selectedLink.url}\n\n${frozenTheme.resultEmojis[8]} ඔබේ භාණ්ඩය මංජු_MD හි බැබලේ.!\n${frozenTheme.resultEmojis[9]} මංජු_md පාතුම් රාජපක්ෂ විසින් බලගන්වන ලදී`
              ),
              ...frozenTheme.getForwardProps(),
            },
            { quoted: qualityMessage }
          );
          await conn.sendMessage(from, { react: { text: frozenTheme.resultEmojis[0], key: qualityMessage.key } });
          console.log(`[${new Date().toISOString()}] බාගත ලින්ක් යවන ලදි`);
        };

        // ගුණත්ව තේරීම ලිස්නර් ලියාපදිංචි කිරීම
        conn.ev.on("messages.upsert", qualitySelectionHandler);
        setTimeout(() => {
          conn.ev.off("messages.upsert", qualitySelectionHandler);
          console.log(`[${new Date().toISOString()}] ගුණත්ව ලිස්නර් කාලය ඉකුත් විය`);
        }, 30000); // 30 තත්පර කාල සීමාව
      };

      // චිත්‍රපට තේරීම ලිස්නර් ලියාපදිංචි කිරීම
      conn.ev.on("messages.upsert", filmSelectionHandler);
      setTimeout(() => {
        conn.ev.off("messages.upsert", filmSelectionHandler);
        console.log(`[${new Date().toISOString()}] චිත්‍රපට ලිස්නර් කාලය ඉකුත් විය`);
      }, 30000); // 30 තත්පර කාල සීමාව
    } catch (e) {
      console.error(`[${new Date().toISOString()}] දෝෂය: ${e.message}`);
      const errorMsg = frozenTheme.box(
        "සිංහල උපසිරැසි අවධානය",
        `❅ දෝෂය: ${e.message || "සිංහල උපසිරැසි භාණ්ඩාගාරය විනාශ වී ඇත"}\n❅ සිංහල උපසිරැසි වෙබ් අඩවිය වසා ඇත.\n❅ ඉක්මනින් සකස් කර නැවත උත්සාහ කරන්න`
      );
      await reply(errorMsg);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
  }
);
