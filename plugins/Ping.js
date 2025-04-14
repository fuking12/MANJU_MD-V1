const { cmd } = require('../command');
const os = require('os');
const { performance } = require('perf_hooks');

cmd({
  name: 'ping',
  desc: 'Check bot response speed and system status',
  category: 'bot',
  filename: __filename
}, async (client, m, { reply }) => {
  const start = performance.now();
  const uptime = process.uptime();
  const speed = performance.now() - start;

  const formatUptime = (seconds) => {
    const pad = (s) => (s < 10 ? '0' : '') + s;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const msg = `*📶 Bot Status*

┌─❖
│➤ *Ping:* ${speed.toFixed(2)} ms
│➤ *Uptime:* ${formatUptime(uptime)}
│➤ *RAM:* ${(os.totalmem() - os.freemem()) / 1024 / 1024} MB / ${(os.totalmem() / 1024 / 1024).toFixed(0)} MB
│➤ *CPU:* ${os.cpus()[0].model}
└───────`;

  reply(msg);
});
