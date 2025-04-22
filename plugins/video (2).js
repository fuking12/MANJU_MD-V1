const { cmd } = require("../command");
const axios = require('axios');
const yts = require("yt-search");

const frozenTheme = {
  header: `🎶══════🎵══════🎶

𝙔𝙊𝙐𝙏𝙐𝘽𝙀 𝙑𝙄𝘿𝙀𝙊 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝙍

🎶══════🎵══════🎶`,
  
  box: function(title, content) {
    return `${this.header}\n\n✧･ﾟ: *${title}* :･ﾟ✧\n\n${content}`;
  },
  
  notifyBox: function(title, content) {
    return `💀✦ *${title}* ✦💀\n\n${content}`;
  },
  
  reactions: {
    processing: "💀",
    success: "✨",
    error: "❌",
    waiting: "⏳"
  }
};

function extractYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function getVideoDownloadLink(id) {
    const API_URL = `https://apis.davidcyriltech.my.id/download/ytmp4?url=https://youtube.com/watch?v=${id}`;
    
    try {
        const response = await axios.get(API_URL, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (response.data?.success && response.data.result?.download_url) {
            return {
                url: response.data.result.download_url,
                quality: response.data.result.quality || 'Unknown',
                title: response.data.result.title || 'YouTube Video',
                thumbnail: response.data.result.thumbnail || 'https://raw.githubusercontent.com/Manju362/Link-gamu./refs/heads/main/IMG-20250421-WA0482.jpg'
            };
        }
        return null;
    } catch (e) {
        console.error("API Error:", e);
        return null;
    }
}

cmd(
  {
    pattern: "video",
    react: "🎥",
    desc: "Download YouTube Video",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply(frozenTheme.box("USAGE GUIDE", 
        "💮 *Example:* .video funny cat video\n\n🎥 Search and download YouTube videos"));

      await robin.sendMessage(from, { react: { text: frozenTheme.reactions.processing, key: mek.key } });

      // Search for the video on YouTube
      const search = await yts(q);
      const data = search.videos[0];
      
      if (!data) {
        await robin.sendMessage(from, { react: { text: frozenTheme.reactions.error, key: mek.key } });
        return reply(frozenTheme.box("NO RESULTS", "💮 No videos found for your search"));
      }

      const url = data.url;
      const id = extractYouTubeID(url);
      
      if (!id) {
        await robin.sendMessage(from, { react: { text: frozenTheme.reactions.error, key: mek.key } });
        return reply(frozenTheme.box("INVALID URL", "💮 Could not extract video ID"));
      }

      // Check video duration (limit: 30 minutes)
      let durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts[0] * 60 + durationParts[1];

      if (totalSeconds > 1800) {
        await robin.sendMessage(from, { react: { text: frozenTheme.reactions.error, key: mek.key } });
        return reply(frozenTheme.box("DURATION LIMIT", "💮 Video exceeds 30 minute limit"));
      }

      // Get download link from API
      const videoInfo = await getVideoDownloadLink(id);
      
      if (!videoInfo || !videoInfo.url) {
        await robin.sendMessage(from, { react: { text: frozenTheme.reactions.error, key: mek.key } });
        return reply(frozenTheme.box("DOWNLOAD ERROR", "💮 Failed to get download link"));
      }

      // Video metadata description
      let desc = `${frozenTheme.header}\n\n`;
      desc += `✧･ﾟ: *VIDEO DETAILS* :･ﾟ✧\n\n`;
      desc += `🎬 *Title:* ${data.title}\n`;
      desc += `🕒 *Duration:* ${data.timestamp}\n`;
      desc += `📊 *Views:* ${data.views}\n`;
      desc += `📅 *Uploaded:* ${data.ago}\n`;
      desc += `⚙️ *Quality:* ${videoInfo.quality}\n\n`;
      desc += `🤖 *Downloading... Please wait*`;

      // Send metadata with thumbnail
      await robin.sendMessage(
        from,
        { 
          image: { url: videoInfo.thumbnail }, 
          caption: desc 
        },
        { quoted: mek }
      );

      // Send the video file
      await robin.sendMessage(
        from,
        {
          video: { url: videoInfo.url },
          mimetype: "video/mp4",
          caption: `${frozenTheme.header}\n\n💮 *${videoInfo.title}*\n\n📹 *Quality:* ${videoInfo.quality}\n\n✨ *Downloaded by Frozen Queen MD*`
        },
        { quoted: mek }
      );

      await robin.sendMessage(from, { react: { text: frozenTheme.reactions.success, key: mek.key } });

    } catch (e) {
      console.error("Error:", e);
      await robin.sendMessage(from, { react: { text: frozenTheme.reactions.error, key: mek.key } });
      reply(frozenTheme.box("ERROR", `💮 ${e.message || "An error occurred"}`));
    }
  }
);