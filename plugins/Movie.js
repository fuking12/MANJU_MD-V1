const { cmd } = require("../command");
const axios = require("axios");
const NodeCache = require("node-cache");

// Initialize cache for search results (1-minute TTL)
const searchCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// ======================
// FROZEN QUEEN THEME
// ======================
const frozenTheme = {
  header: `╭═══❖•°❄️°•❖═══╮\n   ༺ FROZEN-QUEEN-MD ༻\n   ❅ THE ROYAL ICE KINGDOM ❅\n╰═══❖•°❄️°•❖═══╯\n`,
  box: function (title, content) {
    return `${this.header}╔═════❖ ❄️ ❖═════╗\n   ✧ ${title} ✧\n╚═════❖ ❄️ ❖═════╝\n\n${content}\n\n❄═════❖ ❄️ ❖═════❄\n✧ THE COLD NEVER BOTHERED ME ANYWAY ✧`;
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
  resultEmojis: ["❄️", "🧊", "👑", "🎥", "🎬", "📽️", "🎞️", "❅", "✧", "🌬️"],
};

// Movie search and download command
cmd(
  {
    pattern: "movie",
    react: "❄️",
    desc: "Search and claim frozen cinematic treasures",
    category: "ice kingdom",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    if (!q) {
      return reply(
        frozenTheme.box(
          "ROYAL DECREE",
          "❅ Usage: .movie <movie name>\n❅ Example: .movie Deadpool\n❅ Summons: Cinematic treasures from the ice vaults",
        ),
      );
    }

    try {
      // Step 1: Check cache for search results
      const cacheKey = `movie_search_${q.toLowerCase()}`;
      let searchData = searchCache.get(cacheKey);

      if (!searchData) {
        const searchUrl = `https://apis.davidcyriltech.my.id/movies/search?query=${encodeURIComponent(q)}`;
        const searchResponse = await axios.get(searchUrl, { timeout: 3000 });
        searchData = searchResponse.data;

        if (!searchData.status || !searchData.results || searchData.results.length === 0) {
          throw new Error("No cinematic treasures found in the ice kingdom");
        }

        searchCache.set(cacheKey, searchData);
      }

      // Format movie list
      let movieList = `❄️ *FROZEN CINEMATIC VAULT* ❄️\n\n`;
      const movies = searchData.results.map((movie, index) => ({
        number: index + 1,
        title: movie.title,
        imdb: movie.imdb,
        year: movie.year,
        link: movie.link,
        image: movie.image,
      }));

      movies.forEach((movie) => {
        movieList += `${frozenTheme.resultEmojis[0]} ${movie.number}. *${movie.title}*\n`;
        movieList += `   ${frozenTheme.resultEmojis[2]} IMDB: ${movie.imdb}\n`;
        movieList += `   ${frozenTheme.resultEmojis[1]} Year: ${movie.year}\n\n`;
      });
      movieList += `${frozenTheme.resultEmojis[8]} Reply with the number to unveil the treasure\n`;
      movieList += `${frozenTheme.resultEmojis[9]} FROZEN-QUEEN BY MR.Chathura`;

      // Send movie list with first movie's thumbnail
      const sentMessage = await conn.sendMessage(
        from,
        {
          image: { url: movies[0].image },
          caption: frozenTheme.box("CINEMATIC QUEST", movieList),
          ...frozenTheme.getForwardProps(),
        },
        { quoted: mek },
      );
// Step 2: Listen for movie selection
conn.ev.on("messages.upsert", async (update) => {
  const message = update.messages[0];
  if (!message.message || !message.message.extendedTextMessage) return;

  const userReply = message.message.extendedTextMessage.text.trim();
  
  // ඩිබග් කිරීම: contextInfo ලොග් කරන්න
  console.log("Reply ContextInfo:", message.message.extendedTextMessage.contextInfo);
  
  // රිප්ලයි එක ලින්ක් වෙලාද කියල චෙක් කරන්න (contextInfo නැත්නම් හැසිරෙන්න)
  const replyStanzaId = message.message.extendedTextMessage.contextInfo?.stanzaId;
  if (!replyStanzaId || replyStanzaId !== sentMessage.key.id) {
    console.log("StanzaId mismatch or missing:", replyStanzaId, sentMessage.key.id);
    return;
  }

  const selectedNumber = parseInt(userReply, 10);
  const selectedMovie = movies.find((movie) => movie.number === selectedNumber);

  if (!selectedMovie) {
    await conn.sendMessage(
      from,
      {
        text: frozenTheme.box(
          "FROZEN WARNING",
          "❅ Invalid decree!\n❅ Choose a valid movie number\n❅ The snowgies are bewildered",
        ),
        ...frozenTheme.getForwardProps(),
      },
      { quoted: message },
    );
    return;
  }

  // ඉතිරි කෝඩ් එක එහෙමම තියෙන්න ඕන...                                                               }

        // Step 3: Fetch download links
        const downloadUrl = `https://apis.davidcyriltech.my.id/movies/download?url=${encodeURIComponent(selectedMovie.link)}`;
        const downloadResponse = await axios.get(downloadUrl, { timeout: 3000 });
        const downloadData = downloadResponse.data;

        if (!downloadData.status || !downloadData.movie.download_links) {
          throw new Error("No download links found in the ice vaults");
        }

        // Filter for SD (480p) and HD (720p or 1080p)
        const downloadLinks = [];
        const allLinks = downloadData.movie.download_links;

        const sdLink = allLinks.find((link) => link.quality === "SD 480p");
        if (sdLink) {
          downloadLinks.push({
            number: 1,
            quality: "SD Quality",
            size: sdLink.size,
            url: sdLink.direct_download,
          });
        }

        let hdLink = allLinks.find((link) => link.quality === "HD 720p");
        if (!hdLink) {
          hdLink = allLinks.find((link) => link.quality === "FHD 1080p");
        }
        if (hdLink) {
          downloadLinks.push({
            number: 2,
            quality: "HD Quality",
            size: hdLink.size,
            url: hdLink.direct_download,
          });
        }

        if (downloadLinks.length === 0) {
          throw new Error("No SD or HD quality available in the ice vaults");
        }

        // Function to send quality options
        const sendQualityOptions = async (quotedMessage) => {
          let downloadOptions = `${frozenTheme.resultEmojis[3]} *${selectedMovie.title}*\n\n`;
          downloadOptions += `${frozenTheme.resultEmojis[4]} *Select Your Quality*:\n\n`;
          downloadLinks.forEach((link) => {
            downloadOptions += `${frozenTheme.resultEmojis[0]} ${link.number}. *${link.quality}* (${link.size})\n`;
          });
          downloadOptions += `\n${frozenTheme.resultEmojis[8]} Reply with the number to claim your treasure\n`;
          downloadOptions += `${frozenTheme.resultEmojis[7]} Reply 'done' to finish\n`;
          downloadOptions += `${frozenTheme.resultEmojis[9]} FROZEN-QUEEN BY MR.Chathura`;

          return await conn.sendMessage(
            from,
            {
              image: {
                url: downloadData.movie.thumbnail || selectedMovie.image || "https://i.ibb.co/5Yb4VZy/snowflake.jpg",
              },
              caption: frozenTheme.box("ROYAL VAULT", downloadOptions),
              ...frozenTheme.getForwardProps(),
            },
            { quoted: quotedMessage },
          );
        };

        // Send initial quality options
        let downloadMessage = await sendQualityOptions(message);

        // Step 4: Listen for quality selection
        conn.ev.on("messages.upsert", async (updateQuality) => {
          const qualityMessage = updateQuality.messages[0];
          if (!qualityMessage.message || !qualityMessage.message.extendedTextMessage) return;

          const qualityReply = qualityMessage.message.extendedTextMessage.text.trim().toLowerCase();
          if (qualityMessage.message.extendedTextMessage.contextInfo.stanzaId !== downloadMessage.key.id) return;

          // Check if user wants to exit
          if (qualityReply === "done") {
            await conn.sendMessage(
              from,
              {
                text: frozenTheme.box(
                  "ROYAL FAREWELL",
                  "❅ Your cinematic quest concludes!\n❅ Return to the ice kingdom anytime\n❅ FROZEN-QUEEN BY MR.Chathura",
                ),
                ...frozenTheme.getForwardProps(),
              },
              { quoted: qualityMessage },
            );
            return;
          }

          const selectedQualityNumber = parseInt(qualityReply, 10);
          const selectedLink = downloadLinks.find((link) => link.number === selectedQualityNumber);

          if (!selectedLink) {
            await conn.sendMessage(
              from,
              {
                text: frozenTheme.box(
                  "FROZEN WARNING",
                  "❅ Invalid decree!\n❅ Choose a valid quality number or 'done'\n❅ The snowgies are bewildered",
                ),
                ...frozenTheme.getForwardProps(),
              },
              { quoted: qualityMessage },
            );
            return;
          }

          // Step 5: Send movie file as document with error handling
          const sizeInGB = parseFloat(selectedLink.size);
          if (sizeInGB > 1.5) {
            await conn.sendMessage(
              from,
              {
                text: frozenTheme.box(
                  "ICE WARNING",
                  `❅ Treasure too grand (${selectedLink.size})!\n❅ Download directly: ${selectedLink.url}\n❅ Choose a smaller quality for delivery`,
                ),
                ...frozenTheme.getForwardProps(),
              },
              { quoted: qualityMessage },
            );
          } else {
            try {
              await conn.sendMessage(
                from,
                {
                  document: { url: selectedLink.url },
                  mimetype: "video/mp4",
                  fileName: `${selectedMovie.title} - ${selectedLink.quality}.mp4`,
                  caption: frozenTheme.box(
                    "CINEMATIC TREASURE",
                    `${frozenTheme.resultEmojis[3]} *${selectedMovie.title}*\n${frozenTheme.resultEmojis[4]} Quality: ${selectedLink.quality}\n${frozenTheme.resultEmojis[2]} Size: ${selectedLink.size}\n\n${frozenTheme.resultEmojis[8]} Your treasure shines in the ice kingdom!\n${frozenTheme.resultEmojis[9]} FROZEN-QUEEN BY MR.Chathura`,
                  ),
                  ...frozenTheme.getForwardProps(),
                },
                { quoted: qualityMessage },
              );
            } catch (uploadError) {
              console.error("Upload Error:", uploadError);
              await conn.sendMessage(
                from,
                {
                  text: frozenTheme.box(
                    "ICE STORM",
                    `❅ Failed to deliver treasure!\n❅ Download directly: ${selectedLink.url}\n❅ Try another quality or check your connection`,
                  ),
                  ...frozenTheme.getForwardProps(),
                },
                { quoted: qualityMessage },
              );
            }
          }

          await conn.sendMessage(
            from,
            { react: { text: frozenTheme.resultEmojis[0], key: qualityMessage.key } },
          );

          // Resend quality options for multiple downloads
          downloadMessage = await sendQualityOptions(qualityMessage);
        });
      });
    } catch (e) {
      console.error("Error:", e);
      const errorMsg = frozenTheme.box(
        "ICE STORM",
        `❅ Error: ${e.message || "The ice harpies shattered the vault"}\n❅ The royal treasury is sealed\n❅ Retry when the storm clears`,
      );

      await reply(errorMsg);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
  },
);
