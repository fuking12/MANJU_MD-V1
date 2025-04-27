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

      // Main menu header

      let menuHeader = `

   

      HELLO ${pushname} 👋 
┏╔『 MANJU_MD 』╗
║ BOT MENU     ║
╚══════════════╝

⚙️It works by simply typing the menu numbers without selecting the menu message or even listening to the menu message*.`;


      // Define categories and their commands

      const categories = {

        "Main Menu": `

╭─➤ ⚙️ *Main Commands*  

│  ▸ .alive – Bot status  

│  ▸ .menu – Show all commands  

│  ▸ .ai <text> – Chat with AI  

│  ▸ .system – System information  

│  ▸ .owner – Contact owner   

│  ▸ .ping – Bot connection status 

╰────────────────────────`,

        "Download Menu": `

╭─➤ ⬇️ *Download Commands*  

│  ▸ .song <text> – audio down...  

│  ▸ .Download <link> – Video down  

│  ▸ .video <text> – Yt down...  

│  ▸ .fb <link> – video down....  

│  ▸ .tiktok <link> – video down..  

│  ▸ .mfire <link> – mediafire dn. 

╰─────────────────────────────`,

        "Movie Menu": `

☁︎ᵃˡ ᵐᵒᵛⁱᵉˡ ᶜᵒᵐᵐᵃⁿᵈˢ ʷᵒʳᵏⁱⁿᵍ

╭─➤ 🎥 *Movie Commands*  

│  ▸ .film <search> sinhalasub  

│  ▸ .movie <film name> skymantion 

╰────────────────────────────`,

        "18+ Menu": `

☁︎ᵃˡˡ ˣⁿˣˣ ᶜᵒᵐᵐᵃⁿᵈˢ ʷᵒʳᵏⁱⁿᵍ

╭─➤ 🔞 *18+ Commands*  

│  ▸ .xnxx {Your 18+? go+ <name>  

│  ▸ .xnxxsearch <Mia ?>  

│  ▸ .xnx search <text> 

╰────────────────────────────`,

        "Convert Menu": `

╭─➤ 🛠️ *Convert Commands*  

│  ▸ .sticker – Image to sticker  

│  ▸ .img – Sticker to image  

│  ▸ .tts <text> – Text to speech  

│  ▸ .currency <text> – converter  

│  ▸ .tr <lang> <text> – Translate 

╰──────────────────────────────`,

        "Search Menu": `

╭─➤ 🔍 *Search Commands*  

│  ▸ .img <query> – Search image  

│  ▸ .animegirl <search> image  

│  ▸ .anime <search> image  

│  ▸ .meme <search> generate  

│  ▸ .memephoto <search> text imag  

│  ▸ .fact <search> information  

│  ▸ .weather <city> – information 

╰─────────────────────────────`,

        "Timeline Menu": `

╭─➤ ⏰ *TIMELINE ALARM SET*  

│  ▸ .remind <setalarm> set alarm 

╰─────────────────────────────`,

        "Owner Menu": `

╭─➤ 👑 *Owner Commands*  

│  ▸ .restart – Restart bot  

│  ▸ .update – Check for updates 

╰────────────────────────────`,

        "Other Command": `

╭─➤ ⚙️ *Other Command*  

│  ▸ .gift <text> send gift  

│  ▸ .ip <ip address> conty cheker  

│  ▸ .horoscope <text> search  

│  ▸ .randimg <text> img search  

│  ▸ .squotes <text> search  

│  ▸ .sticker <text> search  

│  ▸ .todo <text> add todo list  

│  ▸ .trivia <text> search  

│  ▸ .typingtest <text> your speed  

│  ▸ .Wikipedia <text> news,all  

│  ▸ .define <text> dictio..search 

╰─────────────────────────────`,

        "Fun Command": `

╭─➤ 💮 *Fun Commands*  

│  ▸ .sjoke <text> sinhala joke  

│  ▸ .joke <text> search 

╰────────────────────────────`,

      };

      const categoryNames = Object.keys(categories);

      // Create numbered list for main menu

      let numberedMenu = categoryNames.map((category, index) => `${index + 1}. ${category}`).join("\n");

      // Send main menu as text with numbered list

      await robin.sendMessage(

        from,

        {

          image: { url: config.ALIVE_IMG },

          caption: `${menuHeader}\n\n${numberedMenu}\n\n┏━━━━━━━━━━━━━━━━━━━━━━━┓\n┃     Powered By: Tharu × Manju   ┃\n┗━━━━━━━━━━━━━━━━━━━━━━━┛`,

        },

        { quoted: mek }

      );

      // Listener for number replies to show sub-menu

      robin.ev.on('messages.upsert', async ({ messages }) => {

        const msg = messages[0];

        if (!msg.message) return;

        // Check if the message is a conversation (text reply)

        let userReply = null;

        if (msg.message.conversation) {

          userReply = msg.message.conversation.trim();

        } else if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) {

          userReply = msg.message.extendedTextMessage.text.trim();

        }

        // Debug log to check if the reply is captured

        console.log(`User reply received: ${userReply}`);

        // If no valid reply, return

        if (!userReply) return;

        const categoryIndex = parseInt(userReply) - 1;

        if (categoryIndex >= 0 && categoryIndex < categoryNames.length) {

          const selectedCategory = categoryNames[categoryIndex];

          const subMenu = `

${menuHeader}

${categories[selectedCategory]}

     
       
      ┏━━━━━━━━━━━━━━━━━━━━━━━┓
 ┃  Powered By: Tharu × Manju     
 ┃
 ┗━━━━━━━━━━━━━━━━━━━━━━━┛

`;

          await robin.sendMessage(

            msg.key.remoteJid,

            {

              image: { url: config.ALIVE_IMG },

              caption: subMenu,

            },

            { quoted: msg }

          );

        } else {

          console.log(`Invalid category index: ${categoryIndex}`);

        }

      });

    } catch (e) {

      console.log(e);

      reply(`Error: ${e}`);

    }

  }

);