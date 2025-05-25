// moviePlugin.js
const { cmd } = require('./Command'); // Import cmd from Command.js
const axios = require('axios');

cmd({
    pattern: 'film',
    desc: 'Search for movies and get Sinhala subtitle links',
    category: 'download',
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd }) => {
    try {
        // Extract search query (remove 'movie' command prefix)
        const query = body.slice(6).trim();
        if (!query) {
            return await conn.sendMessage(from, { text: 'Please provide a movie name to search!' }, { quoted: mek });
        }

        // Make API call to search Sinhala subtitles
        const sinhalasubSearchUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${encodeURIComponent(query)}`;
        const sinhalasubResponse = await axios.get(sinhalasubSearchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://www.dark-yasiya-api.site/',
                'Origin': 'https://www.dark-yasiya-api.site'
            }
        });
        const movies = sinhalasubResponse.data.data || [];

        if (movies.length === 0) {
            return await conn.sendMessage(from, { text: 'No movies with Sinhala subtitles found for your search!' }, { quoted: mek });
        }

        // Prepare response message
        let message = '🎬 *Sinhala Subtitle Search Results* 🎬\n\n';
        const movieList = [];
        for (const [index, movie] of movies.slice(0, 5).entries()) { // Limit to 5 results
            message += `${index + 1}. *${movie.title}*\n`;
            message += `URL: ${movie.url}\n\n`;
            movieList.push({ url: movie.url, title: movie.title });
        }
        message += 'Reply with the number to get the subtitle download link!';

        // Send search results
        const sentMsg = await conn.sendMessage(from, { text: message }, { quoted: mek });

        // Set up reply handler for movie selection
        conn.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (msg.message?.conversation && msg.key.remoteJid === from && msg.message.conversation.match(/^\d+$/)) {
                const selectedIndex = parseInt(msg.message.conversation) - 1;
                if (selectedIndex >= 0 && selectedIndex < movieList.length) {
                    const selectedMovie = movieList[selectedIndex];

                    // Get Sinhala subtitle link using the specified download API
                    const subtitleUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${encodeURIComponent(selectedMovie.url)}`;
                    const subtitleResponse = await axios.get(subtitleUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Accept': 'application/json',
                            'Referer': 'https://www.dark-yasiya-api.site/',
                            'Origin': 'https://www.dark-yasiya-api.site'
                        }
                    });
                    const subtitleData = subtitleResponse.data.data;

                    let downloadMessage = `🎥 *${selectedMovie.title}* Sinhala Subtitle Link\n\n`;
                    if (subtitleData.download) {
                        downloadMessage += `Link: ${subtitleData.download}\n`;
                    } else {
                        downloadMessage += 'No subtitle link available!\n';
                    }

                    await conn.sendMessage(from, { text: downloadMessage }, { quoted: msg });
                }
            }
        });

    } catch (error) {
        console.error(error);
        let errorMessage = 'An error occurred while processing your request!';
        if (error.response) {
            errorMessage += ` API Error: ${error.response.status} - ${error.response.statusText}`;
        }
        await conn.sendMessage(from, { text: errorMessage }, { quoted: mek });
    }
});
