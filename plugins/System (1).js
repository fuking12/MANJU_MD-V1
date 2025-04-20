const os = require("os");

const { cmd } = require("../command");

cmd(

  {

    pattern: "system",

    desc: "Show system information",

    category: "info",

    filename: __filename,

  },

  async (client, m, { react }) => {

    await react("⚙️");

    const frames = [

      "[□□□□□□□□□□] 0%",

      "[■■□□□□□□□□] 20%",

      "[■■■■□□□□□□] 40%",

      "[■■■■■■□□□□] 60%",

      "[■■■■■■■■□□] 80%",

      "[■■■■■■■■■■] 100%",

    ];

    // Send initial message

    let msg = await client.sendMessage(m.chat, {

      text: `*SYSTEM INFO LOAD වෙමින්...*\n${frames[0]}`,

    });

    // Speed optimized progress animation

    for (let i = 1; i < frames.length; i++) {

      await new Promise((res) => setTimeout(res, 500)); // 500ms delay

      try {

        await client.sendMessage(m.chat, {

          text: `*SYSTEM INFO LOAD වෙමින්...*\n${frames[i]}`,

          edit: msg.key,

        });

      } catch (e) {

        console.error("Edit failed:", e.message);

      }

    }

    // Gather system info

    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);

    const usedMem = (totalMem - freeMem).toFixed(2);

    const cpuModel = os.cpus()[0].model;

    const cpuCores = os.cpus().length;

    const platform = os.platform();

    const arch = os.arch();

    const hostname = os.hostname();

    const uptime = (os.uptime() / 60).toFixed(0);

    const systemInfo = `

╭━━━〔 *SYSTEM INFO* 〕━━━╮

┃🖥️ *OS:* ${platform} (${arch})

┃💻 *Host:* ${hostname}

┃🧠 *CPU:* ${cpuModel}

┃🔢 *Cores:* ${cpuCores}

┃💾 *Total RAM:* ${totalMem} GB

┃📦 *Used RAM:* ${usedMem} GB

┃🕒 *System Uptime:* ${uptime} mins

╰━━━━━━━━━━━━━━━━━━━━━━╯`;

    // Final update

    await new Promise((res) => setTimeout(res, 500));

    try {

      await client.sendMessage(m.chat, {

        text: systemInfo,

        edit: msg.key,

      });

    } catch {

      await client.sendMessage(m.chat, { text: systemInfo });

    }

  }

);