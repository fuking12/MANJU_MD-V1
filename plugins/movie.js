const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

// In-memory storage for movie lists (per user)
const movieLists = {};

const API_URL = "https://api.skymansion.site/movies-dl/search";
const DOWNLOAD_URL = "https://api.skymansion.site/movies-dl/download";
const API_KEY = config.MOVIE_API_KEY;

cmd({
    pattern: "movie",
    alias: ["moviedl", "films"],
    react: '🎬',
    category: "download",
    desc: "Search and download movies from PixelDrain",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide a movie name! (e.g., KGF)');

        // Fetch movie search results
        const searchUrl = `${API_URL}?q=${encodeURIComponent(q)}&api_key=${API_KEY}`;
        const response = await fetchJson(searchUrl);

        if (!response?.SearchResult?.result?.length) {
            return await reply(`❌ No results found for: *${q}*`);
        }

        // Store search results for this user
        const movies = response.SearchResult.result;
        movieLists[from] = movies;

        // Create movie list message
        let movieListMsg = `🎬 *Movies found for "${q}":*\n\n`;
        movies.forEach((movie, index) => {
            movieListMsg += `${index + 1}. ${movie.title} (${movie.year || 'Unknown'})\n`;
        });
        movieListMsg += `\n📌 Reply with a number (e.g., 1, 2) to select a movie for download.`;

        await reply(movieListMsg);
    } catch (error) {
        console.error('Error in movie search:', error.message);
        await reply('❌ Sorry, something went wrong during search. Please try again later.');
    }
});

// Command to handle number input for movie selection
cmd({
    pattern: "^[0-9]+$",
    react: '⬇️',
    dontAddCommandList: true,
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        const selectedIndex = parseInt(q) - 1;

        // Check if user has a movie list
        if (!movieLists[from] || !movieLists[from][selectedIndex]) {
            return await reply('❌ Invalid selection or no movie list found. Please use the "movie" command to search again.');
        }

        const selectedMovie = movieLists[from][selectedIndex];

        // Fetch download details
        const detailsUrl = `${DOWNLOAD_URL}/?id=${selectedMovie.id}&api_key=${API_KEY}`;
        const detailsResponse = await fetchJson(detailsUrl);

        if (!detailsResponse?.downloadLinks?.result?.links?.driveLinks?.length) {
            return await reply('❌ No PixelDrain download links found for this movie.');
        }

        // Select the 480p PixelDrain link
        const pixelDrainLinks = detailsResponse.downloadLinks.result.links.driveLinks;
        const selectedDownload = pixelDrainLinks.find(link => link.quality === "SD 480p");

        if (!selectedDownload || !selectedDownload.link.startsWith('http')) {
            return await reply('❌ No valid 480p PixelDrain link available.');
        }

        // Convert to direct download link
        const fileId = selectedDownload.link.split('/').pop();
        const directDownloadLink = `https://pixeldrain.com/api/file/${fileId}?download`;

        // Download movie
        const filePath = path.join(__dirname, `${selectedMovie.title.replace(/[^a-zA-Z0-9]/g, '_')}-480p.mp4`);
        const writer = fs.createWriteStream(filePath);

        const response = await axios({
            url: directDownloadLink,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', (err) => {
                console.error('Download Error:', err.message);
                reject(err);
            });
        });

        // Send the movie file
        await robin.sendMessage(from, {
            document: { stream: fs.createReadStream(filePath) },
            mimetype: 'video/mp4',
            fileName: `${selectedMovie.title}-480p.mp4`,
            caption: `🎬 *${selectedMovie.title}*\n📌 Quality: 480p\n✅ *Download Complete!*`,
            quoted: mek
        });

        // Clean up
        fs.unlinkSync(filePath);
        delete movieLists[from];

    } catch (error) {
        console.error('Error in movie download:', error.message);
        await reply('❌ Sorry, something went wrong during download. Please try again.');
    }
});
