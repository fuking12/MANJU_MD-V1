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
┃  MANJU_MD • BOT MENU  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

╭─➤ ⚙️ *Main Commands*  
│  ▸ .alive – Bot status  
│  ▸ .menu – Show all commands  
│  ▸ .ai <text> – Chat with AI  
│  ▸ .system – System information │  ▸ .owner – Contact owner   
│  ▸ .ping – Bot connection status 
╰────────────────────────  


╭─➤ ⬇️ *Download Commands*  
│  ▸ .song <text> – audio down...
│  ▸ .Download <link> – Video down
│  ▸ .video <text> – Yt down...
│  ▸ .fb <link> – video down....
│  ▸ .tiktok <link> – video down..
│  ▸ .mfire <link> – mediafire dn. 
╰─────────────────────────────
☁︎ᵃˡ ᵐᵒᵛⁱᵉˡ ᶜᵒᵐᵐᵃⁿᵈˢ ʷᵒʳᵏⁱⁿᵍ
╭─➤ 🎥 *Movie Commands*  
│  ▸ .film <search> sinhalasub
│  ▸ .movie <film name> skymantion
╰────────────────────────────
☁︎ᵃˡˡ ˣⁿˣˣ ᶜᵒᵐᵐᵃⁿᵈˢ ʷᵒʳᵏⁱⁿᵍ
╭─➤ 🔞 *18+ Commands*  
│  ▸ .xnxx {Your 18+? go+ <name>
│  ▸ .xnxxsearch <Mia ?> 
   ▸ .xnx search <text> 
╰────────────────────────────

╭─➤ 🛠️ *Convert Commands*  
│  ▸ .sticker – Image to sticker  
│  ▸ .img – Sticker to image  
│  ▸ .tts <text> – Text to speech │  ▸ .currency <text> – converter 
│  ▸ .tr <lang> <text> –Translate 
╰──────────────────────────────

╭─➤ 🔍 *Search Commands*  
│  ▸ .img <query> – Search image 
│  ▸ .weather <city> – information 
╰─────────────────────────────
╭─➤ ⏰ *TIMELINE ALARM SET*  
│
│  ▸ .remind <setalarm> set alarm
│
╰─────────────────────────────

╭─➤ 👑 *Owner Commands*  
│  ▸ .restart – Restart bot  
│  ▸ .update – Check for updates  
╰────────────────────────────

┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃     Pᴏᴡᴇʀᴅ Bʏ : Tʜᴀʀᴜ × Mᴀɴᴊᴜ   ┃
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
