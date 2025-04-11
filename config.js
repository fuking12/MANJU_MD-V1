const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "Enter your session ID",
  OWNER_NUM: process.env.OWNER_NUM || "94766863255",
  PREFIX:process.env.PREFIX || ".",
  ALIVE_IMG: process.env.ALIVE_IMG || "",
  ALIVE_MSG: process.env.ALIVE_MSG || "",
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
  MODE: process.env.MODE || "public",
};
