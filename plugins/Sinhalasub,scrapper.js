const { cmd } = require("../command"); 
const axios = require('axios');
const NodeCache = require('node-cache');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Cache initialization with 1 minute TTL
const searchCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// ======================
// PATHUM RAJAPAKSHE THEME
// ======================
const frozenTheme = {
  header: `🎬 PATHUM RAJAPAKSHE MOVIE HUB 🎬\n✨ Powered by Manju_MD ✨\n`,
  box: function(title, content) {
    return `${this.header}┌───────────★───────────┐\n│ ${title} │\n└───────────★───────────┘\n\n${content}\n\n★ Powered by Pathum Rajapakshe ★`;
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
          conversionSource: "pathum_rajapakshe",
          conversionType: "message"
        }
      }
    };
  },
  resultEmojis: ["📽️", "🧊", "👑", "🎥", "🎬", "📽️", "🎞️", "❅", "✨", "✧"]
};

// Function to extract links from any nested structure
const extractLinks = (data) => {
  let links = [];

  if (Array.isArray(data)) {
    links = data;
  } else if (typeof data === 'object' && data !== null) {
    if (data.error || data.message) {
      throw new Error(`API Error: ${data.error || data.message}`);
    }

    links = data.links || data.downloadLinks || data.data || data.urls || data.download || [];

    if (data.result && data.result.data && Array.isArray(data.result.data.dl_links)) {
      links = data.result.data.dl_links;
    }
    
    if (!Array.isArray(links)) {
      for (let key in data) {
        if (Array.isArray(data[key])) {
          links = data[key];
          break;
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          links = extractLinks(data[key]);
          if (links.length > 0) break;
        }
      }
    }
  }

  return links.filter(link => 
    link && (link.url || link.link || link.download || link.direct_download || link.href || link.download_url)
  ).map(link => ({
    quality: link.quality || "Unknown Quality",
    size: link.size || "Unknown",
    url: link.url || link.link || link.download || link.direct_download || link.href || link.download_url
  }));
};

// Function to download and split the video with improved validation
const downloadAndSplitVideo = async (url, outputDir, fileName) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const videoPath = path.join(outputDir, `${fileName}.mp4`);
      
      // Download the video using https module
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(videoPath);
        https.get(url, (response) => {
          if (response.statusCode !== 200) {
            file.close();
            fs.unlinkSync(videoPath);
            return reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
          }

          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', (err) => {
          file.close();
          fs.unlinkSync(videoPath);
          reject(new Error(`Download error: ${err.message}`));
        });

        setTimeout(() => {
          reject(new Error('Download timeout'));
        }, 60000); // 60 seconds timeout
      });

      console.log(`Downloaded video to ${videoPath}`);

      // Validate file size
      const stats = fs.statSync(videoPath);
      const fileSize = stats.size;
      if (fileSize < 1024 * 1024) { // Less than 1 MB is suspicious
        fs.unlinkSync(videoPath);
        throw new Error('Downloaded file is too small, likely invalid');
      }

      // Validate the file with ffprobe
      await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) {
            fs.unlinkSync(videoPath); // Remove invalid file
            return reject(new Error(`ffprobe error: ${err.message}`));
          }
          if (!metadata || !metadata.format || !metadata.format.duration) {
            fs.unlinkSync(videoPath); // Remove invalid file
            return reject(new Error('Invalid video file: No duration metadata'));
          }
          resolve();
        });
      });

      // Split the video into 64 MB chunks
      const chunkSize = 64 * 1024 * 1024; // 64 MB in bytes
      const duration = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) return reject(err);
          resolve(metadata.format.duration);
        });
      });

      const chunkDuration = (chunkSize / fileSize) * duration;
      const chunks = Math.ceil(fileSize / chunkSize);
      const chunkFiles = [];

      for (let i = 0; i < chunks; i++) {
        const chunkFile = path.join(outputDir, `${fileName}_part${i + 1}.mp4`);
        await new Promise((resolve, reject) => {
          ffmpeg(videoPath)
            .seekInput(i * chunkDuration)
            .duration(chunkDuration)
            .output(chunkFile)
            .on('end', () => {
              console.log(`Created chunk ${chunkFile}`);
              chunkFiles.push(chunkFile);
              resolve();
            })
            .on('error', reject)
            .run();
        });
      }

      // Clean up original file
      fs.unlinkSync(videoPath);

      return chunkFiles;
    } catch (error) {
      console.error(`Download/Split Error (Attempt ${retryCount + 1}):`, error.message);
      retryCount++;
      if (retryCount === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
    }
  }
};

// Film search and download command
cmd({
  pattern: "film",
  react: "🎬",
  desc: "Get Movies from Pathum Rajapakshe's Treasury to Enjoy Cinema",
  category: "Movie Hub",
  filename: __filename,
}, async (conn, mek, m, { from, q, pushname, reply }) => {
  if (!q) {
    return reply(frozenTheme.box("Sinhala Sub Movie", 
      "Use: .film <film name>\n✨ Ex: .film Deadpool\nPathum's SinhalaSub Movie List"));
  }

  try {
    // Step 1: Check cache for movie info
    const cacheKey = `film_search_${q.toLowerCase()}`;
    let searchData = searchCache.get(cacheKey);

    if (!searchData) {
      let searchUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${encodeURIComponent(q)}`;
      let fallbackSearchUrl = `https://apicinex.vercel.app/api/sinhalasub/movie/search?q=${encodeURIComponent(q)}`;
      let retries = 3;
      let usingFallback = false;

      while (retries > 0) {
        try {
          const searchResponse = await axios.get(searchUrl, { timeout: 15000 });
          searchData = searchResponse.data;

          console.log("Primary API Response:", JSON.stringify(searchData));

          let results;
          if (Array.isArray(searchData)) {
            results = searchData;
          } else {
            results = searchData.results || searchData.data || searchData.movies || [];
          }

          if (!searchData || typeof searchData !== 'object' || !Array.isArray(results) || results.length === 0) {
            throw new Error("No movies found in sinhalasub site or invalid response structure. Response: " + JSON.stringify(searchData));
          }

          searchData = { results };
          searchCache.set(cacheKey, searchData);
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            usingFallback = true;
            try {
              const fallbackResponse = await axios.get(fallbackSearchUrl, { timeout: 15000 });
              searchData = fallbackResponse.data;

              console.log("Fallback API Response:", JSON.stringify(searchData));

              let results;
              if (Array.isArray(searchData)) {
                results = searchData;
              } else {
                results = searchData.results || searchData.data || searchData.movies || [];
              }

              if (!searchData || typeof searchData !== 'object' || !Array.isArray(results) || results.length === 0) {
                throw new Error("No movies found in fallback API or invalid response structure. Response: " + JSON.stringify(searchData));
              }

              searchData = { results };
              searchCache.set(cacheKey, searchData);
              break;
            } catch (fallbackError) {
              console.error("Fallback API Error:", fallbackError.message);
              throw new Error("Failed to obtain information from the Film Treasury: " + (fallbackError.message || "Unknown error"));
            }
          }
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    // Step 2: Format movie list
    let filmList = `🎬 SinhalaSub Movie Results 🎬\n\n`;
    filmList += `🔍 Search: ${q}\n\n`;
    filmList += `📝 Reply with the number of the movie you want:\n\n`;

    const films = searchData.results.slice(0, 10).map((film, index) => ({
      number: index + 1,
      title: film.title || "Unknown Title",
      imdb: film.imdb || film.rating || "N/A",
      year: film.year || "Unknown",
      link: film.url || film.link || "",
      image: film.image || film.imageSrc || "https://i.ibb.co/5Yb4VZy/snowflake.jpg"
    }));

    films.forEach(film => {
      filmList += `${film.number}. ${film.title} (${film.year})\n`;
    });

    filmList += `\n*Powered by Pathum Rajapakshe Movie Hub*`;

    // Step 3: Send movie list
    const sentMessage = await conn.sendMessage(from, {
      text: filmList,
      ...frozenTheme.getForwardProps()
    }, { quoted: m });

    // Step 4: Wait for movie selection
    const filmSelectionHandler = async (update) => {
      const message = update.messages[0];
      if (!message?.message?.conversation && !message?.message?.extendedTextMessage) return;

      const userReply = message.message.conversation || message.message.extendedTextMessage?.text?.trim();
      if (!userReply) return;

      if (message.message.extendedTextMessage?.contextInfo?.stanzaId !== sentMessage.key.id) return;

      const selectedNumber = parseInt(userReply);
      const largestNumber = films.length;
      const selectedFilm = films.find(film => film.number === selectedNumber);

      if (!selectedFilm || isNaN(selectedNumber) || selectedNumber > largestNumber) {
        await conn.sendMessage(from, {
          text: frozenTheme.box("Invalid number", 
            "Please select a valid number from the list"),
          ...frozenTheme.getForwardProps()
        }, { quoted: message });
        return;
      }

      console.log("Selected Film:", selectedFilm);

      conn.ev.off("messages.upsert", filmSelectionHandler);

      // Step 5: Get download links from API
      try {
        let downloadUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${encodeURIComponent(selectedFilm.link)}`;
        const downloadResponse = await axios.get(downloadUrl, { timeout: 15000 });
        let downloadData = downloadResponse.data;

        console.log("Download API Response:", JSON.stringify(downloadData));

        const links = extractLinks(downloadData);
        if (!downloadData || typeof downloadData !== 'object' || !Array.isArray(links) || links.length === 0) {
          throw new Error("No download links available. Response: " + JSON.stringify(downloadData));
        }

        const downloadLinks = links.map((link, index) => ({
          number: index + 1,
          quality: link.quality || "Unknown Quality",
          size: link.size || "Unknown",
          url: link.url
        }));

        console.log("Download Links:", JSON.stringify(downloadLinks));

        // Step 6: Send quality options
        const thumbnailUrl = downloadData.result?.data?.image || selectedFilm.image || "https://i.ibb.co/5Yb4VZy/snowflake.jpg";

        let downloadMessageText = `The movie *${selectedFilm.title} (${selectedFilm.year})* is ready to download.\n\n`;
        downloadMessageText += `📌 Select Quality:\n\n`;

        downloadLinks.forEach(link => {
          downloadMessageText += `${link.number}. ${link.quality} (${link.size})\n`;
        });

        downloadMessageText += `\nReply with the quality number to download the movie\n\n`;
        downloadMessageText += `*Powered by Pathum Rajapakshe*`;

        const downloadMessage = await conn.sendMessage(from, {
          image: { url: thumbnailUrl },
          caption: frozenTheme.box("Download Instruction", downloadMessageText),
          ...frozenTheme.getForwardProps()
        }, { quoted: message });

        // Step 7: Handle quality selection and download
        const qualitySelectionHandler = async (updateQuality) => {
          const qualityMessage = updateQuality.messages[0];
          if (!qualityMessage?.message?.conversation && !qualityMessage?.message?.extendedTextMessage) return;

          const qualityReply = qualityMessage.message.conversation || qualityMessage.message.extendedTextMessage?.text?.trim();
          if (!qualityReply) return;

          if (qualityMessage.message.extendedTextMessage?.contextInfo?.stanzaId !== downloadMessage.key.id) return;

          const selectedQualityNumber = parseInt(qualityReply);
          const selectedLink = downloadLinks.find(link => link.number === selectedQualityNumber);

          console.log("Selected Quality Number:", selectedQualityNumber);
          console.log("Download Links:", JSON.stringify(downloadLinks));

          if (!selectedLink || selectedQualityNumber > downloadLinks.length) {
            await conn.sendMessage(from, {
              text: frozenTheme.box("Invalid Quality", 
                "Please select a valid quality number"),
              ...frozenTheme.getForwardProps()
            }, { quoted: qualityMessage });
            return;
          }

          conn.ev.off("messages.upsert", qualitySelectionHandler);

          // Send "Uploading" message with react
          await conn.sendMessage(from, {
            text: frozenTheme.box("Uploading", 
              `Downloading *${selectedFilm.title} (${selectedFilm.year})* in ${selectedLink.quality}... Please wait.`),
            ...frozenTheme.getForwardProps()
          }, { quoted: qualityMessage });

          await conn.sendMessage(from, { 
            react: { 
              text: "⏳", 
              key: qualityMessage.key 
            }
          });

          try {
            const outputDir = path.join(__dirname, 'downloads');
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir);
            }

            const fileName = `${selectedFilm.title.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedLink.quality}`;
            const chunkFiles = await downloadAndSplitVideo(selectedLink.url, outputDir, fileName);

            for (let i = 0; i < chunkFiles.length; i++) {
              const chunkFile = chunkFiles[i];
              await conn.sendMessage(from, {
                video: { url: chunkFile },
                caption: frozenTheme.box("Movie Part", 
                  `Part ${i + 1} of *${selectedFilm.title} (${selectedFilm.year})*\nQuality: ${selectedLink.quality}\n\nDownload all parts to watch the full movie.`),
                ...frozenTheme.getForwardProps()
              }, { quoted: qualityMessage });

              // Clean up chunk file
              fs.unlinkSync(chunkFile);
            }

            await conn.sendMessage(from, { 
              react: { 
                text: frozenTheme.resultEmojis[Math.floor(Math.random() * frozenTheme.resultEmojis.length)], 
                key: qualityMessage.key 
              }
            });
          } catch (downloadError) {
            console.error("Download/Split Error:", downloadError);
            await conn.sendMessage(from, {
              text: frozenTheme.box("Download Error", 
                `Failed to process the download. Error: ${downloadError.message}\n\nPlease try the link manually:\n${selectedLink.url}`),
              ...frozenTheme.getForwardProps()
            }, { quoted: qualityMessage });
          }
        };

        conn.ev.on("messages.upsert", qualitySelectionHandler);

      } catch (error) {
        console.error("Download Error:", error);
        await conn.sendMessage(from, {
          text: frozenTheme.box("Download Error", 
            `Failed to get download links: ${error.message}\n\nYou can try downloading manually from: ${selectedFilm.link}`),
          ...frozenTheme.getForwardProps()
        }, { quoted: message });
      }
    };

    conn.ev.on("messages.upsert", filmSelectionHandler);

  } catch (error) {
    console.error("Error in film command:", error);
    const errorMsg = frozenTheme.box("Error", 
      `Sorry, an error occurred:\n\n${error.message || "Unknown error"}\n\nPlease try again later`);
    
    await reply(errorMsg);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
