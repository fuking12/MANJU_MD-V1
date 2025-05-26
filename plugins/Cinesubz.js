const { cmd, commands } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

// Store user state (in-memory)
const userState = new Map();

cmd({
    pattern: "cinesubz",
    desc: "Search, view details, and download movies from Cinesubz",
    react: '🍿',
    category: "media",
}, async (conn, mek, m, { from, args, reply }) => {
    const input = args.join(' ').trim();
    if (!input) return reply('කරුණාකර movie නමක්, number එකක්, හෝ quality number එකක් දෙන්න! උදා: !cinesubz Odela 2024');

    let state = userState.get(from) || { step: 'search', movies: [], selectedMovie: null, qualities: [] };

    // Step 1: Movie Search
    if (state.step === 'search') {
        try {
            const response = await axios.get(`https://chathurahansaka.netlify.app/?q=${encodeURIComponent(input)}`, { timeout: 10000 });
            const $ = cheerio.load(response.data);

            // Try multiple selectors to extract movies
            const movies = [];
            $('div[class*="movie"], li[class*="movie"], .movie-item, .movie-card, .result').each((i, elem) => {
                const title = $(elem).find('a[class*="title"], .movie-title, h2, h3, a[href*="cinesubz"]').text().trim() || `Movie ${i + 1}`;
                const url = $(elem).find('a[class*="title"], .movie-title, a[href*="cinesubz"]').attr('href') || '';
                if (url && url.startsWith('https://cinesubz.co')) {
                    movies.push({ title, url });
                }
            });

            if (movies.length === 0) {
                return reply('කිසිදු movie එකක් හමුවුණේ නැහැ! Query එක බලලා ආයෙ උත්සාහ කරන්න (උදා: !cinesubz Odela 2).');
            }

            state = { step: 'select_movie', movies, selectedMovie: null, qualities: [] };
            userState.set(from, state);

            let replyText = '🔍 Cinesubz Search Results:\n';
            movies.slice(0, 10).forEach((movie, index) => {
                replyText += `${index + 1}. ${movie.title}\nLink: ${movie.url}\n\n`;
            });
            replyText += 'විස්තර බලන්න: !cinesubz <number> (උදා: !cinesubz 1)';
            await reply(replyText);
        } catch (error) {
            await reply('Search API එකට සම්බන්ධ වෙන්න බැරි වුණා! Query එක බලලා ආයෙ උත්සාහ කරන්න.');
            console.error('Search Error:', error.message);
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
        try {
            const response = await axios.get(`https://chathurahansakamvd.netlify.app/mvd?url=${encodeURIComponent(selectedMovie.url)}`, { timeout: 10000 });
            const $ = cheerio.load(response.data);

            // Extract movie details
            const details = {
                title: $('h1[class*="title"], .movie-title, h2, h3').text().trim() || 'N/A',
                description: $('div[class*="description"], .synopsis, p[class*="desc"]').text().trim() || 'N/A',
                releaseDate: $('span[class*="release"], .release-date, .date').text().trim() || 'N/A',
                genre: $('span[class*="genre"], .genres, .category').text().trim() || 'N/A'
            };

            // Extract quality options
            const qualities = [];
            $('div[class*="quality"], .quality-option, a[class*="quality"], .download-option').each((i, elem) => {
                const quality = $(elem).find('span[class*="quality"], .quality-text').text().trim() || `Quality ${i + 1}`;
                const url = $(elem).attr('data-url') || $(elem).attr('href') || selectedMovie.url;
                if (url) qualities.push({ quality, url });
            });

            if (qualities.length === 0) {
                qualities.push({ quality: 'Default', url: selectedMovie.url }); // Fallback
            }

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
            console.error('Details Error:', error.message);
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
            const response = await axios.get(`https://chathuramvdl.netlify.app/functions/mvdl?url=${encodeURIComponent(selectedQuality.url)}`, { timeout: 10000 });
            const $ = cheerio.load(response.data);

            // Extract download link
            const downloadLink = $('a[class*="download"], .download-link, a[href*="download"]').attr('href') || 'N/A';

            if (downloadLink === 'N/A') {
                return reply('Download link හමුවුණේ නැහැ! URL එක බලලා ආයෙ උත්සාහ කරන්න.');
            }

            userState.delete(from);

            let replyText = '📥 Cinesubz Download Link:\n';
            replyText += `Quality: ${selectedQuality.quality}\n`;
            replyText += `Link: ${downloadLink}\n`;
            replyText += 'නැවත search කරන්න: !cinesubz <movie_name>';
            await reply(replyText);
        } catch (error) {
            await reply('Download link ලබාගන්න බැරි වුණා! ආයෙ උත්සාහ කරන්න.');
            console.error('Download Error:', error.message);
        }
        return;
    }

    await reply('වැරදි input! Search කරන්න: !cinesubz <movie_name>, Movie select කරන්න: !cinesubz <number>, Quality select කරන්න: !cinesubz <quality_number>');
});
