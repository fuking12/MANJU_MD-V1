const { cmd, commands } = require("../command");

const config = require('../config');

cmd(

  {

    pattern: "menu",

    alias: ["getmenu"],

    react: '💋',

    desc: "Get command list",

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

⚙️ Reply to this message with the menu number to view commands.`;

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

│  ▸ .song <text> – Audio download  

│  ▸ .download <link> – Video download  

│  ▸ .video <text> – YouTube download  

│  ▸ .fb <link> – Facebook video download  

│  ▸ .tiktok <link> – TikTok video download  

│  ▸ .mfire <link> – MediaFire download 

╰─────────────────────────────`,

        "Movie Menu": `

╭─➤ 🎥 *Movie Commands*  

│  ▸ .film <search> – Sinhala subtitles  

│  ▸ .movie <film name> – SkyMansion movies 

╰────────────────────────────`,

        "18+ Menu": `

╭─➤ 🔞 *18+ Commands*  

│  ▸ .xnxx <name> – Adult content search  

│  ▸ .xnxxsearch <query> – Adult search  

│  ▸ .xnx search <text> – Adult search 

╰────────────────────────────`,

        "Convert Menu": `

╭─➤ 🛠️ *Convert Commands*  

│  ▸ .sticker – Image to sticker  

│  ▸ .img – Sticker to image  

│  ▸ .tts <text> – Text to speech  

│  ▸ .currency <text> – Currency converter  

│  ▸ .tr <lang> <text> – Translate 

╰──────────────────────────────`,

        "Search Menu": `

╭─➤ 🔍 *Search Commands*  

│  ▸ .img <query> – Search image  

│  ▸ .animegirl <search> – Anime girl image  

│  ▸ .anime <search> – Anime image  

│  ▸ .meme <search> – Generate meme  

│  ▸ .memephoto <search> – Meme text image  

│  ▸ .fact <search> – Fact information  

│  ▸ .weather <city> – Weather information 

╰─────────────────────────────`,

        "Timeline Menu": `

╭─➤ ⏰ *Timeline Alarm Set*  

│  ▸ .remind <setalarm> – Set alarm 

╰─────────────────────────────`,

        "Owner Menu": `

╭─➤ 👑 *Owner Commands*  

│  ▸ .restart – Restart bot  

│  ▸ .update – Check for updates 

╰────────────────────────────`,

        "Other Command": `

╭─➤ ⚙️ *Other Commands*  

│  ▸ .gift <text> – Send gift  

│  ▸ .ip <ip address> – Country checker  

│  ▸ .horoscope <text> – Horoscope search  

│  ▸ .randimg <text> – Random image search  

│  ▸ .squotes <text> – Quote search  

│  ▸ .sticker <text> – Sticker search  

│  ▸ .todo <text> – Add todo list  

│  ▸ .trivia <text> – Trivia search  

│  ▸ .typingtest <text> – Typing speed test  

│  ▸ .wikipedia <text> – Wikipedia search  

│  ▸ .define <text> – Dictionary search 

╰─────────────────────────────`,

        "Fun Command": `

╭─➤ 💮 *Fun Commands*  

│  ▸ .sjoke <text> – Sinhala joke  

│  ▸ .joke <text> – Joke search 

╰────────────────────────────`

      };

      const categoryNames = Object.keys(categories);

      // Create numbered list for main menu

      let numberedMenu = categoryNames.map((category, index) => `${index + 1}. ${category}`).join("\n");

      // Validate ALIVE_IMG

      if (!config.ALIVE_IMG) {

        throw new Error("ALIVE_IMG is not defined in config!");

      }

      // Send main menu and capture the message

      const menuMessage = await robin.sendMessage(

        from,

        {

          image: { url: config.ALIVE_IMG },

          caption: `${menuHeader}\n\n${numberedMenu}\n\n┏━━━━━━━━━━━━━━━━━━━━━━━┓\n┃     Powered By: Tharu × Manju   ┃\n┗━━━━━━━━━━━━━━━━━━━━━━━┛`,

        },

        { quoted: mek }

      );

      // Store the menu message ID

      const menuMessageId = menuMessage.key.id;

      // Register event listener for replies

      const handleReply = async ({ messages }) => {

        try {

          const msg = messages[0];

          if (!msg.message) return;

          // Debug: Log the entire message object

          console.log("Received message:", JSON.stringify(msg, null, 2));

          // Check if the message is a reply to the menu message

          const isReplyToMenu =

            msg.message.extendedTextMessage &&

            msg.message.extendedTextMessage.contextInfo &&

            msg.message.extendedTextMessage.contextInfo.stanzaId === menuMessageId;

          if (!isReplyToMenu) {

            console.log("Not a reply to menu message, ignoring.");

            return;

          }

          // Get user reply

          let userReply = null;

          if (msg.message.conversation) {

            userReply = msg.message.conversation.trim();

          } else if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) {

            userReply = msg.message.extendedTextMessage.text.trim();

          }

          if (!userReply) {

            await robin.sendMessage(

              msg.key.remoteJid,

              { text: "කරුණාකර අංකයක් ඇතුළත් කරන්න!" },

              { quoted: msg }

            );

            return;

          }

          // Debug: Log the user reply

          console.log(`User reply: ${userReply}`);

          // Validate the number

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

            await robin.sendMessage(

              msg.key.remoteJid,

              { text: "කරුණාකර වලංගු මෙනු අංකයක් ඇතුළත් කරන්න!" },

              { quoted: msg }

            );

          }

        } catch (e) {

          console.error("Error in handleReply:", e);

          // Do not send error to user, log it silently

        }

      };

      // Register the listener with error handling

      try {

        robin.ev.on('messages.upsert', handleReply);

      } catch (e) {

        console.error("Failed to register event listener:", e);

        // Silently handle the error without notifying the user

      }

    } catch (e) {

      console.error("Menu Error:", e);

      // Only send user-friendly errors, avoid technical details

      if (e.message.includes("ALIVE_IMG")) {

        await reply("කණගාටුයි, bot configuration එකේ ගැටලුවක් තිබෙනවා!");

      } else {

        await reply("කණගාටුයි, menu එක ලබාදීමේ දෝෂයක් ඇති වුණා!");

      }

    }

  }

);