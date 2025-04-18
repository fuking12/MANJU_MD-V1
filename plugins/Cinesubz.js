const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

// Cinesubz movie downloader command
cmd({
    pattern: "cinesubz",
    desc: "Cinesubz වෙතින් චිත්‍රපට ලින්ක් ලබා ගන්නවා",
    category: "download",
    filename: __filename,
}, async (sock, mek, m, { args, q, reply }) => {
    try {
        if (!q) return reply("කරුණාකර චිත්‍රපටයේ නමක් හෝ search term එකක් දෙන්න! උදා: !cinesubz avengers");

        // Cinesubz search URL (උදාහරණයක්, actual URL එක customize කරන්න)
        const searchTerm = encodeURIComponent(q);
        const url = `https://cinesubz.lk/search?q=${searchTerm}`; // Cinesubz හි search URL එකට ගැලපෙන්න යාවත්කාලීන කරන්න

        // Web page scrape කරනවා
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Movie links ලබා ගන්නවා (Cinesubz හි HTML structure එකට ගැලපෙන්න selector යාවත්කාලීන කරන්න)
        let links = [];
        $('a[href*="download"]').each((i, element) => {
            const href = $(element).attr('href');
            const title = $(element).text().trim() || `Movie ${i + 1}`;
            if (href && href.includes('http')) {
                links.push({ title, href });
            }
        });

        // Results එකතු කරනවා
        if (links.length === 0) {
            return reply("කිසිදු චිත්‍රපට ලින්ක් හමු වුණේ නැහැ. වෙනත් search term එකක් උත්සාහ කරන්න!");
        }

        let response = "🎬 *Cinesubz චිත්‍රපට ලින්ක්*\n\n";
        links.slice(0, 5).forEach((link, index) => { // Limit to 5 results
            response += `${index + 1}. ${link.title}\n🔗 ${link.href}\n\n`;
        });

        // Bot හරහා reply යවනවා
        await reply(response);

    } catch (e) {
        console.error("Error in cinesubz command:", e);
        await reply("දෝෂයක් ඇති වුණා! කරුණාකර පසුව උත්සාහ කරන්න.");
    }
});
