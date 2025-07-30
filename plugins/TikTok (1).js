const { cmd } = require('../command');

const axios = require('axios');

const config = require('../config');

const { isUrl } = require('../lib/functions');

const DY_SCRAP = require('@dark-yasiya/scrap');

const dy_scrap = new DY_SCRAP();

// ===================

// TikTok Theme Helper

// ===================

const tiktokTheme = {

  header: "🌷 TIKTOK DOWNLOADER 🌷\n✦ Powered by @dark-yasiya/scrap ✦\n",

  caption: (videoData) => `

🎥 *TikTok Video Found!*

*🎬 Title:* ${videoData.title}

*⏰ Duration:* ${videoData.duration}

*👀 Views:* ${videoData.play_count}

*❤️ Likes:* ${videoData.digg_count}

*🔗 Link:* TikTok URL

  `,

  getForwardProps: () => ({

    contextInfo: {

      forwardingScore: 999,

      isForwarded: true,

    },

  }),

};

// ===================

// Main Command

// ===================

cmd({

  pattern: "tiktok",

  alias: ["tt", "ttdl"],

  react: "🌷",

  desc: "Download TikTok videos with quality options",

  category: "download",

  use: ".tiktok <TikTok URL>",

  filename: __filename

}, async (conn, mek, m, { from, q, reply }) => {

  if (!q || !isUrl(q)) {

    return reply("❌ Pʟᴇᴀsᴇ Pʀᴏᴠɪᴅᴇ ᴀ ᴠᴀɪʟᴅ Tɪᴋ ᴛᴏᴋ ᴜʀʟ!");

  }

  try {

    const response = await dy_scrap.tiktok(q);

    if (!response?.status) return reply("❌ Fᴀɪʟᴅ ᴛᴏ Dᴏᴡɴʟᴏᴀᴅ Tɪᴋᴛᴏᴋ Vɪᴅᴇᴏ.");

    const { id, region, title, cover, duration, play, sd, hd, music, play_count, digg_count, comment_count, share_count, download_count, collect_count } = response?.result;

    const msg = await conn.sendMessage(

      from,

      {

        image: { url: cover },

        caption: tiktokTheme.header + tiktokTheme.caption({ title, duration, play_count, digg_count }),

        buttons: [{

          buttonId: 'choose_tiktok_quality',

          buttonText: { displayText: 'CLICK BUTTON ✅' }, // Set to full text

          type: 4,

          nativeFlowInfo: {

            name: 'single_select',

            paramsJson: JSON.stringify({

              title: `CLICK BUTTON ✅`, // Simplified to avoid truncation

              sections: [{

                title: "Select Quality",

                rows: [

                  {

                    title: "📹 SD Video (480p)",

                    description: "Standard Definition Video",

                    id: `.ttsd ${sd} "${title}"`

                  },

                  {

                    title: "🎥 HD Video (720p)",

                    description: "High Definition Video",

                    id: `.tthd ${hd} "${title}"`

                  }

                ]

              }]

            })

          }

        }],

        headerType: 1,

        viewOnce: true,

        ...tiktokTheme.getForwardProps()

      },

      { quoted: mek }

    );

  } catch (e) {

    console.error(e);

    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

    await reply(`❌ *An error occurred:* ${e.message ? e.message : "Error !"}`);

  }

});

// SD Video (480p)

cmd({

  pattern: "ttsd",

  desc: "Send TikTok video as SD",

  hidden: true,

}, async (conn, mek, m, { from, body }) => {

  const match = body.match(/\.ttsd\s+(https?:\/\/[^\s]+)\s+"([^"]+)"/);

  if (!match) return;

  const [ , url, title ] = match;

  try {

    await conn.sendMessage(from, {

      text: "📥 Dᴏᴡɴʟᴏᴀᴅɪɴɢ Sᴅ Vɪᴅᴇᴏ...",

    }, { quoted: mek });

    await conn.sendMessage(from, {

      video: { url },

      caption: `🎥 *Here is your TikTok Video!*\n\n> ${title} (SD 480p)\n> ${config.FOOTER || "Pᴏᴡᴇʀᴅ Bʏ Mᴀɴᴩᴜ_Mᴅ𓇽"}`,

    }, { quoted: mek });

    await conn.sendMessage(from, { text: '➪ Mᴇᴀᴅɪᴀ Uᴩʟᴏᴀᴅᴇᴅ Sᴜᴄᴄᴇssғᴜʟʟʏ' });

  } catch (e) {

    console.error(e);

    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

    await reply("❌ *Error downloading SD video!* Try again.");

  }

});

// HD Video (720p)

cmd({

  pattern: "tthd",

  desc: "Send TikTok video as HD",

  hidden: true,

}, async (conn, mek, m, { from, body }) => {

  const match = body.match(/\.tthd\s+(https?:\/\/[^\s]+)\s+"([^"]+)"/);

  if (!match) return;

  const [ , url, title ] = match;

  try {

    await conn.sendMessage(from, {

      text: "📥 Dᴏᴡɴʟᴏᴀᴅɪɴɢ Hᴅ Vɪᴅᴇᴏ...",

    }, { quoted: mek });

    await conn.sendMessage(from, {

      video: { url },

      caption: `🎥 *Here is your TikTok Video!*\n\n> ${title} (HD 720p)\n> ${config.FOOTER || "Pᴏᴡᴇʀᴅ Bʏ Mᴀɴᴩᴜ_Mᴅ𓇽"}`,

    }, { quoted: mek });

    await conn.sendMessage(from, { text: '➪ Mᴇᴀᴅɪᴀ Uᴩʟᴏᴀᴅᴇᴅ Sᴜᴄᴄᴇssғᴜʟʟʏ' });

  } catch (e) {

    console.error(e);

    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

    await reply("❌ *Error downloading HD video!* Try again.");

  }

});