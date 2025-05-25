const {cmd , commands} = require('../command'
const fg = require('api-dylux')
const yts = require('yt-search')

cmd({
    pattern: "audio",
    desc: "download songs",
    react: '🎶',
    category: "download",
    filename: __filename
},
async(robin, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if(!p) return reply ("please give me url or title")
const search = await yts(p)  
const data = search.video[0];
const url = data.ur

let desc = `
🎵 *MANJU_MD SONG DOWNLOADER* 🎵

title: ${data.title}
description: ${data.description}
time: ${data.timestamp}
ago: ${data.ago}
views: ${data.views}

MADE BY MANJU_MD V1✅
`
await conn.sendMessage(from,{image:{url: data.thumbnail},caption:desc},{quoted:mek});

//download audio

let down = await fg.yta(url)
let downloadurl = down.dl_url

//send audio massage
await conn.sendMessage(from,{audio: {url:downloadurl},mimetype:"audio/mpeg"},{quoted:mek})
  

}catch(e){
console.log(e)
reply(`${e}`)
}
})
  
