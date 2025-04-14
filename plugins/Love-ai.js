const { command } = require("../lib/command");
const axios = require("axios");

command({
  pattern: "love ?(.*)",
  fromMe: false,
  desc: "Chat with AI Girlfriend/Boyfriend",
  type: "ai"
}, async (message, match) => {
  const input = match || message.reply_message.text;
  if (!input) return await message.reply("මට කතා කරන්න උදව්වක් ඕනෙ. උදාහරණයක්: `.love හෙලෝ බැබි`");

  try {
    const prompt = `You are a romantic Sinhala-speaking AI girlfriend or boyfriend. Be flirty, kind, and sweet.\n\nUser: ${input}\nAI:`;

    const gptRes = await axios.post("https://api.chatanywhere.com.cn/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You're a sweet, flirty, romantic Sinhala-speaking lover bot." },
        { role: "user", content: input }
      ]
    }, {
      headers: {
        "Authorization": "Bearer FREE_API_KEY",
        "Content-Type": "application/json"
      }
    });

    const aiReply = gptRes.data.choices[0].message.content.trim();
    await message.reply(aiReply);

  } catch (err) {
    await message.reply("මට දැන් කතා කරන්න බැහැ. ටික වෙලාවකින්  කතා කරමු.");
    console.error(err);
  }
});
