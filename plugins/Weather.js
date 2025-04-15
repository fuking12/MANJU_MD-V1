const fetch = require("node-fetch");

module.exports = {
  name: "weather",
  description: "කාලගුණ තොරතුරු ලබාදෙන්න (API key නැතිව)",
  type: "search",
  pattern: ".weather",

  async onCommand(message, client, match, text) {
    const location = text || message.quoted?.text;
    if (!location) {
      return await message.reply("කරුණාකර නගරයක් හෝ තැනක් දෙන්න. උදා: `.weather Colombo`");
    }

    const url = `https://wttr.in/${encodeURIComponent(location)}?format=3`;

    try {
      const res = await fetch(url);
      const data = await res.text();

      if (data.toLowerCase().includes("unknown location")) {
        return await message.reply(`"${location}" කියන තැනක් හමු නොවුණා.`);
      }

      await message.reply(`📍 *${data.trim()}*`);
    } catch (e) {
      console.error(e);
      await message.reply("කාලගුණ තොරතුරු ලබාගන්න නොහැක. ටික වෙලාවකින් උත්සහ කරන්න.");
    }
  }
};
