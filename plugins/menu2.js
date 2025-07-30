const config = require("../config");

const { cmd, commands } = require('../command');

const os = require('os');

const fetch = require("node-fetch");

const { getBuffer, runtime } = require('../lib/functions');

// Dtz PastPaper Bot Theme

const dtzTheme = {

  header: `╭═📚DTZ PASTPAPER BOT📚═╮\n  ✦ SL EDUCATION A/L EDITION✦\n╰═══📚Powered by Dtz📚═══╯\n`,

  box: function (title, content) {

    return `${this.header}╔════📖${title}📖════╗\n\n${content}\n\n╚══📖DTZ PASTPAPER BOT📖══╝\n✦ PREPARE SMART, SCORE HIGH ✦\n> BY SL EDUCATION WITH PAPERS\n> A/L EDITION`;

  },

  getForwardProps: function () {

    return {

      contextInfo: {

        forwardingScore: 999,

        isForwarded: true,

        stanzaId: "DTZ" + Math.random().toString(16).substr(2, 12).toUpperCase(),

        mentionedJid: [],

        conversionData: {

          conversionDelaySeconds: 0,

          conversionSource: "dtz_pastpaper",

          conversionType: "message",

        },

      },

    };

  },

  resultEmojis: ["📚", "📝", "✍️", "📖", "✅", "📄", "💡", "🎓", "🔍", "🚀"],

};

cmd({

  pattern: "menu1",

  alias: ["getmenu"],

  react: dtzTheme.resultEmojis[0], // 📚

  desc: "Get command list",

  category: "main",

  filename: __filename,

}, async (robin, mek, m, {

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

}) => {

  try {

    // Validate ALIVE_IMG

    if (!config.ALIVE_IMG) {

      throw new Error("ALIVE_IMG is not defined in config!");

    }

    // Send main menu with buttons

    const menuMessage = await robin.sendMessage(

      from,

      {

        image: { url: config.ALIVE_IMG },

        caption: `${dtzTheme.header}\n⚙️ Click a button below to select a menu category.\n\n┏━━━━━━━━━━━━━━━━━━━━━━━┓\n┃     Powered By: Tharu × Manju   ┃\n┗━━━━━━━━━━━━━━━━━━━━━━━┛`,

        buttons: [{

          buttonId: 'menu_action',

          buttonText: { displayText: `${dtzTheme.resultEmojis[8]} Select Menu` },

          type: 4,

          nativeFlowInfo: {

            name: 'single_select',

            paramsJson: JSON.stringify({

              title: `${dtzTheme.resultEmojis[0]} MANJU-MD Menu`,

              sections: [{

                title: `${dtzTheme.resultEmojis[7]} Menu Categories`,

                rows: [

                  { title: `${dtzTheme.resultEmojis[1]} Main Menu`, description: 'Basic bot commands', id: '1' },

                  { title: `${dtzTheme.resultEmojis[7]} Download Menu`, description: 'Download media files', id: '2' },

                  { title: `${dtzTheme.resultEmojis[5]} Movie Menu`, description: 'Movie-related commands', id: '3' },

                  { title: `${dtzTheme.resultEmojis[8]} 18+ Menu`, description: 'Adult content commands', id: '4' },

                  { title: `${dtzTheme.resultEmojis[4]} Convert Menu`, description: 'Conversion tools', id: '5' },

                  { title: `${dtzTheme.resultEmojis[6]} Search Menu`, description: 'Search functionalities', id: '6' },

                  { title: `${dtzTheme.resultEmojis[9]} Timeline Menu`, description: 'Alarm settings', id: '7' },

                  { title: `${dtzTheme.resultEmojis[2]} Owner Menu`, description: 'Owner-only commands', id: '8' },

                  { title: `${dtzTheme.resultEmojis[3]} Other Command`, description: 'Miscellaneous commands', id: '9' },

                  { title: `${dtzTheme.resultEmojis[7]} Fun Command`, description: 'Fun and entertainment', id: '10' }

                ]

              }]

            })

          }

        }],

        headerType: 1,

        viewOnce: true,

        ...dtzTheme.getForwardProps(),

      },

      { quoted: mek }

    );

    // Store the menu message ID

    const menuMessageId = menuMessage.key.id;

    // Handle menu button replies

    const handleReply = async ({ messages }) => {

      try {

        const msg = messages[0];

        if (!msg.message) return;

        // Debug: Log the entire message object

        console.log("Received message:", JSON.stringify(msg, null, 2));

        // Check if the message is a reply to the menu message

        const isMenuReply = msg.message?.interactiveMessage?.nativeFlowResponse?.name === 'single_select' &&

          msg.message?.interactiveMessage?.contextInfo?.stanzaId === menuMessageId;

        let userReply = null;

        if (isMenuReply) {

          userReply = msg.message.interactiveMessage?.nativeFlowResponse?.paramsJson;

          if (userReply) {

            userReply = JSON.parse(userReply).selectedRowId;

          }

        }

        if (!userReply) {

          await robin.sendMessage(

            msg.key.remoteJid,



            { quoted: msg }

          );

          return;

        }

        // Debug: Log the user reply

        console.log(`User reply: ${userReply}`);

        const categories = {

          "1": `

╭─➤ ⚙️ *Main Commands*  

│  ▸ .alive – Bot status  

│  ▸ .menu – Show all commands  

│  ▸ .ai <text> – Chat with AI  

│  ▸ .system – System information  

│  ▸ .owner – Contact owner   

│  ▸ .ping – Bot connection status 

╰────────────────────────`,

          "2": `

╭─➤ ⬇️ *Download Commands*  

│  ▸ .song <text> – Audio download  

│  ▸ .download <link> – Video download  

│  ▸ .video <text> – YouTube download  

│  ▸ .fb <link> – Facebook video download  

│  ▸ .tiktok <link> – TikTok video download  

│  ▸ .mfire <link> – MediaFire download 

╰─────────────────────────────`,

          "3": `

╭─➤ 🎥 *Movie Commands*  

│  ▸ .film <search> – Sinhala subtitles  

│  ▸ .movie <film name> – SkyMansion movies 

╰────────────────────────────`,

          "4": `

╭─➤ 🔞 *18+ Commands*  

│  ▸ .xnxx <name> – Adult content search  

│  ▸ .xnxxsearch <query> – Adult search  

│  ▸ .xnx search <text> – Adult search 

╰────────────────────────────`,

          "5": `

╭─➤ 🛠️ *Convert Commands*  

│  ▸ .sticker – Image to sticker  

│  ▸ .img – Sticker to image  

│  ▸ .tts <text> – Text to speech  

│  ▸ .currency <text> – Currency converter  

│  ▸ .tr <lang> <text> – Translate 

╰──────────────────────────────`,

          "6": `

╭─➤ 🔍 *Search Commands*  

│  ▸ .img <query> – Search image  

│  ▸ .animegirl <search> – Anime girl image  

│  ▸ .anime <search> – Anime image  

│  ▸ .meme <search> – Generate meme  

│  ▸ .memephoto <search> – Meme text image  

│  ▸ .fact <search> – Fact information  

│  ▸ .weather <city> – Weather information 

╰─────────────────────────────`,

          "7": `

╭─➤ ⏰ *Timeline Alarm Set*  

│  ▸ .remind <setalarm> – Set alarm 

╰─────────────────────────────`,

          "8": `

╭─➤ 👑 *Owner Commands*  

│  ▸ .restart – Restart bot  

│  ▸ .update – Check for updates 

╰────────────────────────────`,

          "9": `

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

          "10": `

╭─➤ 💮 *Fun Commands*  

│  ▸ .sjoke <text> – Sinhala joke  

│  ▸ .joke <text> – Joke search 

╰────────────────────────────`

        };

        if (categories[userReply]) {

          const subMenu = dtzTheme.box(

            `Menu Category ${userReply}`,

            categories[userReply]

          );

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

            { text: "කරුණාකර වලංගු මෙනුවක් තෝරන්න!" },

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

});