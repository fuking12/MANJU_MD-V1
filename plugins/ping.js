const os = require('os');
const { performance } = require('perf_hooks');

module.exports = {
  name: 'system',
  alias: ['ping', 'system', 'status', 'පිං', 'සියු'],
  category: 'system',
  desc: 'බොට් සම්බන්ධ තොරතුරු පෙන්වයි',
  async exec({ sock, m }) {
    const start = performance.now();

    const loading = await sock.sendMessage(m.chat, {
      text: '*🔍 බොට් පද්ධතිය පරීක්ෂා කරමින් සිටී...*'
    }, { quoted: m });

    const end = performance.now();
    const ping = (end - start).toFixed(2);

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    const platform = os.platform();
    const cpu = os.cpus()[0].model;

    const status = `
*📊 BOT පද්ධති තොරතුරු*

*📶 Ping:* ${ping} ms
*⏱️ Uptime:* ${hours}h ${minutes}m ${seconds}s
*💾 Memory:* ${usedMem} MB / ${totalMem} MB
*🖥️ Platform:* ${platform}
*⚙️ CPU:* ${cpu}

*© MANJU_MD බොට් සේවාව*
`;

    await sock.sendMessage(m.chat, {
      text: status.trim(),
      footer: 'මීළඟට කරන්න ඔයාලට කැමති දෙයක් තෝරන්න',
      buttons: [
        { buttonId: 'ping', buttonText: { displayText: '🔁 පිං නැවත බලන්න' }, type: 1 },
        { buttonId: 'menu', buttonText: { displayText: '🏠 මූලපිට යන්න' }, type: 1 }
      ],
      headerType: 1,
      edit: loading.key
    });
  }
};
