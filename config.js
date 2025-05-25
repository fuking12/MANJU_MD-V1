const fs = require("fs");

if (fs.existsSync("config.env"))

  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {

  return text === fault ? true : false;

}

module.exports = {

  SESSION_ID: process.env.SESSION_ID || "zZ8R3LoC#zo2tBuuqDPo797uTpP4lHDG-xqzQorw8AK8UDU4JSRc",

  OWNER_NUM: process.env.OWNER_NUM || "94766863255",

  PREFIX: process.env.PREFIX || ".",

  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/Manju362/Link-gamu./refs/heads/main/IMG-20250417-WA0196.jpg",

  ALIVE_MSG: process.env.ALIVE_MSG || "🛠 *ManjuBot v3.0 - Fully Operational!* 🛠\n⚡ *Status: Online & Ready to Dominate!*\n⏰ *Current Time in Sri Lanka: 🕒 {time}*\n📡 *Powered by Manju362 | Commands Active!*\n🔥 *Drop a command to unleash the power! Try .menu* 🔥",

  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",

  MODE: process.env.MODE || "inbox",

  MOVIE_API_KEY: process.env.API_KEY || "sky|2483faa7f5630311464123d017fc7acc2aec6da0",
  
  



};
