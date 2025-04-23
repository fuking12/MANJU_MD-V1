const { cmd } = require("../command");

// ======================

// FROZEN QUEEN THEME

// ======================

const frozenTheme = {

  header: `╭────༺🍑༻────╮\n   ༺ MANJU_MD ༻\n   ༺❅ THE ROYAL FUKING KINGDOM ❅༻\n╰────༺🍑༻────╯\n`,

  box: function(title, content) {

    return `${this.header}╔══════ஓ๑🍑๑ஓ══════╗\n     ✧･ﾟ: ${title} :･ﾟ✧\n╚══════ஓ๑🍑๑ஓ══════╝\n\n${content}\n\n┈┈┈┈┈┈༻❄️༺┈┈┈┈┈┈\n✧･ﾟ: THE COLD NEVER BOTHERED ME ANYWAY :･ﾟ✧`;

  },

  getForwardProps: function() {

    return {

      contextInfo: {

        forwardingScore: 999,

        isForwarded: true,

        forwarderJid: "120363390966594137@newsletter",

        forwardedNewsletterMessageInfo: {

          newsletterJid: "120363390966594137@newsletter",

          newsletterName: "MANJU_MD OFFICIAL",

          newsletterLink: "https://chat.whatsapp.com/Lo2XAYfYr3KGV4bo866AXN",

          newsletterSenderId: "MANJU_MD",

          serverMessageId: Math.floor(Math.random() * 1000000000) + 1000000000,

          contentType: 1

        },

        participant: "120363390966594137@newsletter",

        stanzaId: "BAE5" + Math.random().toString(16).substr(2, 12).toUpperCase(),

        mentionedJid: [],

        conversionData: {

          conversionDelaySeconds: 0,

          conversionSource: "newsletter_channel",

          conversionType: "newsletter"

        }

      }

    };

  },

   resultEmojis: ["🔞", "🔞", "🔞", "🔞", "🔞", "🔞", "🔞", "🔞", "🔞", "🔞"]

};

// Store search results for each user

let searchState = {};

cmd(

  {

    pattern: "xnx",

    react: "🔞",

    desc: "Search and Download XNXX Video (use .xnx search [keyword], then reply with number)",

    category: "download",

    filename: __filename,

  },

  async (robin, mek, m, { from, q, reply, pushname }) => {

    try {

      if (!q) return reply(frozenTheme.box("ICE GUIDE", 

        "┊ 🔞 Usage: .xnx search [keyword]\n┊ 🔞 Example: .xnx search pussy\n┊ 🔞 Returns: Adult videos from XNXX"));

      const isSearch = q.toLowerCase().startsWith("search");

      

      if (isSearch) {

        const query = q.split(" ").slice(1).join(" ").trim();

        if (!query) return reply(frozenTheme.box("ICE WARNING", 

          "┊ 🔞 Please provide a search keyword\n┊ 🔞 Example: .xnx search pussy"));

        // Use the search API

        const SEARCH_API_URL = `https://apis.davidcyriltech.my.id/search/xnxx?query=${encodeURIComponent(query)}`;

        

        console.log("Search API Request:", SEARCH_API_URL);

        

        const searchResponse = await fetch(SEARCH_API_URL);

        const searchResult = await searchResponse.json();

        

        console.log("Search API Response:", searchResult);

        // Check if search was successful

        if (!searchResult || !searchResult.status || !Array.isArray(searchResult.results) || searchResult.results.length === 0) {

          return reply(frozenTheme.box("FROZEN STORM", `┊ 🔞 No results found for: ${query}`));

        }

        // Format the results for display (up to 10)

        const searchResults = searchResult.results.slice(0, 10).map((item, index) => ({

          number: index + 1,

          title: item.title || `Result ${index + 1}`,

          info: item.info || "No info",

          url: item.link || ""

        }));

        // Store search results for this user

        searchState[from] = searchResults;

        // Create a detailed message with all results

        let resultDetails = `╭────༺🔞༻────╮\n`;

        resultDetails += `   ADULT CONTENT FOUND\n`;

        resultDetails += `╰────༺🔞༻────╯\n\n`;

        searchResults.forEach((result, i) => {

          const emoji = frozenTheme.resultEmojis[i % frozenTheme.resultEmojis.length];

          resultDetails += `${emoji} *${result.number}.* ${result.title}\n`;

          resultDetails += `   ┊ Info: ${result.info}\n\n`;

        });

        

        resultDetails += `*Reply with a number (1-${searchResults.length}) to download*\n\n`;

        resultDetails += `> FROZEN-QUEEN BY MR.Chathura`;

        // Send the results message

        const sentMessage = await robin.sendMessage(from, {

          text: frozenTheme.box("XNXX RESULTS", resultDetails),

          ...frozenTheme.getForwardProps()

        }, { quoted: mek });

        // Listen for user's choice - same method as in song.js

        robin.ev.on("messages.upsert", async (update) => {

          const message = update.messages[0];

          if (!message || !message.message || !message.message.extendedTextMessage) return;

          const userReply = message.message.extendedTextMessage.text.trim();

          

          // Check if this is a reply to our results message

          if (message.message.extendedTextMessage.contextInfo?.stanzaId === sentMessage.key.id) {

            const selectedNumber = parseInt(userReply);

            

            if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > searchResults.length) {

              reply(frozenTheme.box("ICE WARNING", 

                `┊ 🔞 Invalid number selection!\n┊ 🔞 Please choose 1-${searchResults.length}\n┊ 🔞 The snowgies are confused`));

              return;

            }

            

            // Get the selected result

            const selectedResult = searchState[from][selectedNumber - 1];

            if (!selectedResult || !selectedResult.url) {

              reply(frozenTheme.box("FROZEN STORM", "┊ 🔞 Selected result not found or invalid"));

              return;

            }

            

            await reply(frozenTheme.box("DOWNLOAD STARTED", 

              `┊ 🔞 *Title:* ${selectedResult.title}\n┊ 🔞 *Info:* ${selectedResult.info}\n┊ 🔞 Preparing your download...`));

            

            // Download the selected video

            const encodedUrl = encodeURIComponent(selectedResult.url);

            const DOWNLOAD_API_URL = `https://apis.davidcyriltech.my.id/download/xnxx?url=${encodedUrl}`;

            

            console.log("Download API Request:", DOWNLOAD_API_URL);

            

            const downloadResponse = await fetch(DOWNLOAD_API_URL);

            const downloadResult = await downloadResponse.json();

            

            console.log("Download API Response:", downloadResult);

            

            if (!downloadResult || !downloadResult.status || !downloadResult.result || !downloadResult.result.download) {

              reply(frozenTheme.box("FROZEN STORM", 

                `┊ 🔞 Error: ${downloadResult?.message || "Could not download video"}\n┊ 🔞 The ice spirits are disturbed`));

              return;

            }

            

            const videoUrl = downloadResult.result.download.high_quality || downloadResult.result.download.low_quality;

            const title = downloadResult.result.title || selectedResult.title;

            const info = downloadResult.result.info || selectedResult.info;

            const thumbnail = downloadResult.result.thumbnail || "";

            

            // Split info to get duration and quality

            const duration = info?.split("-")[0]?.trim() || "Unknown";

            const size = info?.split("-")[1]?.trim() || "Unknown";

            

            // Send thumbnail with information

            await robin.sendMessage(from, {

              image: { url: thumbnail },

              caption: frozenTheme.box("ADULT CONTENT", 

                `┊ 🔞 *Title:* ${title}\n┊ 🔞 *Duration:* ${duration}\n┊ 🔞 *Quality:* ${size}\n┊ 🔞 Downloading now...`),

              ...frozenTheme.getForwardProps()

            }, { quoted: mek });

            

            // Send the actual video

            await robin.sendMessage(from, {

              video: { url: videoUrl },

              caption: frozenTheme.box("DOWNLOAD COMPLETE", 

                `┊ 🔞 *Title:* ${title}\n┊ 🔞 *Duration:* ${duration}\n┊ 🔞 *Quality:* ${size}`),

              mimetype: "video/mp4",

              ...frozenTheme.getForwardProps()

            }, { quoted: mek });

            

            // Clear this user's search state

            delete searchState[from];

          }

        });

        

      } else if (q.includes("xnxx.com/video")) {

        // Direct URL download

        const encodedUrl = encodeURIComponent(q);

        const API_URL = `https://apis.davidcyriltech.my.id/download/xnxx?url=${encodedUrl}`;

        

        console.log("API Request:", API_URL);

        

        const response = await fetch(API_URL);

        const result = await response.json();

        

        console.log("API Response:", result);

        

        if (!result || !result.status || !result.result || !result.result.download) {

          return reply(frozenTheme.box("FROZEN STORM", 

            `┊ 🔞 Error: ${result?.message || "Could not download video"}\n┊ 🔞 The URL might be invalid`));

        }

        

        const videoUrl = result.result.download.high_quality || result.result.download.low_quality;

        const title = result.result.title || "XNXX Video";

        const info = result.result.info || "";

        const thumbnail = result.result.thumbnail || "";

        

        // Split info to get duration and quality

        const duration = info?.split("-")[0]?.trim() || "Unknown";

        const size = info?.split("-")[1]?.trim() || "Unknown";

        

        // Send thumbnail with information

        await robin.sendMessage(from, {

          image: { url: thumbnail },

          caption: frozenTheme.box("ADULT CONTENT", 

            `┊ 🔞 *Title:* ${title}\n┊ 🔞 *Duration:* ${duration}\n┊ 🔞 *Quality:* ${size}\n┊ 🔞 Downloading now...`),

          ...frozenTheme.getForwardProps()

        }, { quoted: mek });

        

        // Send the actual video

        await robin.sendMessage(from, {

          video: { url: videoUrl },

          caption: frozenTheme.box("DOWNLOAD COMPLETE", 

            `┊ 🔞 *Title:* ${title}\n┊ 🔞 *Duration:* ${duration}\n┊ 🔞 *Quality:* ${size}`),

          mimetype: "video/mp4",

          ...frozenTheme.getForwardProps()

        }, { quoted: mek });

        

      } else {

        // Check if it's a number reply without 'search' prefix

        const selectedNumber = parseInt(q);

        

        if (!isNaN(selectedNumber) && searchState[from] && selectedNumber >= 1 && selectedNumber <= searchState[from].length) {

          // User directly entered a number and has search results stored

          const selectedResult = searchState[from][selectedNumber - 1];

          

          await reply(frozenTheme.box("DOWNLOAD STARTED", 

            `┊ 🔞 *Title:* ${selectedResult.title}\n┊ 🔞 *Info:* ${selectedResult.info}\n┊ 🔞 Preparing your download...`));

          

          // Download the selected video

          const encodedUrl = encodeURIComponent(selectedResult.url);

          const DOWNLOAD_API_URL = `https://apis.davidcyriltech.my.id/download/xnxx?url=${encodedUrl}`;

          

          console.log("Download API Request:", DOWNLOAD_API_URL);

          

          const downloadResponse = await fetch(DOWNLOAD_API_URL);

          const downloadResult = await downloadResponse.json();

          

          console.log("Download API Response:", downloadResult);

          

          if (!downloadResult || !downloadResult.status || !downloadResult.result || !downloadResult.result.download) {

            return reply(frozenTheme.box("FROZEN STORM", 

              `┊ 🔞 Error: ${downloadResult?.message || "Could not download video"}\n┊ 🔞 The ice spirits are disturbed`));

          }

          

          const videoUrl = downloadResult.result.download.high_quality || downloadResult.result.download.low_quality;

          const title = downloadResult.result.title || selectedResult.title;

          const info = downloadResult.result.info || selectedResult.info;

          const thumbnail = downloadResult.result.thumbnail || "";

          

          // Split info to get duration and quality

          const duration = info?.split("-")[0]?.trim() || "Unknown";

          const size = info?.split("-")[1]?.trim() || "Unknown";

          

          // Send thumbnail with information

          await robin.sendMessage(from, {

            image: { url: thumbnail },

            caption: frozenTheme.box("ADULT CONTENT", 

              `┊ 🔞 *Title:* ${title}\n┊ 🔞 *Duration:* ${duration}\n┊ 🔞 *Quality:* ${size}\n┊ 🔞 Downloading now...`),

            ...frozenTheme.getForwardProps()

          }, { quoted: mek });

          

          // Send the actual video

          await robin.sendMessage(from, {

            video: { url: videoUrl },

            caption: frozenTheme.box("DOWNLOAD COMPLETE", 

              `┊ 🔞 *Title:* ${title}\n┊ 🔞 *Duration:* ${duration}\n┊ 🔞 *Quality:* ${size}`),

            mimetype: "video/mp4",

            ...frozenTheme.getForwardProps()

          }, { quoted: mek });

          

          // Clear this user's search state

          delete searchState[from];

        } else {

          // Invalid command format

          return reply(frozenTheme.box("ICE GUIDE", 

            "┊ 🔞 Usage: .xnx search [keyword]\n┊ 🔞 Example: .xnx search pussy\n┊ 🔞 Or: .xnx [xnxx-url]"));

        }

      }

    } catch (e) {

      console.error("Error in XNXX Command:", e);

      reply(frozenTheme.box("FROZEN STORM", 

        `┊ 🔞 Error: ${e.message || "Something went wrong"}\n┊ 🔞 The ice magic failed this time`));

      delete searchState[from]; // Clear state on error

    }

  }

);