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

        let response = await fetchJson(searchUrl);

        if (!response || !response.SearchResult || !response.SearchResult.result.length) {

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

        console.error('Error in movie search:', error);

        await reply('❌ Sorry, something went wrong. Please try again later.');

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

        let detailsResponse = await fetchJson(detailsUrl);

        if (!detailsResponse || !detailsResponse.downloadLinks || !detailsResponse.downloadLinks.result.links.driveLinks.length) {

            return await reply('❌ No PixelDrain download links found.');

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

        const filePath = path.join(__dirname, `${selectedMovie.title}-480p.mp4`);

        const writer = fs.createWriteStream(filePath);

        const { data } = await axios({

            url: directDownloadLink,

            method: 'GET',

            responseType: 'stream'

        });

        data.pipe(writer);

        writer.on('finish', async () => {

            await robin.sendMessage(from, {

                document: fs.readFileSync(filePath),

                mimetype: 'video/mp4',

                fileName: `${selectedMovie.title}-480p.mp4`,

                caption: `🎬 *${selectedMovie.title}*\n📌 Quality: 480p\n✅ *Download Complete!*`,

                quoted: mek

            });

            fs.unlinkSync(filePath);

            // Clear movie list after successful download

            delete movieLists[from];

        });

        writer.on('error', async (err) => {

            console.error('Download Error:', err);

            await reply('❌ Failed to download movie. Please try again.');

        });

    } catch (error) {

        console.error('Error in movie download:', error);

        await reply('❌ Sorry, something went wrong. Please try again.');

    }

});
