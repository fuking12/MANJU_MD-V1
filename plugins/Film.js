const { cmd } = require("../command");
const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache with 5-minute TTL for better hit rate
const searchCache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

// Frozen Queen Theme
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

// Film search and download command
cmd(
  {
    pattern: "film",
    react: "🎬",
    desc: "Get Movies from Manju_MD's treasury to enjoy cinema",
    category: "Dark Kindom",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, pushname, reply }) => {
    if (!q) {
      return reply(
        frozenTheme.box(
          "Sinhala Sub Movie",
          "Use: .film <film name>\n❅ Ex: .film Deadpool\n Dark: SinhalaSub Movie List"
        )
      );
    }

    try {
      // Step 1: Check cache for movie data
      const cacheKey = `film_search_${q.toLowerCase()}`;
      let searchData = searchCache.get(cacheKey);

      if (!searchData) {
        const searchUrl = `https://apis.davidcyriltech.my.id/movies/search?query=${encodeURIComponent(q)}`;
        const searchResponse = await axios.get(searchUrl, { timeout: 5000 }).catch(async (error) => {
          console.error("Search API error:", error.message);
          throw new Error("Failed to obtain information from the Film Treasury");
        });
        searchData = searchResponse.data;

        if (!searchData.status || !searchData.results || searchData.results.length === 0) {
          throw new Error("No movies found in sinhalasub site");
        }

        searchCache.set(cacheKey, searchData);
      }

      // Step 2: Format movie list
      let filmList = `Sinhalasub Movie Results 🎬\n\nInput: ${q}\n\nReply Below Number 🔢,\nsinhalasub.lk results\n\n`;
      const films = searchData.results.slice(0, 10).map((film, index) => ({
        number: index + 1,
        title: film.title,
        imdb: film.imdb,
        year: film.year,
        link: film.link,
        image: film.image,
      }));

      for (let i = 1; i <= 10; i++) {
        const film = films.find((f) => f.number === i);
        filmList += `${i} || ${film ? `${film.title} (${film.year}) Sinhala Subtitles | සිංහල උපසිරැසි සමඟ` : ""}\n`;
      }
      filmList += `\n*MANJU_MD SINHALASUB SITE*`;

      // Step 3: Send movie list
      const sentMessage = await conn.sendMessage(
        from,
        { text: filmList, ...frozenTheme.getForwardProps() },
        { quoted: mek }
      );

      // Step 4: Handle film selection with timeout
      const filmSelectionHandler = async (update) => {
        const message = update.messages[0];
        if (!message.message || !message.message.extendedTextMessage) return;

        const userReply = message.message.extendedTextMessage.text.trim();
        if (message.message.extendedTextMessage.contextInfo.stanzaId !== sentMessage.key.id) return;

        const selectedNumber = parseInt(userReply);
        const selectedFilm = films.find((film) => film.number === selectedNumber);

        if (!selectedFilm) {
          await conn.sendMessage(
            from,
            {
              text: frozenTheme.box(
                "Manju Warning",
                "❅ Invalid selection.!\n Select a movie number\n Dark night are amazed"
              ),
              ...frozenTheme.getForwardProps(),
            },
            { quoted: message }
          );
          return;
        }

        // Remove listener immediately
        conn.ev.off("messages.upsert", filmSelectionHandler);

        // Step 5: Fetch download links
        const downloadUrl = `https://apis.davidcyriltech.my.id/movies/download?url=${encodeURIComponent(selectedFilm.link)}`;
        const downloadResponse = await axios.get(downloadUrl, { timeout: 5000 }).catch(async (error) => {
          console.error("Download API error:", error.message);
          throw new Error("Failed to get download link.");
        });
        const downloadData = downloadResponse.data;

        if (!downloadData.status || !downloadData.movie || !downloadData.movie.download_links) {
          throw new Error("There is no download link for sinhalasub site.");
        }

        const downloadLinks = [];
        const allLinks = downloadData.movie.download_links;

        const sdLink = allLinks.find((link) => link.quality === "SD 480p" && link.direct_download);
        if (sdLink) {
          downloadLinks.push({ number: 1, quality: "SD QUALITY", size: sdLink.size, url: sdLink.direct_download });
        }

        let hdLink = allLinks.find((link) => link.quality === "HD 720p" && link.direct_download);
        if (!hdLink) {
          hdLink = allLinks.find((link) => link.quality === "FHD 1080p" && link.direct_download);
        }
        if (hdLink) {
          downloadLinks.push({ number: 2, quality: "HD QUALITY", size: hdLink.size, url: hdLink.direct_download });
        }

        if (downloadLinks.length === 0) {
          throw new Error("No SD or HD quality links available");
        }

        // Step 6: Format download options
        let downloadOptions = `SinhalaSub Movie Download Site 🎥\n\n*${selectedFilm.title} (${selectedFilm.year}) Sinhala Subtitles | සිංහල උපසිරැසි සමඟ*\n\nMovie Quality ☕︎>\n\n`;
        downloadLinks.forEach((link) => {
          downloadOptions += `${link.number}.${link.quality} (${link.size})\n`;
        });
        downloadOptions += `\nPowered By Manju_MD ✔︎`;

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

        // Step 7: Handle quality selection with timeout
        const qualitySelectionHandler = async (updateQuality) => {
          const qualityMessage = updateQuality.messages[0];
          if (!qualityMessage.message || !qualityMessage.message.extendedTextMessage) return;

          const qualityReply = qualityMessage.message.extendedTextMessage.text.trim();
          if (qualityMessage.message.extendedTextMessage.contextInfo.stanzaId !== downloadMessage.key.id) return;

          const selectedQualityNumber = parseInt(qualityReply);
          const selectedLink = downloadLinks.find((link) => link.number === selectedQualityNumber);

          if (!selectedLink) {
            await conn.sendMessage(
              from,
              {
                text: frozenTheme.box(
                  "Manju Warning",
                  "Invalid quality!\n Choose a quality number\n Darkray are amazed"
                ),
                ...frozenTheme.getForwardProps(),
              },
              { quoted: qualityMessage }
            );
            return;
          }

          // Remove listener immediately
          conn.ev.off("messages.upsert", qualitySelectionHandler);

          // Step 8: Check file size
          const sizeStr = selectedLink.size.toLowerCase();
          let sizeInGB = 0;
          if (sizeStr.includes("gb")) {
            sizeInGB = parseFloat(sizeStr.replace("gb", "").trim());
          } else if (sizeStr.includes("mb")) {
            sizeInGB = parseFloat(sizeStr.replace("mb", "").trim()) / 1024;
          }

          if (sizeInGB > 2) {
            await conn.sendMessage(
              from,
              {
                text: frozenTheme.box(
                  "Dark Warning",
                  `The product is too big. (${selectedLink.size})!\n Download directly: ${selectedLink.url}\n Choose a small quality`
                ),
                ...frozenTheme.getForwardProps(),
              },
              { quoted: qualityMessage }
            );
            return;
          }

          // Step 9: Send movie as document
          try {
            await conn.sendMessage(
              from,
              {
                document: { url: selectedLink.url },
                mimetype: "video/mp4",
                fileName: `${selectedFilm.title} - ${selectedLink.quality}.mp4`,
                caption: frozenTheme.box(
                  "Sinhala sub Movies",
                  `${frozenTheme.resultEmojis[3]} *${selectedFilm.title}*\n${frozenTheme.resultEmojis[4]} Quality: ${selectedLink.quality}\n${frozenTheme.resultEmojis[2]} Big file: ${selectedLink.size}\n\n${frozenTheme.resultEmojis[8]} Your item shines in the Manju_MD.!\n${frozenTheme.resultEmojis[9]} Manju_md powerd by pathum rajapakshe`
                ),
                ...frozenTheme.getForwardProps(),
              },
              { quoted: qualityMessage }
            );
            await conn.sendMessage(from, { react: { text: frozenTheme.resultEmojis[0], key: qualityMessage.key } });
          } catch (downloadError) {
            await conn.sendMessage(
              from,
              {
                text: frozenTheme.box(
                  "sinhalasub warning",
                  `Downloading failed: ${downloadError.message}\n❅ Direct download: ${selectedLink.url}\n Try again`
                ),
                ...frozenTheme.getForwardProps(),
              },
              { quoted: qualityMessage }
            );
          }
        };

        // Register quality selection listener with timeout
        conn.ev.on("messages.upsert", qualitySelectionHandler);
        setTimeout(() => {
          conn.ev.off("messages.upsert", qualitySelectionHandler);
        }, 60000); // 1-minute timeout
      };

      // Register film selection listener with timeout
      conn.ev.on("messages.upsert", filmSelectionHandler);
      setTimeout(() => {
        conn.ev.off("messages.upsert", filmSelectionHandler);
      }, 60000); // 1-minute timeout
    } catch (e) {
      console.error("Error:", e);
      const errorMsg = frozenTheme.box(
        "SinhalaSub Attention",
        `❅ Error: ${e.message || "SinhalaSub destroyed the treasury"}\n❅ The SinhalaSub site is closed.\n❅ Fixed soon Try later`
      );
      await reply(errorMsg);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
  }
);
