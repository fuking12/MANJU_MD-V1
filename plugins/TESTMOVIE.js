const { cmd } = require('./Command.js');
const axios = require('axios');

cmd({
    pattern: 'movie6',
    desc: 'සිංහල උපසිරැසි ඇති චිත්‍රපට සෙවීමට සහ ඩවුන්ලෝඩ් ලින්ක් ගන්න',
    category: 'media',
    filename: 'SinhalaSubMoviePlugin.js',
    fromMe: false
}, async (Void, citel, text) => {
    try {
        // Text එක තිබේදැයි බලනවා
        if (!text) {
            return await citel.reply('කරුණාකර චිත්‍රපටයක නමක් හෝ URL එකක් දෙන්න. උදා: !movie deadpool හෝ !movie https://sinhalasub.lk/movies/deadpool-wolverine-2024-sinhala-subtitles/');
        }

        const input = text.trim();

        // URL එකක්ද බලනවා (https://sinhalasub.lk/ එකකින් ආරම්භ වෙනවාද කියලා)
        if (input.startsWith('https://sinhalasub.lk/')) {
            // Download API එකට request එක යවනවා
            const downloadApiUrl = 'https://www.dark-yasiya-api.site/movie/sinhalasub/movie';
            const response = await axios.get(downloadApiUrl, {
                params: { url: input }
            });

            // API response එකේ ඩවුන්ලෝඩ් ලින්ක් එක තිබේදැයි බලනවා
            if (response.data && response.data.downloadLink) {
                await citel.reply(`ඩවුන්ලෝඩ් ලින්ක් එක: ${response.data.downloadLink}`);
            } else {
                await citel.reply('ඩවුන්ලෝඩ් ලින්ක් එක ගන්න බැරි වුණා. URL එක බලලා නැවත උත්සාහ කරන්න.');
            }
        } else {
            // Search API එකට request එක යවනවා
            const searchApiUrl = 'https://www.dark-yasiya-api.site/movie/sinhalasub/search';
            const response = await axios.get(searchApiUrl, {
                params: { text: input }
            });

            // API response එකේ results තිබේදැයි බලනවා
            if (response.data && response.data.results && response.data.results.length > 0) {
                let reply = '🔍 චිත්‍රපට සෙවීමේ ප්‍රතිඵල:\n\n';
                response.data.results.slice(0, 5).forEach((movie, index) => {
                    reply += `${index + 1}. ${movie.title}\n📌 URL: ${movie.url}\n\n`;
                });
                reply += 'ඩවුන්ලෝඩ් කිරීමට, URL එකක් !movie <url> ලෙස යවන්න. උදා: !movie https://sinhalasub.lk/movies/deadpool-wolverine-2024-sinhala-subtitles/';
                await citel.reply(reply);
            } else {
                await citel.reply('චිත්‍රපටයක් හමු වුණේ නැහැ. නම බලලා නැවත උත්සාහ කරන්න.');
            }
        }
    } catch (error) {
        console.error('චිත්‍රපට ඩවුන්ලෝඩ් කිරීමේදී දෝෂයක්: ', error);
        await citel.reply('ඔබේ ඉල්ලීම process කිරීමේදී දෝෂයක් ඇති වුණා. නැවත උත්සාහ කරන්න.');
    }
});
