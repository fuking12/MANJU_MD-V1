const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "2PJmSbZa#LSoVewqnJuId6guhMBSX_1dhXL9dUgSaI0a-_R9joq0",
  
  
  OWNER_NUM: process.env.OWNER_NUM || "94766863255",
  PREFIX: process.env.PREFIX || ".",
  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/Manju362/Link-gamu./refs/heads/main/IMG-20250417-WA0196.jpg",
  ALIVE_MSG: process.env.ALIVE_MSG || "your bot alive now",
  MODE: process.env.MODE || "private",
  MOVIE_API_KEY: process.env.API_KEY || "sky|2483faa7f5630311464123d017fc7acc2aec6da0"
  
  
};
