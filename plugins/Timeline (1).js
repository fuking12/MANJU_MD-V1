const { cmd } = require('../command');

const schedule = require('node-schedule');

cmd({

    pattern: "remind",

    desc: "Set a reminder for an event.",

    alias: ["reminder"],

    category: "utility",

    react: "⏰",

    filename: __filename

}, async (conn, mek, m, { from, q, reply }) => {

    try {

        const args = q.split('|');

        if (args.length < 2) return reply("කරුණාකර event එක සහ වෙලාව ඇතුලත් කරන්න. උදා: .remind Meeting | 2025-04-22 10:00");

        const event = args[0].trim();

        const dateTime = new Date(args[1].trim());

        if (isNaN(dateTime)) return reply("කරුණාකර වලංගු date සහ time එකක් දෙන්න. Format: YYYY-MM-DD HH:mm");

        schedule.scheduleJob(dateTime, async () => {

            const reminderMessage = `⏰ *Reminder*\n\n*Event:* ${event}\n*Time:* ${dateTime.toLocaleString()}\n\n*© MANJU MD Bot*`;

            await conn.sendMessage(from, {

                text: reminderMessage,

                contextInfo: {

                    forwardingScore: 999,

                    isForwarded: true,

                    forwardedNewsletterMessageInfo: {

                        newsletterName: 'MANJU_MD ALARM ',

                        newsletterJid: "",

                    },

                    externalAdReply: {

                        title: '𝗠𝗔𝗡𝗝𝗨 𝗠𝗗 𝗧𝗜𝗠𝗘 𝗔𝗟𝗔𝗥𝗠 𝗕𝗢𝗧✳️',

                        body: 'ᴀ ᴍᴀɴᴊᴜ ᴍᴅ ᴡᴀ ʙᴏᴛ ʙᴇꜱᴇᴅ ᴏɴ ʙᴀɪʏʟᴇꜱ',

                        mediaType: 1,

                        sourceUrl: "https://youtu.be/xSArkTWDXBs?si=447mUzkhuNcjvRYK",

                        thumbnailUrl: 'https://i.ibb.co/wsRfxsf/IMG-20241220-WA0008.jpg',

                        renderLargerThumbnail: false,

                        showAdAttribution: true

                    }

                }

            });

        });

        await conn.sendMessage(from, {

            text: `⏰ Reminder set for "${event}" on ${dateTime.toLocaleString()}!`,

            react: { text: '✅', key: mek.key }

        });

    } catch (error) {

        console.error('Reminder error:', error.message);

        await conn.sendMessage(from, {

            react: { text: '❌', key: mek.key }

        });

        reply("Reminder set කිරීමේදී දෝෂයක් ඇති වුණා. කරුණාකර පසුව උත්සාහ කරන්න.");

    }

});