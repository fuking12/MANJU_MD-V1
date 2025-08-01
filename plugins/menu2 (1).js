const config = require('../config')
const {cmd , commands} = require('../command')
const os = require("os")
const {runtime} = require('../lib/functions')

cmd({
    pattern: "menu",
    alias: ["list"],
    desc: "menu the bot",
    react: "📜",
    category: "main"
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let desc = `*👋 Hello ${pushname}*
    
             *ᴍᴀɴᴊᴜ-ᴍᴅ*
*❖╭─────────────···▸*
> *ʀᴜɴᴛɪᴍᴇ* : ${runtime(process.uptime())}
> *ᴍᴏᴅᴇ* : *ᴘᴜʙʟɪᴄ*
> *ᴘʀᴇғɪx* : *.*
> *ʀᴀᴍ ᴜsᴇ* : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB
> *ɴᴀᴍᴇ ʙᴏᴛ*: *ᴍᴀɴᴊᴜ-ᴍᴅ*
> *ᴄʀᴇᴀᴛᴏʀ* : *ᴘᴀᴛʜᴜᴍ ʀᴀᴊᴀᴘᴀᴋsʜᴇ*
> *ᴠᴇʀsɪᴏɴs* : *ᴠ.0.1*
*❖╰────────────···▸▸*
*♡︎•━━━━━━☻︎━━━━━━•♡︎*`;

        const msg = await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/qlier8.jpg" },
            caption: desc,
            buttons: [
                { buttonId: 'show_menu', buttonText: { displayText: 'ᴄʟɪᴄᴋ ᴍᴇɴᴜ' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: mek });

        // Store the message key for context
        const msgKey = msg.key;

        // Handle initial "ᴄʟɪᴄᴋ ᴍᴇɴᴜ" button click
        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.buttonsResponseMessage) return;

            const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;

            if (msg.message.buttonsResponseMessage.contextInfo && msg.message.buttonsResponseMessage.contextInfo.stanzaId === msgKey.id) {
                if (buttonId === 'show_menu') {
                    const menuMsg = await conn.sendMessage(from, {
                        image: { url: "https://files.catbox.moe/qlier8.jpg" },
                        caption: desc,
                        buttons: [
                            { buttonId: 'owner_menu', buttonText: { displayText: 'ᴏᴡᴇɴᴇʀ ᴍᴇɴᴜ ' }, type: 1 },
                            { buttonId: 'convert_menu', buttonText: { displayText: 'ᴄᴏɴᴠᴇʀᴛ ᴍᴇɴᴜ' }, type: 1 },
                            { buttonId: 'ai_menu', buttonText: { displayText: 'ᴀɪ ᴍᴇɴᴜ' }, type: 1 },
                            { buttonId: 'search_menu', buttonText: { displayText: 'sᴇᴀʀᴄʜ ᴍᴇɴᴜ' }, type: 1 },
                            { buttonId: 'download_menu', buttonText: { displayText: 'ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ' }, type: 1 },
                            { buttonId: 'main_menu', buttonText: { displayText: 'ᴍᴀɪɴ ᴍᴇɴᴜ' }, type: 1 },
                            { buttonId: 'group_menu', buttonText: { displayText: 'ɢʀᴏᴜᴘ ᴍᴇɴᴜ' }, type: 1 },
                            { buttonId: 'fun_menu', buttonText: { displayText: 'ғᴜɴ ᴍᴇɴᴜ' }, type: 1 },
                            { buttonId: 'tools_menu', buttonText: { displayText: 'ᴛᴏᴏʟ ᴍᴇɴᴜ' }, type: 1 },
                            { buttonId: 'other_menu', buttonText: { displayText: 'ᴏᴛʜᴇʀ ᴍᴇɴᴜ' }, type: 1 }
                        ],
                        headerType: 1
                    }, { quoted: mek });

                    const menuMsgKey = menuMsg.key;

                    // Handle menu selection
                    conn.ev.on('messages.upsert', async (menuUpdate) => {
                        const menuMsg = menuUpdate.messages[0];
                        if (!menuMsg.message || !menuMsg.message.buttonsResponseMessage) return;

                        const menuButtonId = menuMsg.message.buttonsResponseMessage.selectedButtonId;

                        if (menuMsg.message.buttonsResponseMessage.contextInfo && menuMsg.message.buttonsResponseMessage.contextInfo.stanzaId === menuMsgKey.id) {
                            switch (menuButtonId) {
                                case 'owner_menu':
                                    await reply(`*꧁◈╾───☉ ᴏᴡɴᴇʀ ᴍᴇɴᴜ ☉───╼◈꧂*

╭────────●●►
│ ➽ *setting*
> ʙᴏᴛ ꜱᴇᴛᴛɪɴɇ  ᴄʜᴀɴɇ
│ ➽ *block*
> ᴜꜱᴇʀ ʙʟᴏᴄᴋ
│ ➽ *unblock*
> ʙʟᴏᴄᴋ ᴜꜱᴇʀ  ᴜɴʙʟᴏᴄᴋ
│ ➽ *shutdown*
> ʙᴏᴛ ꜱᴛᴏᴘ
│ ➽ *broadcast*
> ᴀʟʟ ɇʀᴏᴜᴘ ꜱᴇɴᴅ ᴍꜱɇ
│ ➽ *setpp*
> ᴘʀᴏ꜡ɪʟᴇ ᴘɪᴄ ᴄʜᴀɴɇ
│ ➽ *clearchats*
> ᴀʟʟ ᴄʜᴀᴛ ᴄʟᴇᴀʀ 
│ ➽ *jid*
> ᴄʜᴀᴛ ᴊɪᴅ 
│ ➽ *gjid*
> ɇʀᴏᴜᴘ ᴊɪᴅ
│ ➽ *update*
> ʙᴏᴛ ᴜᴘᴅᴀᴛᴇ
│ ➽ *updatecmd*
> ᴜᴘᴅᴀᴛᴇ ʙᴏᴛ ᴄᴏᴍᴍᴀɴᴅ
│ ➽ *x*
> 18+ ᴠɪᴅᴇᴏ ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *movie*
> ᴍᴏᴠɪᴇ ᴅᴀᴡɴʟᴏᴀᴅ 
╰────────────────────●●►


> *© 𝑝𝑜𝑤𝑒𝑟𝑑 𝑏𝑦 𝑚𝑎ɴ𝑗𝑢-𝑚𝑑 ✾*`);
                                    break;
                                case 'convert_menu':
                                    await reply(`*꧁◈╾───☉ ᴄᴏɴᴠᴇʀᴛ ᴍᴇɴᴜ ☉───╼◈꧂*

╭────────●●►
│ ➽ *sticker*
> ᴘʜᴏᴛᴏ ᴄᴏɴᴠᴇʀᴛ ꜱᴛɪᴄᴋᴇʀ
│ ➽ *trt*
> ᴛʀᴀɴꜱʟᴀᴛᴇ ᴛᴇxᴛ ʙᴇᴛᴡᴇᴇɴ  ʟᴀɴɇᴜᴀɇᴇꜱ
│ ➽ *tts*
> ᴅᴀᴡɴʟᴏᴀᴅ ᴛʏᴘᴇ ᴛᴇxᴛ ᴛᴏ ᴠᴏɪᴄᴇ
│ ➽ *vv*
> ᴠɪᴇᴡᴏɴᴄᴇ ᴍᴇꜱꜱᴀɇᴇ ᴀɇɪɴ ᴠɪᴇᴡ
│ ➽ *fancy*
> ᴄᴏɴᴠᴇʀᴛ ᴛᴏ ᴛᴇxᴛ ɪɴᴛᴏ ᴠᴀʀɪᴏᴜꜱ ꜰᴏɴᴛ
│ ➽ *pickupline*
> ɇᴇᴛ ᴀ ʀᴀɴᴅᴏᴍ ᴘɪᴄᴜᴘ ʟɪɴᴇ ᴛʜᴇ ᴀᴘɪ
╰────────────────────●●►


> *© 𝑝𝑜𝑤𝑒𝑟𝑑 𝑏𝑦 𝑚𝑎ɴ𝑗𝑢-𝑚𝑑 ✾*`);
                                    break;
                                case 'ai_menu':
                                    await reply(`*꧁◈╾───☉ ᴀɪ ᴍᴇɴᴜ ☉───╼◈꧂*

╭────────●●►
│ ➽ *ai*
> ᴄʜᴀᴛ ᴀɪ
╰────────────────────●●►


> *© 𝙿𝙾𝚆𝙴𝙰𝚁𝙳 𝙱𝚈 𝚀𝚄𝙴𝙴𝙽 𝚁𝙰𝚂𝙷𝚄 𝙼𝙳 ✾*`);
                                    break;
                                case 'search_menu':
                                    await reply(`*꧁◈╾───☉ ꜱᴇᴀʀᴄʜ ᴍᴇɴᴜ ☉───╼◈꧂*

╭────────●●►
│ ➽ *movie*
> ᴍᴏᴠɪᴇ ꜱᴇᴀʀᴄʜ
│ ➽ *yts*
> ꜱᴇᴀʀᴄʜ ꜰᴏʀ ʏᴏᴜᴛᴜʙᴇ ᴠɪᴅᴇᴏꜱ ᴜꜱɪɴɇ ᴀ Qᴜᴇʀʏ
│ ➽ *save*
> ꜱᴀᴠᴇ ᴀɴᴅ ꜱᴇɴᴅ ʙᴀᴄᴋ ᴀ ᴍᴇᴅɪᴀ ꜰɪʟᴇ ( ɪᴍᴀɇᴇꜱ / ᴠɪᴅᴇᴏ ᴏʀ ᴀᴜᴅɪᴏ )
│ ➽ *news*
> ɇᴇᴛ ᴀ ʟᴀꜱᴛᴇꜱᴛ ɴᴇᴡꜱ ʜᴇᴅʟɪɴᴇꜱ
╰────────────────────●●►


> *© 𝑝𝑜𝑤𝑒𝑟𝑑 𝑏𝑦 𝑚𝑎ɴ𝑗𝑢-𝑚𝑑 ✾*`);
                                    break;
                                case 'download_menu':
                                    await reply(`*꧁◈╾───☉ ᴅᴀᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ ☉───╼◈꧂*

╭────────●●►
│ ➽ *song*
> ʏᴏᴜᴛᴜʙᴇ ꜱᴏɴɇ  ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *play3*
> ʏᴏᴜᴛᴜʙᴇ ꜱᴏɴɇ ᴅᴀᴡɴʟᴏᴀᴅ  
│ ➽ *play2*
> ʏᴏᴜᴛᴜʙᴇ ꜱᴏɴɇ ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *mp3*
> ʏᴏᴜᴛᴜʙᴇ ꜱᴏɴɇ ᴅᴀᴡɴʟᴏᴀᴅ 
│ ➽ *mp4*
> ʏᴏᴜᴛᴜʙᴇ ᴠɪᴅᴇᴏ ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *darama*
> ʏᴏᴜᴛᴜʙᴇ ᴠɪᴅᴇᴏ ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *video*
> ʏᴏᴜᴛᴜʙᴇ ᴠɪᴅᴇᴏ ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *apk*
> ᴘʟᴀʏꜱᴛᴏʀʏ ᴀᴘᴘ ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *tiktok*
> ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *tt*
> ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *fb*
> ꜰᴀᴄᴇʙᴏᴏᴄᴋ ᴠɪᴅᴇᴏ ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *mf*
> ᴍᴇᴅɪᴀꜰɪʀᴇ ʟɪɴᴋ ᴅᴀᴡɴʟᴏᴀᴅ
│ ➽ *ig*
> ɪɴꜱᴛᴀɇʀᴀᴍ ᴠɪᴅᴇᴏ ᴅᴀᴡɴʟᴏᴀᴅ
╰────────────────────●●►


> *© 𝑝𝑜𝑤𝑒𝑟𝑑 𝑏𝑦 𝑚𝑎ɴ𝑗𝑢-𝑚𝑑 ✾*`);
                                    break;
                                case 'main_menu':
                                    await reply(`*꧁◈╾───☉ ᴍᴀɪɴ  ᴍᴇɴᴜ ☉───╼◈꧂*

╭────────●●►
│ ➽ *wiki*
> ꜱᴇᴀʀᴄʜ ᴡɪᴋɪᴘᴇᴅɪᴀ ꜰᴏʀ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ
│ ➽ *env*
> ɇᴇᴛ ʙᴏᴛ ꜱᴇᴛᴛɪɴɇ ʟɪꜱᴛ
│ ➽ *system*
> ᴄʜᴇᴄᴋ ᴜᴘᴛɪᴍᴇ
│ ➽ *ping2 / ping*
> ᴄʜᴇᴄᴋ ʙᴏᴛ ꜱᴘᴇᴇᴅ
│ ➽ *owner*
> ɇᴇᴛ ᴏᴡɴᴇʀ ɴᴜᴍʙᴇʀ
│ ➽ *alive*
> ʙᴏᴛ ᴏɴʟɪɴᴇ ᴄʜᴇᴄᴋ
│ ➽ *list*
> ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅ ᴛᴡᴏ ʟɪꜱᴛ
╰────────────────────●●►


> *© 𝑝𝑜𝑤𝑒𝑟𝑑 𝑏𝑦 𝑚𝑎ɴ𝑗𝑢-𝑚𝑑 ✾*`);
                                    break;
                                case 'group_menu':
                                    await reply(`*꧁◈╾───☉ ɇʀᴏᴜᴘ  ᴍᴇɴᴜ ☉───╼◈꧂*

╭────────●●►
│ ➽ *closetime*
> ᴍᴜᴛᴇ ᴛʜɪꜱ ɇʀᴏᴜᴘ
│ ➽ *opentime*
> ᴜɴᴍᴜᴛᴇ ᴛʜɪꜱ ɇʀᴏᴜᴘ
│ ➽ *kick*
> ʀᴇᴍᴏᴠᴇ ᴏɴᴇ ᴍᴇᴍʙᴇʀꜱ
│ ➽ *kickall*
> ʀᴇᴍᴏᴠᴇ ᴀʟʟ ᴍᴇᴍʙᴇʀꜱ 
│ ➽ *promote*
> ꜱᴇᴛ ᴀᴅᴍɪɴɇ
│ ➽ *demote*
> ᴜɴꜱᴇᴛ ᴀᴅᴍɪɴɇ
│ ➽ *add*
> ᴀᴅᴅ ᴏɴᴇ  ᴍᴇᴍʙᴇʀꜱ
│ ➽ *delete*
> ᴅᴇʟᴇᴛᴇ ᴛʜɪꜱ ᴍᴇꜱꜱᴀɇᴇ
│ ➽ *setname*
> ɇʀᴏᴜᴘ ɴᴀᴍᴇ ᴄʜᴀɴɇ
│ ➽ *tagall*
> ᴛᴀɇ ᴀʟʟ ᴍᴇᴍʙᴀʀꜱ
│ ➽ *tagadmin*
> ᴛᴀɇ ᴀʟʟ  ᴀᴅᴍɪɴɇ
│ ➽ *invite*
> ɇʀᴏᴜᴘ ʟɪɴᴋ ɇᴇɴᴇʀᴀᴛᴛᴇ
│ ➽ *join*
> ᴊᴏɪɴ ᴀ ɇʀᴏᴜᴘ ᴜꜱɪɴɇ ᴏɴ ɪɴᴠɪᴛᴇ ʟɪɴᴋ
│ ➽ *leave*
> ᴍᴀᴋᴇ ᴛʜᴇ ʙᴏᴛ ʟᴇꜰᴛ ᴛʜᴇ ᴄᴜʀʀᴇɴᴛ ɇʀᴏᴜᴘ
│ ➽ *setdesc*
> ᴄʜᴀɴɇ ɇʀᴏᴜᴘ ᴅᴇꜱᴄᴛʀɪᴘᴛɪᴏɴ
│ ➽ *setwelcome*
> ꜱᴇᴛ ᴛʜᴇ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇꜱꜱᴀɇᴇ ꜰᴏʀ ᴛʜᴇ ɇʀᴏᴜᴘ
│ ➽ *setgoodbye*
> ꜱᴇᴛ ᴛʜᴇ ɇᴏᴏᴅ ʙʏᴇ  ᴍᴇꜱꜱᴀɇᴇ ꜰᴏʀ ᴛʜᴇ ɇʀᴏᴜᴘ
╰────────────────────●●►


> *© 𝑝𝑜𝑤𝑒𝑟𝑑 𝑏𝑦 𝑚𝑎ɴ𝑗𝑢-𝑚𝑑 ✾*`);
                                    break;
                                case 'fun_menu':
                                    await reply(`*꧁◈╾───☉ ꜰᴜɴ ᴍᴇɴᴜ ☉───╼◈꧂*

╭────────●●►
│ ➽ *ship*
│ ➽ *dare*
│ ➽ *character*
│ ➽ *fact*
│ ➽ *insult*
│ ➽ *truth*
│ ➽ *pickupline*
│ ➽ *joke*
│ ➽ *dog*
│ ➽ *hack*
│ ➽ *animegirl*
│ ➽ *animegirl1*
│ ➽ *animegirl2*
│ ➽ *animegirl3*
│ ➽ *animegirl4*
│ ➽ *animegirl5*
╰────────────────────●●►


> *© 𝑝𝑜𝑤𝑒𝑟𝑑 𝑏𝑦 𝑚𝑎ɴ𝑗𝑢-𝑚𝑑 ✾*`);
                                    break;
                                case 'tools_menu':
                                    await reply(`*꧁◈╾───☉ ᴛᴏᴏʟꜱ ᴍᴇɴᴜ ☉───╼◈꧂*

╭────────●●►
│ ➽ *tool1*
> ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ ᴏꜰ ᴛᴏᴏʟ 1
│ ➽ *tool2*
> ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ ᴏꜰ ᴛᴏᴏʟ 2
╰────────────────────●●►


> *© 𝑝𝑜𝑤𝑒𝑟𝑑 𝑏𝑦 𝑚𝑎ɴ𝑗𝑢-𝑚𝑑 ✾*`);
                                    break;
                                case 'other_menu':
                                    await reply(`*꧁◈╾───☉ ᴏᴛʜᴇʀ ᴍᴇɴᴜ ☉───╼◈꧂*

╭────────●●►
│ ➽ *anime*
│ ➽ *anime1*
│ ➽ *anime2*
│ ➽ *anime3*
│ ➽ *anime4*
│ ➽ *anime5*
│ ➽ *githubstalk*
│ ➽ *weather*
│ ➽ *fancy*
╰────────────────────●●►


> *© 𝑝𝑜𝑤𝑒𝑟𝑑 𝑏𝑦 𝑚𝑎ɴ𝑗𝑢-𝑚𝑑 ✾*`);
                                    break;
                                default:
                                    await reply("Invalid option. Please select a valid menu🔴");
                            }
                        }
                    });
                }
            }
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply('An error occurred while processing your request.');
    }
});