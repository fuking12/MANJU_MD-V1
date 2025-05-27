const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

// Dummy implementation of getban (replace with your actual database logic)
async function getban(chatId) {
  try {
    // Simulate a database check for banned chats
    const bannedChats = ['1234567890@g.us', '9876543210@g.us']; // Replace with actual banned chat IDs
    return bannedChats.includes(chatId);
  } catch (error) {
    console.error("Error in getban:", error);
    return false; // Default to not banned if error occurs
  }
}

// Dummy implementation of getcinep (replace with your actual premium user check)
async function getcinep(userId) {
  try {
    // Simulate a database check for premium users
    const premiumUsers = ['user1@whatsapp.com', 'user2@whatsapp.com']; // Replace with actual premium user IDs
    return premiumUsers.includes(userId);
  } catch (error) {
    console.error("Error in getcinep:", error);
    return false; // Default to non-premium if error occurs
  }
}

// Dummy implementation of getcinefree (replace with your actual free access check)
async function getcinefree() {
  try {
    // Simulate a check for free access (e.g., during a promotional period)
    return false; // Set to true if free access is enabled
  } catch (error) {
    console.error("Error in getcinefree:", error);
    return false; // Default to no free access if error occurs
  }
}

// Simple implementation of minimize (optimizes text by removing extra spaces)
async function minimize(text) {
  try {
    return text.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error("Error in minimize:", error);
    return text; // Return original text if error occurs
  }
}

// Helper function for fetchJson with error handling
async function fetchJson(url) {
  try {
    const response = await axios.get(url, { timeout: 10000 }); // 10-second timeout
    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch JSON: ${error.message}`);
  }
}

// SinhalaSub Movie Search Command
cmd(
  {
    pattern: "sinhalasub",
    alias: ["movie", "film", "cine", "cs", "ss", "cinesubz"],
    use: ".sinhalasub <movie name>",
    react: "🍟",
    desc: "Search and download movies from SinhalaSub",
    category: "movie",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, sender, reply }) => {
    try {
      // Check if chat is banned
      const ismvban = await getban(from);
      if (ismvban) {
        return reply("➟ *This Chat Has Been banned from using Movie Commands...*\n\n*_Please contact owner to UnBan_* 👨‍🔧");
      }

      // Check premium or free user status
      const isPremium = await getcinep(sender);
      const isFree = await getcinefree();
      if (!isPremium && !isFree) {
        return reply("🚩 You are not a premium user\nBuy via message to owner!!\nwa.me/94766863255");
      }

      // Validate query
      if (!q) return reply("🚩 *Please give me a movie name to search*");

      // Fetch movie search results
      const ress = await fetchJson(`https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${encodeURIComponent(q)}`);

      // Check if results are empty
      if (!ress || !ress.results || ress.results.length < 1) {
        return await conn.sendMessage(
          from,
          { text: "🚩 *I couldn't find anything :(*" },
          { quoted: mek }
        );
      }

      // Prepare list message
      const msg = `乂 *M O V I E - S E A R C H*\n\n*Search Query*: ${q}\n\n*Select a movie from the list below:*`;
      const rows = ress.results.map((v) => ({
        title: `${v.title} (${v.year})`,
        rowId: `.ssmdl ${v.url}`,
      }));

      const listMessage = {
        text: msg,
        title: "Select a Movie",
        buttonText: "🔢 Select Movie",
        sections: [
          {
            title: "Movies from sinhalasub.lk",
            rows: rows,
          },
        ],
      };

      // Send list message
      await conn.sendMessage(from, listMessage, { quoted: mek });
      await conn.sendMessage(from, { react: { text: "🍟", key: mek.key } });
    } catch (e) {
      console.error("Error:", e);
      await reply(`🚩 *Error: ${e.message || "Something went wrong!"}*`);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
  }
);

// Movie Details and Download Links Command
cmd(
  {
    pattern: "ssmdl",
    dontAddCommandList: true,
    react: "🍟",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      // Check if chat is banned
      const ismvban = await getban(from);
      if (ismvban) {
        return reply("➟ *This Chat Has Been banned from using Movie Commands...*\n\n*_Please contact owner to UnBan_* 👨‍🔧");
      }

      // Validate URL
      if (!q) return reply("🚩 *Please provide a movie URL*");

      // Fetch movie details
      const result = await fetchJson(`https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${encodeURIComponent(q)}`);

      // Prepare message
      const msg = `乂 *S I N H A L A S U B - D L*\n\n` +
                  `*◦ Title*: ${result.title || "N/A"}\n` +
                  `*◦ Date*: ${result.releaseDate || "N/A"}\n` +
                  `*◦ Tagline*: ${result.tagline || "N/A"}\n` +
                  `*◦ Duration*: ${result.duration || "N/A"}\n` +
                  `*◦ IMDb Rating*: ${result.imdbRating || "N/A"}\n` +
                  `*◦ Genres*: ${result.genres ? result.genres.join(", ") : "N/A"}\n` +
                  `*◦ Rating*: ${result.ratingCount || "N/A"}\n\n` +
                  `*Select a download option below:*`;

      // Prepare rows for download options
      const rows = [
        {
          title: "View Detail Card",
          rowId: `.ssde ${q}`,
        },
        ...result.downloadLinks.map((v) => ({
          title: `${v.server} - ${v.quality} (${v.size})`,
          rowId: `.gss ${v.link}±${result.title || "Movie"}±${result.image || "https://i.ibb.co/0q34kPZ/image.png"}`,
        })),
      ];

      const listMessage = {
        image: { url: result.image || "https://i.ibb.co/0q34kPZ/image.png" },
        text: msg,
        title: "Movie Download Options",
        buttonText: "🔢 Select Option",
        sections: [
          {
            title: "sinhalasub.lk",
            rows: rows,
          },
        ],
      };

      // Send list message
      await conn.sendMessage(from, listMessage, { quoted: mek });
      await conn.sendMessage(from, { react: { text: "🍟", key: mek.key } });
    } catch (e) {
      console.error("Error:", e);
      await reply(`🚩 *Error: ${e.message || "Failed to fetch movie details"}*`);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
  }
);

// Movie Details Card Command
cmd(
  {
    pattern: "ssde",
    dontAddCommandList: true,
    react: "🍎",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      // Check if chat is banned
      const ismvban = await getban(from);
      if (ismvban) {
        return reply("➟ *This Chat Has Been banned from using Movie Commands...*\n\n*_Please contact owner to UnBan_* 👨‍🔧");
      }

      // Validate URL
      if (!q) return reply("🚩 *Please provide a movie URL*");

      // Fetch movie details
      const result = await fetchJson(`https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${encodeURIComponent(q)}`);

      // Prepare message
      const info = `乂 *M O V I E - I N F O*\n\n` +
                   `*◦ Title*: ${result.title || "N/A"}\n` +
                   `*◦ Date*: ${result.releaseDate || "N/A"}\n` +
                   `*◦ Tagline*: ${result.tagline || "N/A"}\n` +
                   `*◦ Duration*: ${result.duration || "N/A"}\n` +
                   `*◦ IMDb Rating*: ${result.imdbRating || "N/A"}\n` +
                   `*◦ Genres*: ${result.genres ? result.genres.join(", ") : "N/A"}\n` +
                   `*◦ Rating*: ${result.ratingCount || "N/A"}`;

      // Minimize text
      const minimizedInfo = await minimize(info);

      // Send detail card
      await conn.sendMessage(
        from,
        {
          image: { url: result.image || "https://i.ibb.co/0q34kPZ/image.png" },
          caption: minimizedInfo,
        },
        { quoted: mek }
      );
      await conn.sendMessage(from, { react: { text: "🍎", key: mek.key } });
    } catch (e) {
      console.error("Error:", e);
      await reply(`🚩 *Error: ${e.message || "Failed to fetch movie details"}*`);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
  }
);

// Download Movie Command
cmd(
  {
    pattern: "gss",
    react: "🍟",
    dontAddCommandList: true,
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      // Check if chat is banned
      const ismvban = await getban(from);
      if (ismvban) {
        return reply("➟ *This Chat Has Been banned from using Movie Commands...*\n\n*_Please contact owner to UnBan_* 👨‍🔧");
      }

      // Validate query
      if (!q) return reply("🚩 *Please provide a download link*");

      // Parse query
      const [link, namee, image] = q.split("±");
      const name = namee ? namee.replace(/\s+/g, "_") : "Movie_" + Date.now();
      const photo = image || "https://i.ibb.co/0q34kPZ/image.png";

      // Fetch download page
      const response = await axios.get(link, { responseType: "text" });
      const $ = cheerio.load(response.data);
      let dllink = $("#link").attr("href");

      if (!dllink) {
        return reply("🚩 *Failed to extract download link*");
      }

      // Handle PixelDrain links
      if (dllink.includes("https://pixeldrain.com/")) {
        dllink = dllink.replace("/u/", "/api/file/");
      }

      // Download and send file
      const resp = await axios.get(dllink, { responseType: "arraybuffer" });
      const mediaBuffer = Buffer.from(resp.data, "binary");

      await conn.sendMessage(
        from,
        {
          document: mediaBuffer,
          mimetype: "video/mp4",
          fileName: `${name}.mp4`,
          caption: `${name}`,
          thumbnail: photo,
        },
        { quoted: mek }
      );

      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
      console.error("Error:", e);
      await reply(`🚩 *Error: ${e.message || "Unable to generate download"}*`);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
  }
);
