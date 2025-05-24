const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    pattern: 'cinsubz',
    fromMe: false,
    desc: 'Cinsubz/Cinesubz වෙතින් චිත්‍රපට බාගත කිරීම',
    category: 'download',
    function: async (sock, mek, m, { reply, args }) => {
        try {
            const query = args.join(' ');
            
            if (!query) {
                return await reply('❌ භාවිතය: !cinsubz චිත්‍රපට නම\nඋදාහරණය: !cinsubz avatar');
            }

            // Step 1: Search for movies
            await reply('🔍 චිත්‍රපට සොයමින්...');
            const searchUrl = `https://cinsubz.co/?s=${encodeURIComponent(query)}`;
            const { data: searchHtml } = await axios.get(searchUrl);
            const $ = cheerio.load(searchHtml);

            // Extract search results
            const results = [];
            $('.ml-item').each((i, element) => {
                const title = $(element).find('.mli-info h2').text().trim();
                const url = $(element).find('a').attr('href');
                const img = $(element).find('img').attr('data-original');
                if (title && url) {
                    results.push({ title, url, img });
                }
            });

            if (results.length === 0) {
                return await reply('❌ චිත්‍රපටය හමු නොවීය. වෙනත් නමක් උත්සාහ කරන්න.');
            }

            // Send first 3 results
            let resultText = '🎬 හමු වූ චිත්‍රපට:\n\n';
            results.slice(0, 3).forEach((item, index) => {
                resultText += `${index+1}. ${item.title}\n`;
            });
            resultText += '\nඔබට අවශ්‍ය චිත්‍රපටයේ අංකය යවන්න (1-3)';

            await reply(resultText);

            // Wait for user response
            const selected = await waitForNumberInput(sock, m, 3);
            if (!selected) {
                return await reply('⏰ කාලය ඉක්මවී ඇත. නැවත උත්සාහ කරන්න.');
            }

            const movie = results[selected-1];
            
            // Step 2: Get both Cinsubz and Cinesubz download links
            await reply(`📥 ${movie.title} චිත්‍රපටයේ සබැඳි ලබා ගනිමින්...`);
            
            // Cinesubz API භාවිතා කර 480p ලින්ක් එක ලබා ගැනීම
            const cinesubzLink = `https://cinesubz.co/api-rwjdzuehbdrwjdzuehbdzjyvxo2bhh0azjyvxo2bhh0auehbdruehbdrwjdzuehbdzjyvxo2bhh0azjyvxo2bhh0auehbdrwjdzuehbwjdzuehbdzjyvxo2bhh0azjyvxo2bhh0a/rvyack3cs5/${encodeURIComponent(movie.title)}.mp4`;
            
            // Cinsubz ඩවුන්ලෝඩ් ලින්ක් ලබා ගැනීම
            const { data: movieHtml } = await axios.get(movie.url);
            const $$ = cheerio.load(movieHtml);
            
            const cinsubzLinks = [];
            $$('.dowloads a').each((i, element) => {
                const quality = $$(element).text().trim();
                const url = $$(element).attr('href');
                cinsubzLinks.push({ quality, url });
            });

            // Send all download options
            let linksText = `📥 ${movie.title} - බාගත කිරීමේ සබැඳි:\n\n`;
            linksText += `1. [Cinesubz] 480p ඩවුන්ලෝඩ්\n${cinesubzLink}\n\n`;
            
            cinsubzLinks.forEach((link, index) => {
                linksText += `${index+2}. [Cinsubz] ${link.quality}\n${link.url}\n\n`;
            });

            linksText += 'ඔබගේ බ්‍රව්සරයෙන් බාගත කර ගන්න.';
            await reply(linksText);

        } catch (error) {
            console.error('දෝෂය:', error);
            await reply('❌ චිත්‍රපටය බාගත කිරීමට අසමත් විය. කරුණාකර පසුව උත්සාහ කරන්න.');
        }
    }
};

// Helper function to wait for user input
async function waitForNumberInput(sock, originalMsg, maxNumber) {
    return new Promise((resolve) => {
        const listener = async (response) => {
            if (response.key.remoteJid === originalMsg.key.remoteJid && 
                !response.key.fromMe &&
                response.message) {
                const num = parseInt(response.message.conversation);
                if (!isNaN(num) && num >= 1 && num <= maxNumber) {
                    sock.ev.off('messages.upsert', listener);
                    resolve(num);
                }
            }
        };
        
        sock.ev.on('messages.upsert', listener);
        
        // 1 minute timeout
        setTimeout(() => {
            sock.ev.off('messages.upsert', listener);
            resolve(null);
        }, 60000);
    });
                     }
