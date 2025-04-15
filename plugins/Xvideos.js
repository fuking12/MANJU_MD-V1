const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');
const { download } = require('../lib/msg'); // your existing download handler
const fs = require('fs');

cmd({
  pattern: 'xnxx',
  desc: 'Download XNXX video',
  category: 'downloader',
  filename: __filename,
  use: '.xnxx link',
}, async (client, m, text) => {
  if (!text.includes('xnxx')) return m.reply('ලින්ක් එකක් ලබාදෙන්න. උදා: `.xnxx https://www.xnxx.com/video-abc123`');
  try {
    m.reply('⬇️ වීඩියෝව බාගන්නවා...');
    const res = await axios.get(`https://xnxxdl.vercel.app/api?url=${encodeURIComponent(text)}`);
    if (!res.data || !res.data.url) return m.reply('වීඩියෝව ලබාගන්න බැරිවුණා.');
    await client.sendMessage(m.chat, { video: { url: res.data.url }, caption: res.data.title }, { quoted: m });
  } catch (e) {
    console.log(e);
    m.reply('බාගත කිරීමේ දෝෂයක් ඇතිවුණා.');
  }
});

cmd({
  pattern: 'ph',
  desc: 'Download Pornhub video',
  category: 'downloader',
  filename: __filename,
  use: '.ph link',
}, async (client, m, text) => {
  if (!text.includes('pornhub')) return m.reply('Pornhub ලින්ක් එකක් දෙන්න. උදා: `.ph https://www.pornhub.com/view_video.php?viewkey=xxx`');
  try {
    m.reply('⬇️ වීඩියෝව බාගන්නවා...');
    const res = await axios.get(`https://phdownloader.vercel.app/api?url=${encodeURIComponent(text)}`);
    if (!res.data?.url) return m.reply('වීඩියෝව download කරගන්න බැරිවුණා.');
    await client.sendMessage(m.chat, { video: { url: res.data.url }, caption: res.data.title }, { quoted: m });
  } catch (e) {
    console.log(e);
    m.reply('බාගත කිරීමේදී දෝෂයක් ඇත.');
  }
});

cmd({
  pattern: 'sx',
  desc: 'Download Sussex video',
  category: 'downloader',
  filename: __filename,
  use: '.sx link',
}, async (client, m, text) => {
  if (!text.includes('sussextube')) return m.reply('SussexTube ලින්ක් එකක් දෙන්න. උදා: `.sx https://sussextube.com/video/123abc`');
  try {
    m.reply('⬇️ Sussex වීඩියෝව බාගත වෙමින්...');
    const res = await axios.get(`https://sussexdl.vercel.app/api?url=${encodeURIComponent(text)}`);
    if (!res.data?.url) return m.reply('වීඩියෝව ලබාගැනීම අසාර්ථකයි.');
    await client.sendMessage(m.chat, { video: { url: res.data.url }, caption: res.data.title }, { quoted: m });
  } catch (e) {
    console.log(e);
    m.reply('බාගත කිරීමේදී දෝෂයක් තිබුණා.');
  }
});
