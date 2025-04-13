const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  name: 'sinhalasub',
  alias: ['ssub', 'slsub'],
  desc: 'SinhalaSub.LK චිත්‍රපට සෙවීම සහ බාගත කිරීම',
  category: 'Movie Downloader',
  use: '.sinhalasub <චිත්‍රපට නම>',
  async exec(m, sock, args) {
    const query = args.join(' ');
    if (!query) {
      return m.reply('කරුණාකර සෙවීමට අවශ්‍ය චිත්‍රපට නමක් ලබාදෙන්න.\n\nඋදා: *.sinhalasub Avengers*');
    }

    const searchUrl = `https://www.sinhalasub.lk/?s=${encodeURIComponent(query)}`;
    try {
      const res = await axios.get(searchUrl);
      const $ = cheerio.load(res.data);
      const results = [];

      $('.post-title').each((i, el) => {
        const title = $(el).text().trim();
        const link = $(el).find('a').attr('href');
        if (title && link) {
          results.push({ title, link });
        }
      });

      if (results.length === 0) {
        return m.reply('කණගාටුයි, ඔබ සෙවූ චිත්‍රපටය Sinhalasub.lk හි සොයාගත නොහැක.');
      }

      const buttons = results.slice(0, 5).map((movie, index) => ({
        buttonId: `.sslink ${movie.link}`,
        buttonText: { displayText: `${index + 1}. ${movie.title}` },
        type: 1,
      }));

      await sock.sendMessage(m.chat, {
        text: `🎬 *ඔබ සෙවූ "${query}" සඳහා ලැබුණු Sinhalasub.lk ප්‍රතිඵල පහත දැක්වේ:*\n\n*එක් බොත්තමක් ඔබන්න චිත්‍රපටය විවෘත කිරීමට!*`,
        buttons,
        footer: 'Sinhalasub Movie Finder',
        headerType: 1,
      }, { quoted: m });

    } catch (err) {
      console.error(err);
      return m.reply('දෝෂයක් සිදු විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.');
    }
  }
};
