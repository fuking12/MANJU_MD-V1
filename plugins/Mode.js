const fs = require("fs");
const { addCommand } = require("../lib/command");
const configPath = "./config.js";

addCommand({ pattern: "mode ?(.*)", fromMe: true, desc: "Set bot mode" }, async (m, match) => {
  const input = match.trim().toLowerCase();

  if (!["public", "private", "group"].includes(input)) {
    return await m.reply(`*BOT MODE:* ${require("../config").MODE.toUpperCase()}\n\n📌 *Use:*\n.mode public\n.mode private\n.mode group`);
  }

  let configText = fs.readFileSync(configPath, "utf-8");

  configText = configText.replace(/MODE:\s*["'](.*?)["']/, `MODE: "${input}"`);

  fs.writeFileSync(configPath, configText);

  await m.reply(`✅ Bot mode updated to *${input.toUpperCase()}*\n\nPlease restart the bot to apply changes.`);
});
