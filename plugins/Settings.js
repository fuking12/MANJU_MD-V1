const { cmd } = require("../command");
const config = require("../config");

cmd({
  pattern: "settings",
  desc: "බොට් එකේ settings බලන්න",
  category: "system",
  filename: __filename,
}, async (client, m, msg) => {
  const settingsList = [
    { key: "AUTO_REACT", label: "Auto React" },
    { key: "AUTO_BIO", label: "Auto Bio" },
    { key: "AUTO_READ", label: "Auto Read" },
    { key: "AUTO_TYPING", label: "Auto Typing" },
    { key: "AUTO_RECORD", label: "Auto Recording" },
    { key: "MODE", label: "Bot Mode" }
  ];

  let caption = `*🛠 BOT SETTINGS (${config.MODE.toUpperCase()})*\n\n`;

  for (const setting of settingsList) {
    const value = config[setting.key];
    let status = "";

    if (typeof value === "boolean") {
      status = value ? "✅ ON" : "❌ OFF";
    } else if (typeof value === "string") {
      status = `📌 ${value}`;
    }

    caption += `• *${setting.label}*: ${status}\n`;
  }

  await client.sendMessage(msg.from, { text: caption }, { quoted: m });
});
