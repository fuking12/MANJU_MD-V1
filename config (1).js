const fs = require("fs");

const os = require("os"); // For RAM usage

const { execSync } = require("child_process"); // For CPU info

if (fs.existsSync("config.env"))

  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, defaultValue = "true") {

  return text === defaultValue ? true : false;

}

// Format uptime

function formatUptime(uptime) {

  const days = Math.floor(uptime / (24 * 3600));

  const hours = Math.floor((uptime % (24 * 3600)) / 3600);

  const minutes = Math.floor((uptime % 3600) / 60);

  const seconds = Math.floor(uptime % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;

}

// Get CPU information

function getCPUInfo() {

  try {

    return os.cpus()[0].model || "Unknown CPU";

  } catch (e) {

    return "CPU Info Unavailable";

  }

}

// Get network status

function getNetworkStatus() {

  const interfaces = os.networkInterfaces();

  let status = "No Network";

  for (let iface in interfaces) {

    for (let addr of interfaces[iface]) {

      if (addr.family === "IPv4" && !addr.internal) {

        status = "Connected";

        break;

      }

    }

  }

  return status;

}

module.exports = {

  SESSION_ID: process.env.SESSION_ID || "2PJmSbZa#LSoVewqnJuId6guhMBSX_1dhXL9dUgSaI0a-_R9joq0",

  OWNER_NUM: process.env.OWNER_NUM || "94766863255",

  PREFIX: process.env.PREFIX || ".",

  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/Manju362/Link-gamu./refs/heads/main/IMG-20250417-WA0196.jpg",

  ALIVE_MSG: process.env.ALIVE_MSG || `♕︎ *Bot Status* 

✳️ *𝗕𝗢𝗧 𝗡𝗔𝗠𝗘*: ${process.env.BOT_NAME || "Mᴀɴᴊᴜ_ᴍᴅ"}

🕒 *Uᴘᴛɪᴍᴇ*: ${formatUptime(process.uptime())}

⏳ *Rᴜɴᴛɪᴍᴇ*: Node.js ${process.version}

💾 *Rᴀᴍ Usᴀɢᴇ*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB

🖥️ *CPU*: ${getCPUInfo()}

🌐 *Nᴇᴛᴡᴏʀᴋ*: ${getNetworkStatus()}

📅 *Dᴀᴛᴇ*: ${new Date().toLocaleDateString("en-US")}

⏰ *Tɪᴍᴇ*: ${new Date().toLocaleTimeString("en-LK")}

⚙️ *OS*: ${os.platform()} ${os.release()}

🔋 *Sᴛᴀᴛᴜs*: Online and fully operational!

📌 *Fᴇᴀᴛᴜʀᴇᴅ*:

- 🎬 𝗔𝗖𝗖𝗘𝗦𝗦 𝗠𝗢𝗩𝗜𝗥𝗗, 𝗦𝗢𝗡𝗚𝗦, 𝗔𝗡𝗗 𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡𝗔𝗟 𝗖𝗢𝗡𝗧𝗘𝗡𝗧

- ⚡ Fᴀsᴛ Rᴇsᴘᴏɴᴇᴇs

- 🛠️ Cᴜsᴛᴏᴍɪᴢᴀʙʟᴇ Cᴏᴍᴍᴀɴᴅs

💬 *𝗝𝗼𝗶𝗻 𝘂𝘀*: Sʜᴀʀᴇ Yᴏᴜʀ ᴛᴇǫᴜᴠᴇsᴛ! 😊`,

  MODE: process.env.MODE || "private",

  MOVIE_API_KEY: process.env.API_KEY || "sky|2483faa7f5630311464123d017fc7acc2aec6da0",

};