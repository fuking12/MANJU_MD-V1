const { cmd } = require("../command");

cmd(
  {
    pattern: "ping",
    desc: "Ping pong check",
    category: "info",
    filename: __filename,
  },
  async ({ msg }) => {
    await msg.reply("Pong!");
  }
);
