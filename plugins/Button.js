const { cmd } = require("../command");

// Button mode state
let isButtonMode = false;

// Command to toggle button mode
cmd({
  pattern: "mode",
  desc: "Toggle button mode on or off",
  category: "Utility",
  filename: __filename,
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    const mode = q.toLowerCase().trim();

    if (mode === "button") {
      isButtonMode = true;
      await conn.sendMessage(from, {
        text: "🎯 Button mode enabled! Commands will now use buttons where applicable.",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
        }
      }, { quoted: mek });
      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } else if (mode === "nonebutton") {
      isButtonMode = false;
      await conn.sendMessage(from, {
        text: "❌ Button mode disabled! Commands will use text responses.",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
        }
      }, { quoted: mek });
      await conn.sendMessage(from, { react: { text: "🚫", key: mek.key } });
    } else {
      await conn.sendMessage(from, {
        text: "⚠️ Invalid mode! Use: .mode button or .mode nonebutton",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
        }
      }, { quoted: mek });
      await conn.sendMessage(from, { react: { text: "❓", key: mek.key } });
    }
  } catch (e) {
    console.error("Error:", e);
    await conn.sendMessage(from, {
      text: `🚨 Error: ${e.message || "Something went wrong!"}\nTry again later.`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
      }
    }, { quoted: mek });
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});

// Export isButtonMode for use in other commands
module.exports = { isButtonMode };
