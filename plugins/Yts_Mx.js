// moviePlugin.js
const { cmd } = require('./Command'); // Import cmd from Command.js
const axios = require('axios');

cmd({
    pattern: 'movie',
    desc: 'Search and download movies',
    category: 'download',
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd }) => {
    try {
        // Extract search query (remove 'movie' command prefix)
        const query = body.slice(6).trim();
        if (!query) {
            return await conn.sendMessage(from, { text: 'Please provide a movie name or year to search!' }, { quoted: mek });
        }

        // Make API call to search movies
        const searchUrl = `https://www.dark-yasiya-api.site/movie/ytsmx/search?text=${encodeURIComponent(query)}`;
        const searchResponse = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        const movies = searchResponse.data.data.movies;

        if (!movies || movies.length === 0) {
            return await conn.sendMessage(from, { text: 'No movies found for your search!' }, { quoted: mek });
        }

        // Prepare response message
        let message = '🎬 *Movie Search Results* 🎬\n\n';
        const movieList = movies.slice(0, 5); // Limit to 5 results

        for (const [index, movie] of movieList.entries()) {
            message += `${index + 1}. *${movie.title}* (${movie.year})\n`;
            message += `Rating: ${movie.rating}/10\n`;
            message += `ID: ${movie.id}\n\n`;
        }
        message += 'Reply with the movie number to get download links!';

        // Send search results
        const sentMsg = await conn.sendMessage(from, { text: message }, { quoted: mek });

        // Set up reply handler for movie selection
        conn.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (msg.message?.conversation && msg.key.remoteJid === from && msg.message.conversation.match(/^\d+$/)) {
                const selectedIndex = parseInt(msg.message.conversation) - 1;
                if (selectedIndex >= 0 && selectedIndex < movieList.length) {
                    const selectedMovie = movieList[selectedIndex];
                    const movieId = selectedMovie.id;

                    // Get download links with browser-like headers
                    const downloadUrl = `https://www.dark-yasiya-api.site/movie/ytsmx/movie?id=${movieId}`;
                    const downloadResponse = await axios.get(downloadUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Accept': 'application/json',
                            'Referer': 'https://www.dark-yasiya-api.site/',
                            'Origin': 'https://www.dark-yasiya-api.site'
                        }
                    });
                    const movieData = downloadResponse.data.data.movie;

                    let downloadMessage = `🎥 *${movieData.title}* Download Links\n\n`;
                    if (movieData.torrents) {
                        movieData.torrents.forEach((torrent, i) => {
                            downloadMessage += `${i + 1}. Quality: ${torrent.quality}\n`;
                            downloadMessage += `Size: ${torrent.size}\n`;
                            downloadMessage += `Link: ${torrent.url}\n\n`;
                        });
                    } else {
                        downloadMessage += 'No download links available!';
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
