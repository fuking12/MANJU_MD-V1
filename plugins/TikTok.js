
const axios = require('axios');

const config = require('../config');

const { cmd } = require('../command');

const { isUrl } = require('../lib/functions');

const DY_SCRAP = require('@dark-yasiya/scrap');

const dy_scrap = new DY_SCRAP();

cmd({

    pattern: "tiktok",

    alias: ["tt", "ttdl"],

    react: "🌷",

    desc: "Download TikTok videos",

    category: "download",

    use: ".tiktok <TikTok URL>",

    filename: __filename

}, async (conn, m, mek, { from, q, reply }) => {

    try {

        

        if (!q || !isUrl(q)) {

            return await reply("❌ Pʟᴇᴀsᴇ Pʀᴏᴠɪᴅᴇ ᴀ ᴠᴀɪʟᴅ Tɪᴋ ᴛᴏᴋ ᴜʀʟ!");

        }

        const response = await dy_scrap.tiktok(q);

        if(!response?.status) return await reply("❌ Fᴀɪʟᴅ ᴛᴏ Dᴏᴡɴʟᴏᴀᴅ Tɪᴋᴛᴏᴋ Vɪᴅᴇᴏ.");

        const { id, region, title, cover, duration, play, sd, hd, music, play_count, digg_count, comment_count, share_count, download_count, collect_count } = response?.result;

        

       let info = `🍒 *𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥* 🍒\n\n` +

           `🎵 *𝗧𝗜𝗧𝗟𝗘:* ${title}\n` +

           `⏳ *𝗗𝗨𝗥𝗔𝗧𝗜𝗢𝗡:* ${duration}\n` +

           `👀 *𝗩𝗜𝗘𝗪𝗦:* ${play_count}\n` +

           `❤️ *𝗟𝗜𝗞𝗘𝗦:* ${digg_count}\n\n` +

           `🔽 *Choose the quality:*\n` +

           `1️⃣ *𝗦𝗗 𝗩𝗜𝗗𝗘𝗢* 📹\n` +

           `2️⃣ *𝗛𝗗 𝗩𝗜𝗗𝗘𝗢* 🎥\n\n` +

           `${config.FOOTER || "Pᴏᴡᴇʀᴅ Bʏ Mᴀɴᴊᴜ_Mᴅ𓇽"}`;

        const sentMsg = await conn.sendMessage(from, { image: { url: cover }, caption: info }, { quoted: mek });

        const messageID = sentMsg.key.id;

        await conn.sendMessage(from, { react: { text: '🎥', key: sentMsg.key } });

        // Event listener to capture reply

        conn.ev.on('messages.upsert', async (messageUpdate) => {

            const mekInfo = messageUpdate?.messages[0];

            if (!mekInfo?.message) return;

            const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;

            const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToSentMsg) {

                let userReply = messageType.trim();

                let videoUrl = "";

                let msg = '';

                if (userReply === "1") {

                    msg = await conn.sendMessage(from, { text: "📥 Dᴏᴡɴʟᴏᴀᴅɪɴɢ Sᴅ Vɪᴅᴇᴏ..." }, { quoted: mek });

                    videoUrl = sd;

                } else if (userReply === "2") {

                    msg = await conn.sendMessage(from, { text: "📥 Dᴏᴡɴʟᴏᴀᴅɪɴɢ Hᴅ Vɪᴅᴇᴏ..." }, { quoted: mek });

                    videoUrl = hd;

                } else {

                    return await reply("❌ Invalid choice! Reply with 1️⃣ or 2️⃣.");

                }

                // Send the selected video

                await conn.sendMessage(from, {

                    video: { url: videoUrl },

                    caption: `🎥 *Here is your TikTok Video!*\n\n> ${title}`

                }, { quoted: mek });

                await conn.sendMessage(from, { text : '➪ Mᴇᴀᴅɪᴀ Uᴘʟᴏᴀᴅᴇᴅ Sᴜᴄsᴜsғᴜʟʟʏ' , edit : msg.key })

            }

        });

    } catch (e) {

        console.log(e);

        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

        await reply(`❌ *An error occurred:* ${e.message ? e.message : "Error !"}`);

    }

});