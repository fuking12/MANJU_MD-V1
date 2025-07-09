
const {cmd , commands} = require('../lib/command')
const os = require("os")
const axios = require("axios")
const{getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
  pattern: 'sinhalasub1',
  react: '🔎',
  category: 'sinhalasub.lk movie search',
  alias: ['sinhalasub'],
  desc: 'Search movies from sinhalasub.lk',
  use: '.sinhalasub 2025',
  filename: __filename
}, async (m, text, msg, { from, q, prefix, isMe, reply }) => {
  try {
    if (!q) return reply("*please give me text !..*");

    let res = await fetchJson(`https://darksadas-yt-sinhalasub-search.vercel.app/?q=${q}`);
    if (!res || !res.result || res.result.length === 0)
      return await m.sendMessage(from, { text: "*No results found ❌*" }, { quoted: msg });

    let rows = res.result.map(item => ({
      title: item.title.replace("Sinhala Subtitles | සිංහල උපසිරසි සමඟ", ''),
      description: '',
      rowId: prefix + "sininfo " + item.link
    }));

    let section = [{
      title: "Search Results",
      rows
    }];

    const listMsg = {
      text: `_*SINHALASUB MOVIE SEARCH RESULTS 🎬*_\n\n*Input:* ${q}`,
      footer: config.FOOTER,
      title: "Search Results",
      buttonText: "Select Movie",
      sections: section
    };

    await m.replyList(from, listMsg, { quoted: msg });

  } catch (err) {
    reply("Error: " + err);
    console.log(err);
  }

cmd({
  pattern: 'sininfo',
  react: '🎬',
  category: 'sinhalasub.lk movie search',
  alias: ['sinhalasub'],
  desc: 'Search movies from sinhalasub.lk',
  use: '.sinhalasub 2025',
  filename: __filename
}, async (m, text, msg, { from, q, prefix, isMe, reply }) => {
  try {
    if (!q) return reply("*please give me text !..*");

    let res = await fetchJson(`https://suhas-bro-api.vercel.app/movie/sinhalasub/movie?url=${q}`);
    if (!res || !res.result || res.result.length === 0)
      return await m.sendMessage(from, { text: "*No results found ❌*" }, { quoted: msg });

const movies = res.result.data;
const downloadOptions = movies.pixeldrain_dl.map((link, index) => ({
        title: index + 1,
        description: `${link.quality} | ${link.size}`,
        rowId: prefix + ("sindl " + link.link)
      }));



     const sections = [{
      title: `*╭─[SOLO-LEVELING  MOVIE INFO]*`,
      rows: downloadOptions
    }];

    const listMessage = {
      image: { url: movies.image },
      text: `☘️ Tιтle ➜* *${movies.title}*\n*📆 Rᴇʟᴇᴀꜱᴇ ➜* _${movies.date}_\n*⭐ Rᴀᴛɪɴɢ ➜* _${movies.tmdbRate}_\n*🌎 Cᴏᴜɴᴛʀʏ ➜* _${movies.country}_\n*💁‍♂️ Dɪʀᴇᴄᴛᴏʀ ➜* _${movies.subtitle_author}_\n\n*📰 Dɪꜱᴄʀɪᴘᴛɪᴏɴꜱ ➜* _${movies.description}_`,
      footer: config.FOOTER,
      title: "",
      buttonText: "🔢 Reply with a number below",
      sections: sections
    };

    const listOptions = {
      quoted: message
    };

    return await m.replyList(from, listMessage, listOptions);
  } catch (err) {
    console.error(err);
    reply("❌ Error fetching data from sinhalasub.lk");
  }
});
