const { cmd } = require("../command");
const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache (1-minute TTL)
const searchCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// ======================
// MANJU_MD Theme
// ======================
const manjuTheme = {
  header: `🎬 *MANJU_MD MOVIE VAULT* 🎬\n🔢 Sinhalasub.lk Results 🔢\n`,
  box: function(title, content) {
    return `${this.header}══════ 🎥 ${title} 🎥 ══════\n\n${content}\n\n══════ 🎬 MANJU_MD 🎬 ══════\nMᴀɴᴊᴜ_Mᴅ SɪɴʜᴀʟᴀSᴜʙ Sɪᴛᴇ...`;
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
          conversionSource: "manju_md",
          conversionType: "message"
        }
      }
    };
  },
  resultEmojis: ["🎥", "🎬", "🔢", "📽️", "🎞️", "🎭", "📺", "🎟️", "🔍", "⬇️"]
};

// Film search and download command
cmd({
  pattern: "film2",
  react: "🎥",
  desc: "Explore cinema from MANJU_MD's vault of films with Sinhala subtitles",
  category: "movie vault",
  filename: __filename,
}, async (conn, mek, m, { from, q, pushname }) => {
  if (!q) {
    await conn.sendMessage(from, {
      text: manjuTheme.box("Movie Vault", 
        "🎬 Usage: .film2 <movie name>\n🎬 Example: .film2 Deadpool\n🎬 Vault: Films with Sinhala Subtitles\n🎬 Reply 'done' to stop"),
      ...manjuTheme.getForwardProps()
    }, { quoted: mek });
    return;
  }

  try {
    // Step 1: Check cache for movie data
    const cacheKey = `film_search_${q.toLowerCase()}`;
    let searchData = searchCache.get(cacheKey);

    if (!searchData) {
      const searchUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${encodeURIComponent(q)}`;
      let retries = 3;
      while (retries > 0) {
        try {
          const searchResponse = await axios.get(searchUrl, { timeout: 10000 });
          searchData = searchResponse.data;
          console.log("Search API Response:", JSON.stringify(searchData, null, 2));
          break;
        } catch (error) {
          retries--;
          console.error(`Search API Error (Attempt ${4 - retries}/3):`, {
            message: error.message,
            code: error.code,
            response: error.response ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            } : "No response data"
          });
          if (retries === 0) {
            throw new Error(`Failed to retrieve data from movie vault after 3 attempts: ${error.message}`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!searchData.status || !searchData.result.data || searchData.result.data.length === 0) {
        throw new Error("No films found in Movie Vault");
      }

      searchCache.set(cacheKey, searchData);
    }

    // Step 2: Format movie list
    let filmList = `🎬 *SINHALASUB MOVIE RESULTS* 🎬\n\n`;
    const films = searchData.result.data.map((film, index) => ({
      number: index + 1,
      title: film.title.replace("Sinhala Subtitles | සිංහල උපසිරසි සමඟ", "").trim(),
      link: film.link,
      image: null // Image not provided in search API, will fetch later
    }));

    films.forEach(film => {
      filmList += `${manjuTheme.resultEmojis[0]} ${film.number} || *${film.title}*\n`;
    });
    filmList += `\n${manjuTheme.resultEmojis[8]} Reply Below Number 🔢\n`;
    filmList += `${manjuTheme.resultEmojis[9]} Reply 'done' to stop\n`;

    const movieListMessage = await conn.sendMessage(from, {
      text: manjuTheme.box("Movie Selection", filmList),
      ...manjuTheme.getForwardProps()
    }, { quoted: mek });

    const movieListMessageKey = movieListMessage.key;
    console.log("Movie List Message Key:", movieListMessageKey);

    // Step 3: Track download options with a Map
    const downloadOptionsMap = new Map();

    // Step 4: Handle movie and quality selections with a single listener
    const selectionHandler = async (update) => {
      try {
        const message = update.messages[0];
        console.log("Received Message in Selection Handler:", JSON.stringify(message, null, 2));

        // Validate message structure
        if (!message.message) {
          console.error("No message content found in update");
          return;
        }

        // Check if the message is a reply
        const isReply = message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo;
        if (!isReply) {
          console.error("Message is not a reply or missing contextInfo");
          return;
        }

        const replyText = message.message.extendedTextMessage.text.trim();
        const repliedToId = message.message.extendedTextMessage.contextInfo.stanzaId;

        console.log(`Reply Text: ${replyText}, Replied To ID: ${repliedToId}`);

        // Exit condition
        if (replyText.toLowerCase() === "done") {
          conn.ev.off("messages.upsert", selectionHandler);
          downloadOptionsMap.clear();
          await conn.sendMessage(from, {
            text: manjuTheme.box("Vault Closed", 
              "🎬 Movie quest ended!\n🎬 Return to the Movie Vault anytime"),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });
          return;
        }

        // Movie selection
        if (repliedToId === movieListMessageKey.id) {
          const selectedNumber = parseInt(replyText);
          if (isNaN(selectedNumber)) {
            await conn.sendMessage(from, {
              text: manjuTheme.box("Vault Warning", 
                "🎬 Invalid input! Please reply with a number (e.g., 1)"),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
            return;
          }

          const selectedFilm = films.find(film => film.number === selectedNumber);
          if (!selectedFilm) {
            await conn.sendMessage(from, {
              text: manjuTheme.box("Vault Warning", 
                "🎬 Invalid selection! Please choose a valid movie number"),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
            return;
          }

          // Validate movie link
          if (!selectedFilm.link || !selectedFilm.link.startsWith('http')) {
            await conn.sendMessage(from, {
              text: manjuTheme.box("Vault Warning", 
                "🎬 Invalid movie link provided\n🎬 Please select another movie"),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
            return;
          }

          // Fetch download links and details
          const downloadUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${encodeURIComponent(selectedFilm.link)}`;
          let downloadData;
          let downloadRetries = 3;

          while (downloadRetries > 0) {
            try {
              const downloadResponse = await axios.get(downloadUrl, { timeout: 10000 });
              downloadData = downloadResponse.data;
              console.log("Download API Response:", JSON.stringify(downloadData, null, 2));
              if (!downloadData.status || !downloadData.result.data) {
                throw new Error("Invalid API response: Missing status or data");
              }
              break;
            } catch (error) {
              console.error(`Download API Error (Attempt ${4 - downloadRetries}/3):`, {
                message: error.message,
                code: error.code,
                response: error.response ? {
                  status: error.response.status,
                  statusText: error.response.statusText,
                  data: error.response.data
                } : "No response data"
              });
              downloadRetries--;
              if (downloadRetries === 0) {
                await conn.sendMessage(from, {
                  text: manjuTheme.box("Vault Warning", 
                    `🎬 Failed to fetch download links: ${error.message}\n🎬 Please try another movie`),
                  ...manjuTheme.getForwardProps()
                }, { quoted: message });
                return;
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          const movieDetails = downloadData.result.data;
          const downloadLinks = [];

          // Enhanced link extraction
          const extractLinksRecursively = (obj) => {
            if (Array.isArray(obj)) {
              obj.forEach(item => extractLinksRecursively(item));
            } else if (typeof obj === 'object' && obj !== null) {
              for (let key in obj) {
                if ((key.toLowerCase().includes('link') || key.toLowerCase().includes('download') || key.toLowerCase().includes('url')) && 
                    obj[key] && typeof obj[key] === 'string' && obj[key].startsWith('http')) {
                  downloadLinks.push({
                    number: downloadLinks.length + 1,
                    quality: obj.quality || obj.resolution || "Available Quality",
                    size: obj.size || "Unknown",
                    url: obj[key]
                  });
                } else if (Array.isArray(obj[key]) || (typeof obj[key] === 'object' && obj[key] !== null)) {
                  extractLinksRecursively(obj[key]);
                }
              }
            }
          };

          extractLinksRecursively(downloadData);
          console.log("Extracted Links:", JSON.stringify(downloadLinks, null, 2));

          // Filter and validate links
          const validLinks = downloadLinks.filter(link => link.url && link.url.startsWith('http'));
          if (validLinks.length === 0) {
            await conn.sendMessage(from, {
              text: manjuTheme.box("Vault Warning", 
                "🎬 No downloadable links found in API response\n🎬 Please try another movie"),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
            return;
          }

          // Display download options immediately
          let downloadOptions = `${manjuTheme.resultEmojis[3]} *${selectedFilm.title}*\n\n`;
          downloadOptions += `${manjuTheme.resultEmojis[4]} *Available Downloads*:\n\n`;
          validLinks.forEach(link => {
            downloadOptions += `${manjuTheme.resultEmojis[0]} ${link.number}. *${link.quality}* (${link.size})\n`;
          });
          downloadOptions += `\n${manjuTheme.resultEmojis[8]} Select quality: Reply with the number\n`;
          downloadOptions += `${manjuTheme.resultEmojis[9]} Reply 'done' to stop\n`;

          const downloadMessage = await conn.sendMessage(from, {
            image: { url: movieDetails.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop" },
            caption: manjuTheme.box("Movie Treasury", downloadOptions),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });

          // Store download options in Map
          downloadOptionsMap.set(downloadMessage.key.id, { film: selectedFilm, downloadLinks: validLinks });
        }
        // Quality selection
        else if (downloadOptionsMap.has(repliedToId)) {
          const { film, downloadLinks } = downloadOptionsMap.get(repliedToId);
          const selectedQualityNumber = parseInt(replyText);
          if (isNaN(selectedQualityNumber)) {
            await conn.sendMessage(from, {
              text: manjuTheme.box("Vault Warning", 
                "🎬 Invalid input! Please reply with a number (e.g., 1)"),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
            return;
          }

          const selectedLink = downloadLinks.find(link => link.number === selectedQualityNumber);
          if (!selectedLink) {
            await conn.sendMessage(from, {
              text: manjuTheme.box("Vault Warning", 
                "🎬 Invalid quality selection!\n🎬 Choose a quality number"),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
            return;
          }

          // Check file size
          const sizeStr = selectedLink.size.toLowerCase();
          let sizeInGB = 0;
          if (sizeStr.includes("gb")) {
            sizeInGB = parseFloat(sizeStr.replace("gb", "").trim());
          } else if (sizeStr.includes("mb")) {
            sizeInGB = parseFloat(sizeStr.replace("mb", "").trim()) / 1024;
          }

          if (sizeInGB > 2) {
            await conn.sendMessage(from, {
              text: manjuTheme.box("Vault Warning", 
                `🎬 Item too large (${selectedLink.size})!\n🎬 Direct download: ${selectedLink.url}\n🎬 Try a smaller quality`),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
            return;
          }

          // Send movie as video with fallback
          try {
            await conn.sendMessage(from, {
              video: { url: selectedLink.url },
              mimetype: "video/mp4",
              caption: manjuTheme.box("Movie Downloaded", 
                `${manjuTheme.resultEmojis[3]} *${film.title}*\n${manjuTheme.resultEmojis[4]} Quality: ${selectedLink.quality}\n${manjuTheme.resultEmojis[2]} Size: ${selectedLink.size}\n\n${manjuTheme.resultEmojis[8]} Mᴏᴠɪᴇ Dᴏᴡɴʟᴏᴀᴅᴇᴅ Bʏ Mᴀɴᴊᴜ_ᴍᴅ`),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
            await conn.sendMessage(from, { react: { text: manjuTheme.resultEmojis[0], key: message.key } });
          } catch (downloadError) {
            console.error("Video Send Error:", downloadError.message);
            await conn.sendMessage(from, {
              text: manjuTheme.box("Vault Warning", 
                `🎬 Failed to stream video: ${downloadError.message}\n🎬 Direct download link: ${selectedLink.url}\n🎬 Please download manually`),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
          }
        } else {
          console.log("Reply does not match any expected message ID");
        }
      } catch (error) {
        console.error("Selection Handler Error:", error);
        await conn.sendMessage(from, {
          text: manjuTheme.box("Vault Error", 
            `🎬 Error during selection: ${error.message || "Unknown error"}\n🎬 Please try again`),
          ...manjuTheme.getForwardProps()
        }, { quoted: update.messages[0] });
      }
    };

    // Register the persistent selection listener
    conn.ev.on("messages.upsert", selectionHandler);

  } catch (e) {
    console.error("Main Error:", e);
    await conn.sendMessage(from, {
      text: manjuTheme.box("Vault Error", 
        `🎬 Error: ${e.message || "Movie Vault access denied"}\n🎬 Vault closed\n🎬 Try again later`),
      ...manjuTheme.getForwardProps()
    }, { quoted: mek });
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
