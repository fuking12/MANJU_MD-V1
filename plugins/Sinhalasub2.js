const { cmd } = require("../command");
const axios = require('axios');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

// Initialize cache (1-minute TTL)
const searchCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// ======================
// MANJU_MD Theme
// ======================
const manjuTheme = {
  header: `🎬 MANJU_MD MOVIE VAULT 🎬\n*PATHUM RAJAPAKSHE CINESUBZ SITE*\n`,
  box: function(title, content) {
    return `${this.header}═══════ 🎥 ═══════\n✨ ${title} ✨\n═══════════════\n\n${content}\n\n═══════ 🎬 ═══════\n*PATHUM RAJAPAKSHE CINESUBZ SITE*`;
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
  resultEmojis: ["🎬", "🎥", "🔢", "📽️", "🎞️", "✨", "🌟", "🎭", "📺", "🔍"]
};

// Film search and download command
cmd({
  pattern: "cinsubz",
  react: "🎬",
  desc: "Enjoy cinema from MANJU_MD's treasury of films with Sinhala subtitles",
  category: "movie vault",
  filename: __filename,
}, async (conn, mek, m, { from, q, pushname }) => {
  if (!q) {
    await conn.sendMessage(from, {
      text: manjuTheme.box("Royal Decree", 
        "🎬 Usage: . cinsubz <movie name or URL>\n🎬 Example: . cinsubz Deadpool or . cinsubz https://cinesubz.co/...\n🎬 Vault: Films with Sinhala Subtitles\n🎬 Reply 'done' to stop"),
      ...manjuTheme.getForwardProps()
    }, { quoted: mek });
    return;
  }

  try {
    // Check if input is a Cinesubz URL
    if (q.startsWith('https://cinesubz.co/')) {
      // Download movie
      await conn.sendMessage(from, {
        text: manjuTheme.box("Downloading", 
          `🎬 Fetching movie from Cinesubz...\n🎬 URL: ${q}\n🎬 Please wait...`),
        ...manjuTheme.getForwardProps()
      }, { quoted: mek });

      // Call download API
      const downloadUrl = `https://chathurahansakamvd.netlify.app/mvd?url=${encodeURIComponent(q)}`;
      let downloadData;
      let downloadRetries = 3;

      while (downloadRetries > 0) {
        try {
          const downloadResponse = await axios.get(downloadUrl, { timeout: 10000 });
          downloadData = downloadResponse.data;
          break;
        } catch (error) {
          downloadRetries--;
          if (downloadRetries === 0) {
            throw new Error("Failed to retrieve download link from Cinesubz");
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Assuming download API returns a direct file URL
      const fileUrl = downloadData.downloadUrl || downloadData;
      if (!fileUrl || !fileUrl.startsWith('http')) {
        throw new Error("Invalid download link provided");
      }

      // Fetch file metadata to check size
      const headResponse = await axios.head(fileUrl, { timeout: 10000 });
      const fileSize = parseInt(headResponse.headers['content-length'] || '0');
      
      // Check file size (up to 3GB)
      if (fileSize === 0) {
        throw new Error("File size is unknown or invalid");
      }
      if (fileSize > 3 * 1024 * 1024 * 1024) {
        throw new Error("File exceeds 3GB limit");
      }

      // If file is under 100MB, download and send via WhatsApp
      if (fileSize <= 100 * 1024 * 1024) {
        const filePath = path.join(__dirname, `movie-${Date.now()}.mp4`);
        const response = await axios({
          url: fileUrl,
          method: 'GET',
          responseType: 'stream'
        });

        // Save the movie file
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Verify file size
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          fs.unlinkSync(filePath);
          throw new Error("Downloaded file is empty or invalid");
        }

        // Send as document
        await conn.sendMessage(from, {
          document: { url: filePath },
          mimetype: "video/mp4",
          fileName: `movie-${q.split('/').pop()}.mp4`,
          caption: manjuTheme.box("Movie Treasure", 
            `${manjuTheme.resultEmojis[3]} *Cinesubz Movie*\n${manjuTheme.resultEmojis[4]} Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB\n\n${manjuTheme.resultEmojis[8]} MANJU_MD MOVIE DOWNLOAD SUCCESSFULLY!\n${manjuTheme.resultEmojis[9]} MANJU_MD BY PATHUM RAJAPAKSHE`),
          ...manjuTheme.getForwardProps()
        }, { quoted: mek });

        fs.unlinkSync(filePath);
      } else {
        // For files over 100MB, share the direct download link
        await conn.sendMessage(from, {
          text: manjuTheme.box("Movie Treasure", 
            `${manjuTheme.resultEmojis[3]} *Cinesubz Movie*\n${manjuTheme.resultEmojis[4]} Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB\n${manjuTheme.resultEmojis[2]} Direct Download: ${fileUrl}\n\n${manjuTheme.resultEmojis[8]} MANJU_MD MOVIE DOWNLOAD SUCCESSFULLY!\n${manjuTheme.resultEmojis[9]} MANJU_MD BY PATHUM RAJAPAKSHE`),
          ...manjuTheme.getForwardProps()
        }, { quoted: mek });
      }
    } else {
      // Search movies
      const cacheKey = `film_search_${q.toLowerCase()}`;
      let searchData = searchCache.get(cacheKey);

      if (!searchData) {
        const searchUrl = `https://chathurahansaka.netlify.app/?q=${encodeURIComponent(q)}`;
        let retries = 3;
        while (retries > 0) {
          try {
            const searchResponse = await axios.get(searchUrl, { timeout: 10000 });
            searchData = searchResponse.data;
            break;
          } catch (error) {
            retries--;
            if (retries === 0) throw new Error("Failed to retrieve data from Cinesubz");
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!searchData.movies || searchData.movies.length === 0) {
          throw new Error("No films found in Cinesubz");
        }

        searchCache.set(cacheKey, searchData);
      }

      // Format movie list
      let filmList = `Cinesubz Movie Results 🎬\n\nInput: ${q}\n\nReply Below Number 🔢,\ncinesubz.co results\n\n`;
      const films = searchData.movies.map((film, index) => ({
        number: index + 1,
        title: film.title,
        link: film.url,
        image: null // Image not provided in search API
      }));

      films.forEach(film => {
        filmList += `${film.number} || ${film.title}\n`;
      });
      filmList += `\n${manjuTheme.resultEmojis[2]} Reply 'done' to stop\n${manjuTheme.resultEmojis[9]} MANJU_MD BY PATHUM RAJAPAKSHE`;

      const movieListMessage = await conn.sendMessage(from, {
        text: manjuTheme.box("Movie Quest", filmList),
        ...manjuTheme.getForwardProps()
      }, { quoted: mek });

      const movieListMessageKey = movieListMessage.key;

      // Track download options
      const downloadOptionsMap = new Map();

      // Handle movie selections
      const selectionHandler = async (update) => {
        const message = update.messages[0];
        if (!message.message || !message.message.extendedTextMessage) return;

        const replyText = message.message.extendedTextMessage.text.trim();
        const repliedToId = message.message.extendedTextMessage.contextInfo.stanzaId;

        // Exit condition
        if (replyText.toLowerCase() === "done") {
          conn.ev.off("messages.upsert", selectionHandler);
          downloadOptionsMap.clear();
          await conn.sendMessage(from, {
            text: manjuTheme.box("Farewell", 
              "🎬 Movie quest ended!\n🎬 Return to the Cinesubz Vault anytime"),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });
          return;
        }

        // Movie selection
        if (repliedToId === movieListMessageKey.id) {
          const selectedNumber = parseInt(replyText);
          const selectedFilm = films.find(film => film.number === selectedNumber);

          if (!selectedFilm) {
            await conn.sendMessage(from, {
              text: manjuTheme.box("Warning", 
                "🎬 Invalid selection!\n🎬 Choose a movie number"),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
            return;
          }

          // Trigger download for selected movie
          await conn.sendMessage(from, {
            text: manjuTheme.box("Downloading", 
              `🎬 Fetching ${selectedFilm.title}...\n🎬 Please wait...`),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });

          // Call download API
          const downloadUrl = `https://chathurahansakamvd.netlify.app/mvd?url=${encodeURIComponent(selectedFilm.link)}`;
          let downloadData;
          let downloadRetries = 3;

          while (downloadRetries > 0) {
            try {
              const downloadResponse = await axios.get(downloadUrl, { timeout: 10000 });
              downloadData = downloadResponse.data;
              break;
            } catch (error) {
              downloadRetries--;
              if (downloadRetries === 0) {
                await conn.sendMessage(from, {
                  text: manjuTheme.box("Warning", 
                    `🎬 Failed to fetch download link: ${error.message}\n🎬 Please try another movie`),
                  ...manjuTheme.getForwardProps()
                }, { quoted: message });
                return;
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          // Assuming download API returns a direct file URL
          const fileUrl = downloadData.downloadUrl || downloadData;
          if (!fileUrl || !fileUrl.startsWith('http')) {
            throw new Error("Invalid download link provided");
          }

          // Fetch file metadata to check size
          const headResponse = await axios.head(fileUrl, { timeout: 10000 });
          const fileSize = parseInt(headResponse.headers['content-length'] || '0');

          // Check file size
          if (fileSize === 0) {
            throw new Error("File size is unknown or invalid");
          }
          if (fileSize > 3 * 1024 * 1024 * 1024) {
            throw new Error("File exceeds 3GB limit");
          }

          // If file is under 100MB, download and send via WhatsApp
          if (fileSize <= 100 * 1024 * 1024) {
            const filePath = path.join(__dirname, `movie-${Date.now()}.mp4`);
            const response = await axios({
              url: fileUrl,
              method: 'GET',
              responseType: 'stream'
            });

            // Save the movie file
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });

            // Verify file size
            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
              fs.unlinkSync(filePath);
              throw new Error("Downloaded file is empty or invalid");
            }

            // Send as document
            await conn.sendMessage(from, {
              document: { url: filePath },
              mimetype: "video/mp4",
              fileName: `${selectedFilm.title}.mp4`,
              caption: manjuTheme.box("Movie Treasure", 
                `${manjuTheme.resultEmojis[3]} *${selectedFilm.title}*\n${manjuTheme.resultEmojis[4]} Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB\n\n${manjuTheme.resultEmojis[8]} MANJU_MD MOVIE DOWNLOAD SUCCESSFULLY!\n${manjuTheme.resultEmojis[9]} MANJU_MD BY PATHUM RAJAPAKSHE`),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });

            fs.unlinkSync(filePath);
          } else {
            // Share direct download link for larger files
            await conn.sendMessage(from, {
              text: manjuTheme.box("Movie Treasure", 
                `${manjuTheme.resultEmojis[3]} *${selectedFilm.title}*\n${manjuTheme.resultEmojis[4]} Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB\n${manjuTheme.resultEmojis[2]} Direct Download: ${fileUrl}\n\n${manjuTheme.resultEmojis[8]} MANJU_MD MOVIE DOWNLOAD SUCCESSFULLY!\n${manjuTheme.resultEmojis[9]} MANJU_MD BY PATHUM RAJAPAKSHE`),
              ...manjuTheme.getForwardProps()
            }, { quoted: message });
          }
        }
      };

      // Register the persistent selection listener
      conn.ev.on("messages.upsert", selectionHandler);
    }
  } catch (e) {
    console.error("Error:", e);
    await conn.sendMessage(from, {
      text: manjuTheme.box("Error", 
        `🎬 Error: ${e.message || "Cinesubz Vault access failed"}\n🎬 Vault closed\n🎬 Try again later`),
      ...manjuTheme.getForwardProps()
    }, { quoted: mek });
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
