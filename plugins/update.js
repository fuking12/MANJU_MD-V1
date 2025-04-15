const { cmd } = require("../command");
const path = require("path");
const fs = require("fs");

cmd({
  pattern: "update",
  desc: "Reload bot plugins",
  category: "owner",
  filename: __filename,
  fromMe: true,
}, async (client, m, text, info) => {
  try {
    await info.reply("♻️ Plugins update වෙමින් පවතී...");

    // Clear old plugin cache
    Object.keys(require.cache).forEach((key) => {
      if (key.includes("/plugins/")) {
        delete require.cache[key];
      }
    });

    // Reload plugins
    const pluginPath = path.join(__dirname, "../plugins");
    fs.readdirSync(pluginPath).forEach(file => {
      if (file.endsWith(".js")) {
        try {
          delete require.cache[require.resolve(path.join(pluginPath, file))];
          require(path.join(pluginPath, file));
        } catch (err) {
          console.error(`❌ Plugin Error: ${file}`, err);
        }
      }
    });

    await info.reply("✅ Plugins update වුනා!");
  } catch (e) {
    console.error("Update Error:", e);
    await info.reply("❌ Plugin update එක fail වුනා.");
  }
});
