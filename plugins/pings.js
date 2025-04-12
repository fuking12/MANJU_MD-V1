const os = require('os');
const { performance } = require('perf_hooks');

module.exports = {
  name: 'ping',
  alias: ['status', 'පිං', 'system'],
  category: 'system',
  desc: 'Bot පද්ධතිය පරීක්ෂා කිරීම',
  async exec({ sock, m }) {
    const start = performance.now();
    const loading = await sock.sendMessage(m.chat, { text: '📡 පරීක්ෂාව සිදුවෙමින්...' }, { quoted: m });
    const end = performance.now();

    const ping = (end - start).toFixed(2);
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    const cpu = os.cpus()[0].model;
    const platform = os.platform();

    const msg = `
*📊 MANJU_MD පද්ධති තත්වය*

📶 *Ping:* ${ping} ms
⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
💾 *Memory:* ${usedMem} MB / ${totalMem} MB
🖥️ *Platform:* ${platform}
⚙️ *CPU:* ${cpu}
`.trim();

    await sock.sendMessage(m.chat, {
      text: msg,
      footer: 'Bot status panel',
      buttons: [
        { buttonId: 'ping', buttonText: { displayText: '🔁 නැවත පරීක්ෂා කරන්න' }, type: 1 },
        { buttonId: 'menu', buttonText: { displayText: '📂 මෙනුවට යන්න' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m });
  }
};
