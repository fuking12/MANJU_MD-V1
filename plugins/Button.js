const { cmd } = require("../command"); // command.js import කරනවා

// Button mode state
let isButtonMode = false;

// Command to toggle button mode
cmd({
  pattern: "mode", // Command pattern
  desc: "Toggle button mode on or off",
  category: "Utility",
  filename: __filename,
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    const mode = q.toLowerCase().trim();

    if (mode === "button") {
      isButtonMode = true;
      await conn.sendMessage(from, {
        text: "🎯 Button mode සක්‍රියයි! Commands දැන් buttons භාවිතා කරයි.",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
        },
      }, { quoted: mek });
      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } else if (mode === "nonebutton") {
      isButtonMode = false;
      await conn.sendMessage(from, {
        text: "❌ Button mode අක්‍රියයි! Commands දැන් text responses භාවිතා කරයි.",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
        },
      }, { quoted: mek });
      await conn.sendMessage(from, { react: { text: "🚫", key: mek.key } });
    } else {
      await conn.sendMessage(from, {
        text: "⚠️ වැරදි mode එකක්! භාවිතා කරන්න: .mode button හෝ .mode nonebutton",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
        },
      }, { quoted: mek });
      await conn.sendMessage(from, { react: { text: "❓", key: mek.key } });
    }

    // Debugging සඳහා mode log කරනවා
    console.log(`[Mode Toggle] isButtonMode set to: ${isButtonMode}`);
  } catch (e) {
    console.error("[Mode Toggle Error]:", e);
    await conn.sendMessage(from, {
      text: `🚨 දෝෂයක්: ${e.message || "යම් දෝෂයක් ඇතිවුණා!"}\nකරුණාකර පසුව උත්සාහ කරන්න.`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
      },
    }, { quoted: mek });
   -cornerstone
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});

// isButtonMode export කරනවා
module.exports = { isButtonMode };
