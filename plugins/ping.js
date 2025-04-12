const os = require('os');
const { performance } = require('perf_hooks');

module.exports = {
  name: 'ping',
  alias: ['system', 'status', 'පිං'],
  category: 'system',
  desc: 'Bot පද්ධතිය පරීක්ෂා කරයි',
  async exec({ sock, m }) {
    const start = performance.now();
    const loading = await sock.sendMessage(m.chat, {
      text: '*🔍 බොට් පද්ධතිය පරීක්ෂා වෙමින්...*'
    }, { quoted: m });

    const end = performance.now();
    const ping = (end - start).toFixed(2);

    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const mnt = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const used = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const total = (os.totalmem() / 1024 / 1024).toFixed(2);
    const cpu = os.cpus()[0].model;
    const platform = os.platform();

    const msg = `
*📊 MANJU_MD බොට් තත්වය*

*📶 Ping:* ${ping} ms
*⏱️ Uptime:* ${h}h ${mnt}m ${s}s
*💾 Memory:* ${used} MB / ${total} MB
*🖥️ Platform:* ${platform}
*⚙️ CPU:* ${cpu}
`.trim();

    await sock.sendMessage(m.chat, {
      text: msg,
      footer: 'මීළඟට කරන්නේ මොකද්ද?',
      buttons: [
        { buttonId: 'ping', buttonText: { displayText: '🔁 නැවත පරීක්ෂා කරන්න' }, type: 1 },
        { buttonId: 'menu', buttonText: { displayText: '🏠 මූලපිට' }, type: 1 }
      ],
      headerType: 1
    });
  }
};
