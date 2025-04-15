const { cmd } = require('../command.js');
const ytdl = require('ytdl-core');
const axios = require('axios');

cmd({
  pattern: 'yt',
  desc: 'Download YouTube video with thumbnail and button',
  category: 'downloader',
  filename: __filename,
  use: '.yt <YouTube link>',
}, async (client, m, text) => {

  if (!text || typeof text !== 'string' || !text.includes('youtu')) {
    return m.reply('කරුණාකර YouTube ලින්ක් එකක් ලබාදෙන්න.\n\nඋදා: `.yt https://youtu.be/dQw4w9WgXcQ`');
  }

  try {
    const info = await ytdl.getInfo(text);
    const title = info.videoDetails.title;
    const author = info.videoDetails.author.name;
    const thumb = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;

    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
    const format = formats.find(f => f.container === 'mp4' && f.hasAudio && f.hasVideo);
    const downloadUrl = format.url;

    await client.sendMessage(m.chat, {
      image: { url: thumb },
      caption: `*Video Title:* ${title}\n*Channel:* ${author}`,
      footer: 'ඔබට බාගත කිරීමට "Download" බොත්තම ක්ලික් කරන්න',
      buttons: [
        {
          buttonId: `.ytmp4 ${downloadUrl}`,
          buttonText: { displayText: 'Download' },
          type: 1,
        },
      ],
      headerType: 4,
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply('වැරදි YouTube ලින්ක් එකක්දැයි පරීක්ෂා කරන්න!');
  }
});
