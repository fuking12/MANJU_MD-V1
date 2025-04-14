const { cmd } = require('../command');

cmd({
  pattern: 'ping',
  desc: 'Bot status check',
  category: 'main',
  react: '🏓',
  filename: __filename,
}, async (client, message, m, extras) => {
  const start = new Date().getTime();
  await extras.reply("🏓 Pong! වෙලා බලන්න...");
  const end = new Date().getTime();
  const ping = end - start;
  await extras.reply(`✅ Bot Working Fine!\n⚡ Speed: *${ping}ms*`);
});
