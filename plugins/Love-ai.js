module.exports = {
  name: "love",
  description: "AI GF/BF chat - Sinhala mode",
  type: "ai",
  command: ["love"],

  async onCommand(message, client, args, text) {
    const input = text || message.quoted?.text;
    if (!input) return await message.reply("මට කතා කරන්න උදව්වක් ඕනෙ. උදා: .love හෙලෝ බැබි");

    try {
      const prompt = `You are a romantic Sinhala-speaking AI girlfriend or boyfriend. Be flirty, kind, and sweet.\n\nUser: ${input}\nAI:`;

      const res = await fetch("https://api.chatanywhere.com.cn/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer FREE_API_KEY"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You're a sweet, flirty, romantic Sinhala-speaking lover bot." },
            { role: "user", content: input }
          ]
        })
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim();

      if (reply) {
        await message.reply(reply);
      } else {
        await message.reply("මට දැන් පිළිතුරු දෙන්න බැහැ.");
      }

    } catch (err) {
      console.error("AI Chat Error:", err);
      await message.reply("AI ලව් බොට් එක down වගේ. ටික වෙලාවකින් නැවත උත්සහ කරන්න.");
    }
  }
};
