const { cmd, commands } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

// Store user state (in-memory, replace with DB for production)
const userState = new Map();

cmd({
    pattern: "cinesubz",
    desc: "Search, view details, and download movies from Cinesubz",
    react: '🍿',
    category: "media",
}, async (conn, mek, m, { from, args, reply }) => {
    const input = args.join(' ').trim();
    if (!input) return reply('කරුණාකර movie නමක්, number එකක්, හෝ quality number එකක් දෙන්න! උදා: !cinesubz Odela 2024');

    // Check user state
    let state = userState.get(from) || { step: 'search', movies: [], selectedMovie: null, qualities: [] };

    // Step 1: Movie Search
    if (state.step === 'search') {
        try {
            const response = await axios.get(`https://chathurahansaka.netlify.app/?q=${encodeURIComponent(input)}`);
            const $ = cheerio.load(response.data);

            // Extract movie data (adjust selectors based on actual HTML structure)
            const movies = [];
            $('div.movie-item').each((i, elem) => { // Example selector
                const title = $(elem).find('a.title').text().trim() || 'Unknown Title';
                const url = $(elem).find('a.title').attr('href') || 'N/A';
                movies.push({ title, url });
            });

            if (movies.length === 0) {
                return reply('කිසිදු movie එකක් හමුවුණේ නැහැ!');
            }

            // Store movies in user state
            state = { step: 'select_movie', movies, selectedMovie: null, qualities: [] };
            userState.set(from, state);

            let replyText = '🔍 Cinesubz Search Results:\n';
            movies.slice(0, 10).forEach((movie, index) => { // Limit to 10 results
                replyText += `${index + 1}. ${movie.title}\nLink: ${movie.url}\n\n`;
            });
            replyText += 'විස්තර බලන්න: !cinesubz <number> (උදා: !cinesubz 1)';
            await reply(replyText);
        } catch (error) {
            await reply('Search API එකට සම්බන්ධ වෙන්න බැරි වුණා! ආයෙ උත්සාහ කරන්න.');
            console.error('Search Error:', error);
        }
        return;
    }

    // Step 2: Movie Details
    if (state.step === 'select_movie' && /^\d+$/.test(input)) {
        const movieIndex = parseInt(input) - 1;
        if (movieIndex < 0 || movieIndex >= state.movies.length) {
            return reply('වැරදි number එකක්! කරුණාකර valid movie number එකක් දෙන්න.');
        }

        const selectedMovie = state.movies[movieIndex];
        if (!selectedMovie.url.startsWith('https://cinesubz.co')) {
            return reply('කරුණාකර valid cinesubz URL එකක් තෝරන්න!');
        }

        try {
            const response = await axios.get(`https://chathurahansakamvd.netlify.app/mvd?url=${encodeURIComponent(selectedMovie.url)}`);
            const $ = cheerio.load(response.data);

            // Extract movie details (adjust selectors)
            const details = {
                title: $('h1.movie-title').text().trim() || 'N/A',
                description: $('div.description').text().trim() || 'N/A',
                releaseDate: $('span.release-date').text().trim() || 'N/A',
                genre: $('span.genre').text().trim() || 'N/A'
            };

            // Extract quality options (assume available in details response)
            const qualities = [];
            $('div.quality-option').each((i, elem) => { // Example selector
                const quality = $(elem).find('span.quality').text().trim() || `Quality ${i + 1}`;
                const url = $(elem).attr('data-url') || selectedMovie.url; // Assume URL for download
                qualities.push({ quality, url });
            });

            // Update state
            state = { step: 'select_quality', movies: state.movies, selectedMovie, qualities };
            userState.set(from, state);

            let replyText = '🎬 Cinesubz Movie Details:\n';
            replyText += `Title: ${details.title}\n`;
            replyText += `Description: ${details.description}\n`;
            replyText += `Release Date: ${details.releaseDate}\n`;
            replyText += `Genre: ${details.genre}\n\n`;
            replyText += 'Available Qualities:\n';
            qualities.forEach((q, index) => {
                replyText += `${index + 1}. ${q.quality}\n`;
            });
            replyText += 'Download කරන්න: !cinesubz <quality_number> (උදා: !cinesubz 1)';
            await reply(replyText);
        } catch (error) {
            await reply('විස්තර ලබාගන්න බැරි වුණා! ආයෙ උත්සාහ කරන්න.');
            console.error('Details Error:', error);
        }
        return;
    }

    // Step 3: Quality Selection & Download
    if (state.step === 'select_quality' && /^\d+$/.test(input)) {
        const qualityIndex = parseInt(input) - 1;
        if (qualityIndex < 0 || qualityIndex >= state.qualities.length) {
            return reply('වැරදි quality number එකක්! කරුණාකර valid quality number එකක් දෙන්න.');
        }

        const selectedQuality = state.qualities[qualityIndex];
        try {
            const response = await axios.get(`https://chathuramvdl.netlify.app/functions/mvdl?url=${encodeURIComponent(selectedQuality.url)}`);
            const $ = cheerio.load(response.data);

            // Extract download link (adjust selector)
            const downloadLink = $('a.download-link').attr('href') || 'N/A';

            if (downloadLink === 'N/A') {
                return reply('Download link හමුවුණේ නැහැ!');
            }

            // Reset state after download
            userState.delete(from);

            let replyText = '📥 Cinesubz Download Link:\n';
            replyText += `Quality: ${selectedQuality.quality}\n`;
            replyText += `Link: ${downloadLink}\n`;
            replyText += 'නැවත search කරන්න: !cinesubz <movie_name>';
            await reply(replyText);
        } catch (error) {
            await reply('Download link ලබාගන්න බැරි වුණා! ආයෙ උත්සාහ කරන්න.');
            console.error('Download Error:', error);
        }
        return;
    }

    // If input doesn't match expected format
    await reply('වැරදි input! Search කරන්න: !cinesubz <movie_name>, Movie select කරන්න: !cinesubz <number>, Quality select කරන්න: !cinesubz <quality_number>');
});
