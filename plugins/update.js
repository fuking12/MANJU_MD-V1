const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "update",
  alias: ["update"],
  description: "GitHub Repo එකෙන් බොට් functions update කරන්න",
  category: "owner",
  onlyPriv: true,
  use: ".update",
  async run({ msg }) {
    msg.reply("Update කිරීම ආරම්භ විය...");

    // Step 1: Git Pull
    exec("git pull", async (error, stdout, stderr) => {
      if (error) {
        msg.reply(`Git pull එකේ දෝෂයක්:\n\n${error.message}`);
        return;
      }
      if (stderr) {
        msg.reply(`stderr:\n${stderr}`);
        return;
      }

      // Step 2: Reload all plugin files
      try {
        const pluginFolder = path.join(__dirname, ".."); // Adjust if needed
        const files = fs.readdirSync(pluginFolder).filter(f => f.endsWith(".js"));

        files.forEach(file => {
          const pluginPath = path.join(pluginFolder, file);
          delete require.cache[require.resolve(pluginPath)];
          require(pluginPath);
        });

        msg.reply("✅ Update සාර්ථකයි!\n\n" + stdout);
      } catch (reloadErr) {
        msg.reply("Plugins reload error: " + reloadErr.message);
      }
    });
  },
};
