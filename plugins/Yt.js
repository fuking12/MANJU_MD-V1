const { cmd } = require('../command');
const axios = require('axios');
const ytdl = require('ytdl-core');

cmd({
  pattern: 'yt',
  desc: 'Download YouTube video',
  category: 'downloader',
  filename: __filename,
  use: '.yt <youtube link>',
}, async (client, m, info) => {
  const text = info || m.text || ''; // Fix: Get text safely

  if (!text || !text.includes('youtu')) {
    return m.reply('කරුණාකර YouTube ලින්ක් එකක් ලබාදෙන්න. උදා: `.yt https://youtu.be/abc123`');
  }

  try {
    const videoInfo = await ytdl.getInfo(text);
    const title = videoInfo.videoDetails.title;
    const thumbnail = videoInfo.videoDetails.thumbnails.pop().url;
    const formats = ytdl.filterFormats(videoInfo.formats, 'videoandaudio');

    const format = formats.find(f => f.container === 'mp4' && f.hasAudio && f.hasVideo && f.qualityLabel === '360p') || formats[0];
    const fileSizeMB = format.contentLength ? (parseInt(format.contentLength) / 1048576).toFixed(2) : 'Unknown';

    if (parseFloat(fileSizeMB) > 150 && process.env.PLATFORM !== 'vps') {
      return m.reply(`⚠️ විශාල ගොනු වේ. ${fileSizeMB}MB. VPS එකක් අවශ්‍යයි.`);
    }

    await client.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `📥 *YouTube Download*\n\n🎬 *Title:* ${title}\n📦 *Size:* ${fileSizeMB}MB\n\nවීඩියෝව එවමින්...`,
    }, { quoted: m });

    await client.sendMessage(m.chat, {
      video: { url: format.url },
      caption: `🎬 ${title}`,
    }, { quoted: m });

  } catch (err) {
    console.log(err);
    m.reply('❌ වීඩියෝව බාගත කිරීමේ දෝෂයක් ඇතිවුණා.');
  }
});
