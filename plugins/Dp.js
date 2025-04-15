const { cmd, commands } = require("../command");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

cmd(
  {
    pattern: "pf",
    alias: ["dp", "profilepic"],
    desc: "පරිශීලකයාගේ ප්‍රොෆයිල් පින්තූරය ලබාගන්න (අයෙත් නොමිතුරන් සඳහාද ක්‍රියා කරයි)",
    category: "utility",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, q, sender, isOwner, reply }
  ) => {
    try {
      const waitMsg = await reply("**⏳ โปรෆයිල් පින්තූරය ලබාගැනෙමින් පවතී...**");

      let userJid;
      let targetNumber;

      if (m.mentions && m.mentions.length > 0) {
        userJid = m.mentions[0];
        targetNumber = userJid.split('@')[0];
      } else if (q) {
        targetNumber = q.replace(/[^0-9]/g, '');
        if (targetNumber.length === 9) targetNumber = "94" + targetNumber;
        userJid = targetNumber + "@s.whatsapp.net";
      } else if (quoted) {
        userJid = quoted.sender;
        targetNumber = userJid.split('@')[0];
      } else {
        userJid = sender;
        targetNumber = userJid.split('@')[0];
      }

      const tempDir = path.join(__dirname, "../temp");
      const imagePath = path.join(tempDir, `profile_${Date.now()}.jpg`);
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const getPFP = async () => {
        const formats = [userJid, userJid.replace('@s.whatsapp.net', '@c.us'), targetNumber + '@g.us'];
        for (const jid of formats) {
          try {
            const ppUrl = await robin.profilePictureUrl(jid, "image", true);
            const res = await axios({ url: ppUrl, responseType: "arraybuffer" });
            fs.writeFileSync(imagePath, Buffer.from(res.data));
            return true;
          } catch {}
        }
        return false;
      };

      const success = await getPFP();

      if (success) {
        const sizeKB = (fs.statSync(imagePath).size / 1024).toFixed(2);
        await robin.sendMessage(from, {
          image: fs.readFileSync(imagePath),
          caption: `🖼️ *ප්‍රොෆයිල් පින්තූරය*\n\n👤 *නම:* @${targetNumber}\n📁 *ප්‍රමාණය:* ${sizeKB} KB`,
          mentions: [userJid]
        }, { quoted: mek });
        fs.unlinkSync(imagePath);
      } else {
        await reply("❌ පරිශීලකයාගේ ප්‍රොෆයිල් පින්තූරය ලබාගැනීමට නොහැකිවුණා.");
      }

    } catch (err) {
      console.log(err);
      await reply("⚠️ ඇන්ක්‍රියාවක් සිදු වියදී දෝෂයක් ඇතිවිය!");
    }
  }
);
