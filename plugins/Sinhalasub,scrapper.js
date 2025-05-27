const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

// Helper function for fetchJson (assuming it's not defined in your framework)
async function fetchJson(url) {
  try {
    const response = await axios.get(url);
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
    desc: "Search and download videos from SinhalaSub",
    category: "movie",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
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
        return reply("🚩 You are not a premium user\nBuy via message to owner!!\nwa.me/94759874797");
      }

      // Validate query
      if (!q) return reply("🚩 *Please give me a movie name to search*");

      // Fetch movie search results
      const ress = await fetchJson(`https://apicinex.vercel.app/api/sinhalasub/movie/search?q=${encodeURIComponent(q)}`);

      // Check if results are empty
      if (!ress || ress.length < 1) {
        return await conn.sendMessage(
          from,
          { text: "🚩 *I couldn't find anything :(*" },
          { quoted: mek }
        );
      }

      // Prepare list message
      const msg = `乂 *M O V I E - S E A R C H*\n\n*Search Query*: ${q}\n\n*Select a movie from the list below:*`;
      const rows = ress.map((v, index) => ({
        title: `${v.title} (${v.year})`,
        rowId: `.ssmdl ${v.link}`,
      }));

      const listMessage = {
        text: msg,
        footer: config.MOVIE_FOOTER || "Powered by SinhalaSub",
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
      const result = await fetchJson(`https://apicinex.vercel.app/api/sinhalasub/movie/details?url=${encodeURIComponent(q)}`);

      // Prepare message
      const msg = `乂 *S I N H A L A S U B - D L*\n\n` +
                  `*◦ Title*: ${result.title}\n` +
                  `*◦ Date*: ${result.releaseDate}\n` +
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
          rowId: `.gss ${v.link}±${result.title}±${result.image}`,
        })),
      ];

      const listMessage = {
        image: { url: result.image || "https://i.ibb.co/0q34kPZ/image.png" },
        text: msg,
        footer: config.MOVIE_FOOTER || "Powered by SinhalaSub",
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
      const result = await fetchJson(`https://apicinex.vercel.app/api/sinhalasub/movie/details?url=${encodeURIComponent(q)}`);

      // Prepare message
      const info = `乂 *M O V I E - I N F O*\n\n` +
                   `*◦ Title*: ${result.title}\n` +
                   `*◦ Date*: ${result.releaseDate}\n` +
                   `*◦ Tagline*: ${result.tagline || "N/A"}\n` +
                   `*◦ Duration*: ${result.duration || "N/A"}\n` +
                   `*◦ IMDb Rating*: ${result.imdbRating || "N/A"}\n` +
                   `*◦ Genres*: ${result.genres ? result.genres.join(", ") : "N/A"}\n` +
                   `*◦ Rating*: ${result.ratingCount || "N/A"}\n\n` +
                   `${config.MOVIE_FOOTER || "Powered by SinhalaSub"}`;

      // Send detail card
      await conn.sendMessage(
        from,
        {
          image: { url: result.image || "https://i.ibb.co/0q34kPZ/image.png" },
          caption: info,
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
          caption: `${name}\n\n${config.MOVIE_FOOTER || "Powered by SinhalaSub"}`,
          jpegThumbnail: photo,
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
