const fetch = require('node-fetch');

module.exports = {
  name: 'film',
  alias: ['movie'],
  desc: 'Cinesubz Movie Downloader',
  category: 'Movie',
  use: '.film <movie name>',
  async exec(msg, conn, args) {
    const query = args.join(' ');
    if (!query) return await msg.reply('📽️ *කරුණාකර චිත්‍රපටයේ නමක් ඇතුළත් කරන්න!*\n\nඋදා: .film Money Heist');

    await msg.react('🎬');
    const searchMsg = await msg.reply('🔍 *සොයමින් පවතී...*');

    let res, html;
    try {
      res = await fetch(`https://cinesubz.pro/?s=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      html = await res.text();
    } catch (e) {
      return await msg.reply('❌ *අන්තර්ජාල දෝෂයක්! සින්නක්කරවෙන්න.*');
    }

    const data = [...html.matchAll(/<h3 class="title"><a href="(.*?)"[^>]*>(.*?)<\/a><\/h3>/g)];
    if (!data.length) return await msg.reply('❌ *චිත්‍රපටය හමු නොවිනි!*');

    let listText = '*🎥 හමු වූ චිත්‍රපට:* \n\n';
    data.slice(0, 5).forEach((m, i) => {
      listText += `*${i + 1}*. ${m[2]}\n`;
    });
    listText += '\nඔබට අවශ්‍ය චිත්‍රපටයේ අංකය කියන්න (උදා: 1)';

    await conn.sendMessage(msg.from, { text: listText }, { quoted: searchMsg });

    let reply1 = await conn.awaitReply(msg.from, msg.sender, 60);
    let selectedIndex1 = parseInt(reply1?.body?.trim()) - 1;
    if (isNaN(selectedIndex1) || selectedIndex1 < 0 || selectedIndex1 >= data.length) {
      return await msg.reply('❌ *වැරදි අංකයකි!*');
    }

    await msg.react('⏳');
    const selectedMovieURL = data[selectedIndex1][1];
    let dlPage;
    try {
      dlPage = await fetch(selectedMovieURL, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(res => res.text());
    } catch (e) {
      return await msg.reply('❌ *Download පිටුව load වෙන්න බැරි වුණා!*');
    }

    const downloadMatches = [...dlPage.matchAll(/<a href="(https:\/\/[^"]+?)"[^>]*>\s*(1080p|720p|480p)[^<]*<\/a>.*?<strong>Size: ([^<]+)<\/strong>/g)];

    if (!downloadMatches.length) {
      return await msg.reply('❌ *බාගත කිරීමේ link හමු නොවිනි!*');
    }

    const jsonResponses = downloadMatches.map(([_, url, quality, fileSize]) => ({
      url,
      quality,
      fileSize
    }));

    let qualityText = '*📥 බාගත කිරීම්:* \n\n';
    jsonResponses.forEach((item, index) => {
      qualityText += `*${index + 1}*. ${item.quality} - ${item.fileSize}\n`;
    });
    qualityText += '\nඔබට අවශ්‍ය එකේ අංකය type කරන්න.';

    await conn.sendMessage(msg.from, { text: qualityText }, { quoted: msg });

    let reply2 = await conn.awaitReply(msg.from, msg.sender, 60);
    let selectedIndex2 = parseInt(reply2?.body?.trim()) - 1;
    if (isNaN(selectedIndex2) || selectedIndex2 < 0 || selectedIndex2 >= jsonResponses.length) {
      return await msg.reply('❌ *වැරදි අංකයකි!*');
    }

    const selected = jsonResponses[selectedIndex2];
    const fileSizeText = selected.fileSize;
    const fileSizeMB = fileSizeText.includes('GB')
      ? parseFloat(fileSizeText) * 1024
      : fileSizeText.includes('MB')
        ? parseFloat(fileSizeText)
        : 0;

    if (!fileSizeMB || isNaN(fileSizeMB)) {
      return await msg.reply('❌ *File size ගණනය කරන්න බැරි වුණා!*');
    }

    if (fileSizeMB > 2048) {
      return await conn.sendMessage(msg.from, {
        text: `⚠️ *File එක විශාලයි: ${fileSizeText}*\n\nඔබට මෙය browser එකෙන් බාගත කළ හැක:\n${selected.url}`,
      }, { quoted: msg });
    }

    await conn.sendMessage(msg.from, {
      document: { url: selected.url },
      fileName: `Cinesubz_${query}_${selected.quality}.mp4`,
      mimetype: 'video/mp4',
      caption: `🎬 *${query}* (${selected.quality})\n📦 Size: ${selected.fileSize}\n\nඅරගෙන යන්න!`,
    }, { quoted: msg });

    await msg.react('✅');
  }
};
