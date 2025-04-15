const { jidDecode } = require("baileys");
const fs = require("fs");
const config = require("../config");

module.exports = {
  name: "mode",
  alias: ["setmode"],
  desc: "Set bot mode: public, private, or group-only",
  category: "Owner",
  usage: ".mode public / private / group",
  react: "⚙️",
  owner: true,
  async exec(sock, m, args) {
    try {
      const jid = m.key.participant || m.key.remoteJid;
      const decode = jidDecode(jid) || {};
      const sender = decode.user || jid.split("@")[0];

      if (!args[0]) {
        return m.reply(
          `🔁 *Current Mode:* ${config.MODE.toUpperCase()}\n\n` +
          `Set mode using:\n` +
          `> .mode public\n` +
          `> .mode private\n` +
          `> .mode group`
        );
      }

      const mode = args[0].toLowerCase();
      if (!["public", "private", "group"].includes(mode)) {
        return m.reply("❌ Invalid mode! Use: public / private / group");
      }

      // update config.js file
      const configPath = require.resolve("../config");
      let content = fs.readFileSync(configPath, "utf8");
      const newContent = content.replace(
        /MODE:.*?["'](.*?)["']/,
        `MODE: "${mode}"`
      );
      fs.writeFileSync(configPath, newContent);

      m.reply(`✅ Bot mode updated to *${mode.toUpperCase()}* successfully!`);
    } catch (e) {
      console.error("Mode command error:", e);
      m.reply("⚠️ Error occurred while updating mode.");
    }
  },
};
