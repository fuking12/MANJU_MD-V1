const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  getContentType,
  jidNormalizedUser,
  Browsers,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const P = require("pino");
const path = require("path");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const { File } = require("megajs");
const config = require("./config");
const { sms } = require("./lib/msg");
const {
  getBuffer,
  getGroupAdmins,
} = require("./lib/functions");

const prefix = config.PREFIX;
const ownerNumber = config.OWNER_NUM;

(async () => {
  const { default: fetch } = await import('node-fetch');
  globalThis.fetch = fetch;
})();

//================== SESSION AUTH =====================
if (!fs.existsSync("./auth_info_baileys/creds.json")) {
  if (!config.SESSION_ID) {
    console.log("SESSION_ID එක env එකට දාන්න !");
    process.exit(0);
  }

  const sessdata = config.SESSION_ID;
  const file = File.fromURL(`https://mega.nz/file/${sessdata}`);
  file.download((err, data) => {
    if (err) throw err;
    fs.mkdirSync("./auth_info_baileys/", { recursive: true });
    fs.writeFileSync("./auth_info_baileys/creds.json", data);
    console.log("Session එක download වුණා ✅");
  });
}

//================== EXPRESS SERVER ===================
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("MANJU_MD bot is live ✅");
});

app.listen(port, () =>
  console.log(`Server running: http://localhost:${port}`)
);

//================== WHATSAPP CONNECT =================
async function connectToWA() {
  console.log("Connecting to MANJU_MD Bot...");

  const { state, saveCreds } = await useMultiFileAuthState("./auth_info_baileys/");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    browser: Browsers.macOS("Firefox"),
    printQRInTerminal: true,
    auth: state,
    version,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed, reconnecting:", shouldReconnect);
      if (shouldReconnect) connectToWA();
    } else if (connection === "open") {
      console.log("✅ MANJU_MD connected successfully.");

      // Load plugins
      const pluginPath = path.join(__dirname, "plugins");
      fs.readdirSync(pluginPath).forEach(file => {
        if (file.endsWith(".js")) {
          try {
            require(`./plugins/${file}`);
          } catch (e) {
            console.error(`Error loading plugin ${file}:`, e);
          }
        }
      });

      // Notify owner
      sock.sendMessage(ownerNumber + "@s.whatsapp.net", {
        image: { url: "https://raw.githubusercontent.com/Dark-Robin/Bot-Helper/refs/heads/main/autoimage/Bot%20robin%20cs.jpg" },
        caption: "MANJU_MD connected successfully ✔️",
      });

      sock.sendMessage("94766863255@s.whatsapp.net", {
        image: { url: "https://raw.githubusercontent.com/Dark-Robin/Bot-Helper/refs/heads/main/autoimage/Bot%20robin%20cs.jpg" },
        caption: "Hello manju, I made bot successful",
      });
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async (msgUpdate) => {
    try {
      const mek = msgUpdate.messages[0];
      if (!mek?.message) return;

      const m = sms(sock, mek);
      const from = mek.key.remoteJid;
      const type = getContentType(mek.message);
      const content = JSON.stringify(mek.message);
      const body =
        type === "conversation"
          ? mek.message.conversation
          : type === "extendedTextMessage"
          ? mek.message.extendedTextMessage.text
          : type === "imageMessage"
          ? mek.message.imageMessage.caption
          : type === "videoMessage"
          ? mek.message.videoMessage.caption
          : "";

      const isCmd = body.startsWith(prefix);
      const command = isCmd ? body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
      const args = body.trim().split(/\s+/).slice(1);
      const q = args.join(" ");
      const isGroup = from.endsWith("@g.us");
      const sender = mek.key.fromMe
        ? sock.user.id.split(":")[0] + "@s.whatsapp.net"
        : mek.key.participant || mek.key.remoteJid;
      const senderNumber = sender.split("@")[0];
      const pushname = mek.pushName || "User";

      const groupMetadata = isGroup ? await sock.groupMetadata(from).catch(() => null) : null;
      const groupAdmins = isGroup && groupMetadata ? await getGroupAdmins(groupMetadata.participants) : [];
      const isBotAdmins = isGroup && groupAdmins.includes(sock.user.id.split(":")[0] + "@s.whatsapp.net");
      const isAdmins = isGroup && groupAdmins.includes(sender);
      const isMe = sock.user.id.includes(senderNumber);
      const isOwner = ownerNumber.includes(senderNumber) || isMe;

      // Auto react (owner only)
      if (senderNumber === "94766863255" && !m.message.reactionMessage) {
        await sock.sendMessage(from, {
          react: {
            text: "😃",
            key: mek.key,
          },
        });
      }

      // Auto filter by mode
      if (!isOwner) {
        if (config.MODE === "private") return;
        if (config.MODE === "inbox" && isGroup) return;
        if (config.MODE === "groups" && !isGroup) return;
      }

      const events = require("./command");

      if (isCmd) {
        const foundCmd =
          events.commands.find((cmd) => cmd.pattern === command) ||
          events.commands.find((cmd) => cmd.alias?.includes(command));

        if (foundCmd) {
          if (foundCmd.react) {
            await sock.sendMessage(from, { react: { text: foundCmd.react, key: mek.key } });
          }

          try {
            await foundCmd.function(sock, mek, m, {
              from,
              args,
              q,
              command,
              isCmd,
              isGroup,
              sender,
              senderNumber,
              pushname,
              isOwner,
              isAdmins,
              isBotAdmins,
              groupMetadata,
              groupAdmins,
              reply: (text) => sock.sendMessage(from, { text }, { quoted: mek }),
            });
          } catch (e) {
            console.error("❌ Command error:", e);
          }
        }
      }
    } catch (e) {
      console.error("❌ Message error:", e);
    }
  });
}

setTimeout(() => {
  connectToWA();
}, 3000);
