const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "2PJmSbZa#LSoVewqnJuId6guhMBSX_1dhXL9dUgSaI0a-_R9joq0",
  OWNER_NUM: process.env.OWNER_NUM || "94766863255",
  PREFIX:process.env.PREFIX || ".",
  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/Manju362/Link-gamu./refs/heads/main/IMG-20250408-WA0003.jpg",
  ALIVE_MSG: process.env.ALIVE_MSG || "𝗛𝗜,𝗜,𝗔𝗠 𝗔𝗟𝗜𝗩𝗘 𝗡𝗢𝗪\n\n>𝗬𝗢𝗨 𝗖𝗔𝗡 𝗚𝗘𝗧 𝗔𝗟𝗟 𝗧𝗛𝗘 𝗠𝗢𝗩𝗜𝗘𝗦\n\n>𝗣𝗛𝗢𝗧𝗢𝗦, 𝗦𝗢𝗡𝗚𝗦,𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡𝗔𝗟𝗦 𝗬𝗢𝗨 𝗪𝗔𝗡𝗧\n\n>𝗔𝗹𝗹 𝗧𝗛𝗥𝗢𝗨𝗚𝗛 𝗧𝗛𝗜𝗦 𝗕𝗢𝗧\n\n>𝗝𝗢𝗜𝗡 𝗠𝗬 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗖𝗛𝗔𝗡𝗡𝗘𝗟👇\n\n>☣️https://chat.whatsapp.com/Lo2XAYfYr3KGV4bo866AXN\n\n>𝗦𝗨𝗕𝗦𝗖𝗥𝗜𝗕𝗘 𝗠𝗬 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗖𝗛𝗔𝗡𝗡𝗘𝗟👇\n\n>☣️https://youtu.be/xSArkTWDXBs?si=447mUzkhuNcjvRYK\n\n>𝗧𝗛𝗔𝗡𝗞 𝗬𝗢𝗨 𝗩𝗘𝗥𝗥𝗬 𝗠𝗨𝗖𝗛 𝗔𝗟𝗟😍❤️,",
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
  MODE: process.env.MODE || "public",
  API_KEY:process.env.API_KEY || "sky|e6ad5555ee53b73644770beab633855c2f646a77",
};
