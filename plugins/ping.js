module.exports = {
  name: "ping",
  alias: ["ping"],
  description: "බොට්ගේ ප්‍රතිචාර වේලාව පෙන්වයි",
  category: "info",
  use: ".ping",
  async run({ msg, sock }) {
    const start = Date.now();

    const loadingMsg = await msg.reply("╭─⏳ *Ping Check...*\n├── ධාවනය වෙමින්...\n╰── කරුණාකර රැඳී සිටින්න...");

    const end = Date.now();
    const ping = end - start;

    await sock.sendMessage(msg.from, {
      text: `╭─📡 *Ping Result*\n├── 📶 *Response Time:* ${ping} ms\n╰── ✅ *Bot Active!*`,
      edit: loadingMsg.key
    });
  },
};
