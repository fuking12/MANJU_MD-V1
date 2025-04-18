const { cmd, commands } = require("../command");
const config = require('../config');

cmd(
  {
    pattern: "menu",
    alias: ["getmenu"],
    react: '💋',
    desc: "get cmd list",
    category: "main",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      let menu = {
        main: "",
        download: "",
        group: "",
        owner: "",
        convert: "",
        search: "",
      };

      for (let i = 0; i < commands.length; i++) {  
        if (commands[i].pattern && !commands[i].dontAddCommandList) {  
          menu[  
            commands[i].category  
          ] += `${config.PREFIX}${commands[i].pattern}\n`;  
        }  
      }  

      let madeMenu = `
   HELLO ${pushname} 👋 
┣━━━━━━━━━━━━━━━━━━━━┫
┃  MANJU_MD • BOT MENU   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

╭─➤ ⚙️ *Main Commands*  
│  ▸ .alive – Bot status  
│  ▸ .menu – Show all commands  
│  ▸ .ai <text> – Chat with AI  
│  ▸ .system – System information  
│  ▸ .owner – Contact owner  
╰────────────────────────

╭─➤ ⬇️ *Download Commands*  
│  ▸ .song <text> – Download audio  
│  ▸ .video <text> – Download YouTube video  
│  ▸ .fb <link> – Facebook video downloader  
╰─────────────────────────────

╭─➤ 🛠️ *Convert Commands*  
│  ▸ .sticker – Image to sticker  
│  ▸ .img – Sticker to image  
│  ▸ .tts <text> – Text to speech  
│  ▸ .tr <lang> <text> – Translate text  
╰──────────────────────────────

╭─➤ 🔍 *Search Commands*  
│  ▸ .img <query> – Search image  
╰─────────────────────────────

╭─➤ 👑 *Owner Commands*  
│  ▸ .restart – Restart bot  
│  ▸ .update – Check for updates  
╰────────────────────────────

┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃     Powered by: Tharu × PATHUM     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━┛
`;

      await robin.sendMessage(
        from,
        {
          image: {
            url: "https://raw.githubusercontent.com/Manju362/Link-gamu./refs/heads/main/IMG-20250417-WA0191.jpg",
          },
          caption: madeMenu,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.log(e);
      reply(`${e}`);
    }
  }
);
