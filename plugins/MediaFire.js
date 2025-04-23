const { cmd } = require("../command");
const axios = require('axios');

// Simplified Frozen Queen Theme
const frozenTheme = {
  header: `Mᴀɴᴊᴜ_MD🔰\n✧ Mᴀɴᴊᴜ_MD Mᴇᴅɪᴀғɪʀᴇ Dᴏᴡɴʟᴏᴀᴅᴇʀ.. ✧\n`,
  box: function(title, content) {
    return `${this.header} ${title} ❅\n${content}\n\n⚕️Pᴏᴡᴇʀᴅ Bʏ Pᴀᴛʜᴜᴍ Rᴀᴊᴀᴘᴀᴋsʜᴇ`;
  },
  getForwardProps: function() {
    return {
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        stanzaId: "BAE5" + Math.random().toString(16).substr(2, 12).toUpperCase(),
      }
    };
  },
  emojis: ["↗️", "🧊", "↪️", "📄", "✧"]
};

// MediaFire download command
cmd({
  pattern: "mfire",
  react: "🌺",
  desc: "Download MediaFire files with Frozen Queen's magic",
  category: "ice kingdom",
  filename: __filename,
}, async (conn, mek, m, { from, q, reply }) => {
  // Validate MediaFire URL
  if (!q || !q.match(/^https:\/\/www\.mediafire\.com\/file\//)) {
    return reply(frozenTheme.box("Royal Order", 
      `${frozenTheme.emojis[0]} Usage: .mfire <mediafire_url>\n${frozenTheme.emojis[4]} Example: .mfire https://www.mediafire.com/file/yce2h1da3kqzh27/WhatsApp+Installer.exe/file`));
  }

  try {
    // Step 1: Fetch download link from API with retries
    const apiUrl = `https://vajira-api-seven.vercel.app/download/mfire?url=${encodeURIComponent(q)}`;
    let downloadData;
    let retries = 3;

    while (retries > 0) {
      try {
        const response = await axios.get(apiUrl, { timeout: 5000 });
        downloadData = response.data;
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error("API Error:", error.message, error.response?.data);
          throw new Error("Failed to connect to the Ice Vaults");
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Step 2: Validate API response
    if (!downloadData || typeof downloadData !== 'object') {
      console.error("Invalid API Response:", downloadData);
      throw new Error("Ice Vaults returned an invalid response");
    }
    if (!downloadData.status || !downloadData.result || !downloadData.result.dl_link) {
      console.error("API Response Missing Data:", downloadData);
      throw new Error("No downloadable treasure found in the Ice Vaults");
    }

    // Step 3: Extract file info with fallbacks
    const fileInfo = {
      name: downloadData.result.fileName || q.split('/').pop()?.split('?')[0] || "Unknown File",
      size: downloadData.result.size || "Unknown Size",
      link: downloadData.result.dl_link,
      mimeType: downloadData.result.fileType || "application/octet-stream"
    };

    // Step 4: Parse file size
    let sizeInGB = 0;
    const sizeStr = fileInfo.size.toLowerCase();
    if (sizeStr.includes("gb")) sizeInGB = parseFloat(sizeStr.replace("gb", "").trim());
    else if (sizeStr.includes("mb")) sizeInGB = parseFloat(sizeStr.replace("mb", "").trim()) / 1024;
    else if (sizeStr.includes("kb")) sizeInGB = parseFloat(sizeStr.replace("kb", "").trim()) / (1024 * 1024);
    else if (sizeStr === "unknown size") sizeInGB = 0;

    // Step 5: Check file size
    if (sizeInGB > 2) {
      await conn.sendMessage(from, {
        text: frozenTheme.box("Dᴀʀᴋ Wᴀʀɴɪɴɢ", 
          `${frozenTheme.emojis[0]} Too large (${fileInfo.size})!\n${frozenTheme.emojis[4]} Download: ${fileInfo.link}`),
        ...frozenTheme.getForwardProps()
      }, { quoted: mek });
      return;
    }

    // Step 6: Send file as document
    await conn.sendMessage(from, {
      document: { url: fileInfo.link },
      mimetype: fileInfo.mimeType,
      fileName: fileInfo.name,
      caption: frozenTheme.box("Dᴀʀᴋ Wᴀʀɴɪɴɢ", 
        `${frozenTheme.emojis[3]} ${fileInfo.name}\n${frozenTheme.emojis[2]} Size: ${fileInfo.size}\n${frozenTheme.emojis[4]} Your treasure awaits!`),
      ...frozenTheme.getForwardProps()
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: frozenTheme.emojis[0], key: mek.key } });

  } catch (e) {
    console.error("Error:", e.message, e.stack);
    await reply(frozenTheme.box("Dᴀʀᴋ Sᴛᴏʀᴍ", 
      `${frozenTheme.emojis[0]} Error: ${e.message || "Vault disrupted by Dᴀʀᴋ Harpies"}\n${frozenTheme.emojis[4]} Try again later`));
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
