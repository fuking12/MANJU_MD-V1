const { cmd } = require("../command"); 
const axios = require('axios');
const NodeCache = require('node-cache');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Cache initialization with 1 minute TTL
const searchCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// PATHUM RAJAPAKSHE THEME
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

// Function to extract links from API response
const extractLinks = (data) => {
  let links = [];

  if (Array.isArray(data)) {
    links = data;
  } else if (typeof data === 'object' && data !== null) {
    if (data.error || data.message) {
      throw new Error(`API Error: ${data.error || data.message}`);
    }
    // Adjusted for potential dark-yasiya-api.site response structures
    links = data.links || data.downloadLinks || data.data || data.urls || data.download || [];
    if (data.result) {
      if (Array.isArray(data.result)) {
        links = data.result;
      } else if (data.result.links) {
        links = data.result.links;
      } else if (data.result.data) {
        links = data.result.data.links || data.result.data.downloadLinks || data.result.data.dl_links || [];
      }
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

  // Filter and map links
  const filteredLinks = links.filter(link => 
    link && (link.url || link.link || link.download || link.direct_download || link.href || link.download_url)
  ).map(link => ({
    quality: link.quality || "Unknown Quality",
    size: link.size || "Unknown",
    url: link.url || link.link || link.download || link.direct_download || link.href || link.download_url
  }));

  if (filteredLinks.length === 0) {
    throw new Error("No valid download links found in the API response");
  }

  return filteredLinks;
};

// Function to download and split the video with improved validation
const downloadAndSplitVideo = async (url, outputDir, fileName) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const videoPath = path.join(outputDir, `${fileName}.mp4`);
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(videoPath);
        https.get(url, (response) => {
          console.log(`Downloading from ${url}, status: ${response.statusCode}`);
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
        setTimeout(() => reject(new Error('Download timeout')), 60000);
      });

      console.log(`Downloaded video to ${videoPath}`);
      const stats = fs.statSync(videoPath);
      if (stats.size < 1024 * 1024) {
        fs.unlinkSync(videoPath);
        throw new Error('Downloaded file is too small, likely invalid');
      }

      await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) {
            fs.unlinkSync(videoPath);
            return reject(new Error(`ffprobe error: ${err.message}`));
          }
          if (!metadata || !metadata.format || !metadata.format.duration) {
            fs.unlinkSync(videoPath);
            return reject(new Error('Invalid video file: No duration metadata'));
          }
          resolve();
        });
      });

      const chunkSize = 64 * 1024 * 1024;
      const duration = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) return reject(err);
          resolve(metadata.format.duration);
        });
      });
      const chunkDuration = (chunkSize / stats.size) * duration;
      const chunks = Math.ceil(stats.size / chunkSize);
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

      fs.unlinkSync(videoPath);
      return chunkFiles;
    } catch (error) {
      console.error(`Download/Split Error (Attempt ${retryCount + 1}):`, error.message);
      retryCount++;
      if (retryCount === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
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
    const cacheKey = `film_search_${q.toLowerCase()}`;
    let searchData = searchCache.get(cacheKey);

    if (!searchData) {
      const searchUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${encodeURIComponent(q)}`;
      let retries = 3;

      while (retries > 0) {
        try {
          console.log(`Attempting to fetch from ${searchUrl}...`);
          const searchResponse = await axios.get(searchUrl, { 
            timeout: 15000,
            headers: { 
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          searchData = searchResponse.data;
          console.log(`Search API Response from ${searchUrl}:`, JSON.stringify(searchData, null, 2));

          let results;
          if (Array.isArray(searchData)) {
            results = searchData;
          } else {
            results = searchData.results || searchData.data || searchData.movies || [];
          }

          if (!searchData || typeof searchData !== 'object' || !Array.isArray(results) || results.length === 0) {
            throw new Error("No movies found or invalid response structure");
          }

          searchData = { results };
          searchCache.set(cacheKey, searchData);
          break;
        } catch (error) {
          console.error(`Search API Error (${searchUrl}):`, error.response?.status || 'No status', error.message);
          retries--;
          if (retries === 0) {
            throw new Error("Failed to obtain information from the Film Treasury: " + (error.message || "Unknown error"));
          }
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    let filmList = `🎬 SinhalaSub Movie Results 🎬\n\n`;
    filmList += `🔍 Search: ${q}\n\n`;
    filmList += `📝 Reply with the number of the movie you want:\n\n`;

    const films = searchData.results.slice(0, 10).map((film, index) => ({
      number: index + 1,
      title: film.title || "Unknown Title",
      imdb: film.imdb || film.rating || "N/A",
      year: film.year || "Unknown",
      link: film.url || film.link || "",
      image: film.image || film.imageSrc || "https://i.ibb.co/5Yb4VZy/snowflake.jpg",
    }));

    films.forEach(film => {
      filmList += `${film.number}. ${film.title} (${film.year})\n`;
    });

    filmList += `\n*Powered by Pathum Rajapakshe Movie Hub*`;

    const sentMessage = await conn.sendMessage(from, {
      text: filmList,
      ...frozenTheme.getForwardProps()
    }, { quoted: m });

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

      console.log("Selected Film:", JSON.stringify(selectedFilm, null, 2));

      conn.ev.off("messages.upsert", filmSelectionHandler);

      try {
        const downloadUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${encodeURIComponent(selectedFilm.link)}`;
        console.log(`Fetching download links from ${downloadUrl} with link: ${selectedFilm.link}...`);
        const downloadResponse = await axios.get(downloadUrl, { 
          timeout: 15000,
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        let downloadData = downloadResponse.data;

        console.log(`Download API Response from ${downloadUrl}:`, JSON.stringify(downloadData, null, 2));

        const links = extractLinks(downloadData);

        const downloadLinks = links.map((link, index) => ({
          number: index + 1,
          quality: link.quality || "Unknown Quality",
          size: link.size || "Unknown",
          url: link.url
        }));

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

        const qualitySelectionHandler = async (updateQuality) => {
          const qualityMessage = updateQuality.messages[0];
          if (!qualityMessage?.message?.conversation && !qualityMessage?.message?.extendedTextMessage) return;

          const qualityReply = qualityMessage.message.conversation || qualityMessage.message.extendedTextMessage?.text?.trim();
          if (!qualityReply) return;

          if (qualityMessage.message.extendedTextMessage?.contextInfo?.stanzaId !== downloadMessage.key.id) return;

          const selectedQualityNumber = parseInt(qualityReply);
          const selectedLink = downloadLinks.find(link => link.number === selectedQualityNumber);

          if (!selectedLink || selectedQualityNumber > downloadLinks.length) {
            await conn.sendMessage(from, {
              text: frozenTheme.box("Invalid Quality", 
                "Please select a valid quality number"),
              ...frozenTheme.getForwardProps()
            }, { quoted: qualityMessage });
            return;
          }

          conn.ev.off("messages.upsert", qualitySelectionHandler);

          // Show only "Uploading..." message
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
            console.error("Download/Split Error:", downloadError.message);
            await conn.sendMessage(from, {
              text: frozenTheme.box("Download Error", 
                `Failed to process the download. Error: ${downloadError.message}`),
              ...frozenTheme.getForwardProps()
            }, { quoted: qualityMessage });
          }
        };

        conn.ev.on("messages.upsert", qualitySelectionHandler);

      } catch (error) {
        console.error("Download Error:", error.response?.status || 'No status', error.message);
        let errorMessage = "Failed to get download links: " + error.message;
        if (error.response?.status === 403) {
          errorMessage = `Access denied (403 Forbidden). This might be due to an IP restriction. Please try running the bot on a different host (e.g., katabump) or request IP whitelisting from the API provider.`;
        } else if (error.response?.status === 404) {
          errorMessage = `The movie *${selectedFilm.title} (${selectedFilm.year})* is no longer available on the server.\nPlease try a different movie or check the link: ${selectedFilm.link}`;
        }
        await conn.sendMessage(from, {
          text: frozenTheme.box("Download Error", errorMessage),
          ...frozenTheme.getForwardProps()
        }, { quoted: message });
      }
    };

    conn.ev.on("messages.upsert", filmSelectionHandler);

  } catch (error) {
    console.error("Error in film command:", error.response?.status || 'No status', error.message);
    let errorMsg = `Sorry, an error occurred:\n\n${error.message || "Unknown error"}\n\nPlease try again later`;
    if (error.response?.status === 403) {
      errorMsg = `Access denied (403 Forbidden). This might be due to an IP restriction. Please try running the bot on a different host (e.g., katabump) or request IP whitelisting from the API provider.`;
    }
    await reply(frozenTheme.box("Error", errorMsg));
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
