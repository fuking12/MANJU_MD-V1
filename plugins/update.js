const { exec } = require("child_process");
const { cmd } = require("../command");

cmd({
  pattern: "update",
  desc: "Reload bot plugins",
  category: "owner",
  filename: __filename,
  fromMe: true,
}, async (client, m, text, info) => {
  try {
    await info.reply("♻️ Updating plugins...");

    Object.keys(require.cache).forEach((key) => {
      if (key.includes("/plugins/")) {
        delete require.cache[key];
      }
    });

    const pluginPath = require("path").join(__dirname);
    require("fs").readdirSync(pluginPath).forEach(file => {
      if (file.endsWith(".js")) {
        try {
          delete require.cache[require.resolve(`./${file}`)];
          require(`./${file}`);
        } catch (err) {
          console.error(`❌ Plugin Error: ${file}`, err);
        }
      }
    });

    await info.reply("✅ Plugins updated successfully!");
  } catch (e) {
    console.error("Update Error:", e);
    await info.reply("❌ Update failed.");
  }
});
