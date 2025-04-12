module.exports = {
  pattern: "ping",
  alias: [".ping"],
  desc: "Check bot's ping",
  category: "system",
  react: "🏓",
  function: async (conn, mek, m, { reply }) => {
    let start = new Date().getTime();
    await reply("Ping වෙමින්...");
    let end = new Date().getTime();
    reply(`*MANJU_MD*\n_Response Time:_ ${end - start}ms`);
  },
};
