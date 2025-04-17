const { cmd } = require('../command');

cmd({
  pattern: 'ping',
  desc: 'Bot status check',
  category: 'main',
  react: '🏓',
  filename: __filename,
}, async (client, message, m, extras) => {
  const start = new Date().getTime();
  await extras.reply("🏓 Pinging...");
  const end = new Date().getTime();
  const ping = end - start;

  // uptime in seconds
  const uptimeSec = process.uptime();
  const hours = Math.floor(uptimeSec / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = Math.floor(uptimeSec % 60);
  const uptime = `${hours}h ${minutes}m ${seconds}s`;

  // RAM usage
  const memory = process.memoryUsage().rss / 1024 / 1024;
  const ram = memory.toFixed(2);

  const text = `
╭───『*Sʏsᴛᴇᴍ Sᴛᴀᴛᴜs*』
│✅ *Bot Active & Working Fine!*
│⚡ *Speed:* ${ping} ms
│⏱️ *Uptime:* ${uptime}
│💾 *RAM Usage:* ${ram} MB
╰────────────────────`;

  await extras.reply(text);
});
