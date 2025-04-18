const { cmd } = require('../command');

cmd({
  pattern: 'ping',
  desc: 'Bot status check',
  category: 'main',
  react: '🏓',
  filename: __filename,
}, async (client, message, m, extras) => {
  const start = new Date().getTime();

  const loadingMessages = [
    '[■□□□□□□□□□] 10%',
    '[■■□□□□□□□□] 20%',
    '[■■■□□□□□□□] 30%',
    '[■■■■□□□□□□] 40%',
    '[■■■■■□□□□□] 50%',
    '[■■■■■■□□□□] 60%',
    '[■■■■■■■□□□] 70%',
    '[■■■■■■■■□□] 80%',
    '[■■■■■■■■■□] 90%',
    '[■■■■■■■■■■] 100%',
  ];

  const loadingMsg = await extras.reply(loadingMessages[0]);

  // simulate loading effect
  for (let i = 1; i < loadingMessages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 150)); // adjust speed here
    await client.sendMessage(message.chat, {
      edit: loadingMsg.key,
      text: loadingMessages[i]
    });
  }

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
╭───『*𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦*』
│✅ *𝗕𝗼𝘁 𝗔𝗰𝘁𝗶𝘃𝗲 & 𝗪𝗼𝗿𝗸𝗶𝗻𝗴 𝗙𝗶𝗻𝗲¡*
│⚡ *𝗦𝗣𝗘𝗘𝗗:* ${ping} 𝗺𝘀
│⏱️ *𝗨𝗣𝗧𝗜𝗠𝗘:* ${uptime}
│💾 *𝗥𝗔𝗠 𝗨𝗦𝗔𝗚𝗘:* ${ram} 𝗠𝗕
╰────────────────────`;

  await client.sendMessage(message.chat, {
    edit: loadingMsg.key,
    text: text.trim()
  });
});
