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
  ALIVE_MSG: process.env.ALIVE_MSG || "hi,I,am Alive Now",
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
  MODE: process.env.MODE || "public",
  API_KEY:process.env.API_KEY || "sky|e6ad5555ee53b73644770beab633855c2f646a77",
};
