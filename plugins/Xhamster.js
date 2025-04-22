const { cmd } = require("../command");

// ======================
// FROZEN QUEEN THEME
// ======================
const frozenTheme = {
  header: `╭────༺❄️༻────╮\n   ༺ FROZEN-QUEEN-MD ༻\n   ༺❅ THE ROYAL ICE KINGDOM ❅༻\n╰────༺❄️༻────╯\n`,
  box: function(title, content) {
    return `${this.header}╔══════ஓ๑❄️๑ஓ══════╗\n     ✧･ﾟ: ${title} :･ﾟ✧\n╚══════ஓ๑❄️๑ஓ══════╝\n\n${content}\n\n┈┈┈┈┈┈༻❄️༺┈┈┈┈┈┈\n✧･ﾟ: THE COLD NEVER BOTHERED ME ANYWAY :･ﾟ✧`;
  },
  getForwardProps: function() {
    return {
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwarderJid: "120363417181891566@newsletter",
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363417181891566@newsletter",
          newsletterName: "FROZEN-QUEEN OFFICIAL",
          newsletterLink: "https://whatsapp.com/channel/0029Vb6HQGHAojYtcbJg5z1Z",
          newsletterSenderId: "FROZEN-QUEEN-MD",
          serverMessageId: Math.floor(Math.random() * 1000000000) + 1000000000,
          contentType: 1
        },
        participant: "120363417181891566@newsletter",
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

// XHamster video download command
cmd(
  {
    pattern: "xhamster",
    react: "🔞",
    desc: "Download XHamster Video (use .xhamster [xhamster-url])",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply, pushname }) => {
    try {
      if (!q) {
        return reply(frozenTheme.box("ICE GUIDE",
          "┊ 🔞 Usage: .xhamster [xhamster-url]\n┊ 🔞 Example: .xhamster https://xhamster.com/videos/ava-addams-uses-her-massive-milf-tits-on-dick-10164473\n┊ 🔞 Returns: Adult video from XHamster"));
      }

      // Check if the query is a valid XHamster URL
      if (!q.includes("xhamster.com/videos")) {
        return reply(frozenTheme.box("ICE WARNING",
          "┊ 🔞 Invalid URL!\n┊ 🔞 Please provide a valid XHamster video URL\n┊ 🔞 Example: .xhamster https://xhamster.com/videos/ava-addams-uses-her-massive-milf-tits-on-dick-10164473"));
      }

      // Direct URL download
      const encodedUrl = encodeURIComponent(q);
      const API_URL = `https://vajira-api-seven.vercel.app/download/xhamster?url=${encodedUrl}`;

      console.log("API Request:", API_URL);

      const response = await fetch(API_URL);
      
      // Check HTTP status code
      if (!response.ok) {
        const errorText = await response.text();
        console.log("API Error Response (Text):", errorText);
        return reply(frozenTheme.box("FROZEN STORM",
          `┊ 🔞 Error: API request failed (Status: ${response.status})\n┊ 🔞 Message: ${errorText || "Unknown error"}\n┊ 🔞 The API might be down or rate-limited`));
      }

      // Try to parse the response as JSON
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        const responseText = await response.text();
        console.log("API Response (Text):", responseText);
        throw new Error(`Failed to parse API response as JSON: ${responseText}`);
      }

      console.log("API Response:", result);
      // Log the video array to see its content
      if (result.result && result.result.video) {
        console.log("Video Array Content:", result.result.video);
      }

      if (!result || !result.status || !result.result) {
        return reply(frozenTheme.box("FROZEN STORM",
          `┊ 🔞 Error: ${result?.message || "Could not download video"}\n┊ 🔞 The URL might be invalid`));
      }

      // Check if video array exists and has content
      if (!result.result.video || !Array.isArray(result.result.video) || result.result.video.length === 0) {
        return reply(frozenTheme.box("FROZEN STORM",
          `┊ 🔞 Error: No download links found\n┊ 🔞 The video might not be available`));
      }

      // Try to find a valid video URL from the video array
      let videoUrl = null;
      let quality = "Unknown";
      for (const videoOption of result.result.video) {
        if (videoOption.url) {
          videoUrl = videoOption.url;
          quality = videoOption.quality || "Unknown";
          break;
        }
      }

      if (!videoUrl) {
        return reply(frozenTheme.box("FROZEN STORM",
          `┊ 🔞 Error: No valid download links found in video array\n┊ 🔞 The video might not be available`));
      }

      const title = result.result.title || "XHamster Video";
      const info = result.result.desc || "";
      const thumbnail = result.result.thumbnail || "";

      // Split info to get duration and quality (if available in description)
      const duration = info?.split("-")[0]?.trim() || "Unknown";
      const size = quality;

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

    } catch (e) {
      console.error("Error in XHamster Command:", e.message);
      reply(frozenTheme.box("FROZEN STORM",
        `┊ 🔞 Error: ${e.message || "Something went wrong"}\n┊ 🔞 The ice magic failed this time`));
    }
  }
);
