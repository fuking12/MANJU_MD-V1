const { cmd, commands } = require('./command');
const axios = require('axios');

// Search TV series command
cmd({
    pattern: "search",
    desc: "Search for TV series by query",
    category: "media",
    filename: "cinesubz_plugin.js"
}, async (message, match) => {
    const query = match[1] ? match[1].trim() : '';
    if (!query) {
        await message.reply('Please provide a search query. Usage: !search <query>');
        return;
    }
    try {
        const response = await axios.get(`https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/search/?q=${encodeURIComponent(query)}`);
        const results = response.data.results;
        if (results.length === 0) {
            await message.reply('No TV series found for your query.');
            return;
        }
        let reply = 'Found TV Series:\n';
        results.forEach((series, index) => {
            reply += `${index + 1}. ${series.title} - ${series.url}\n`;
        });
        reply += 'Reply with `!details <number>` to get details of a series.';
        await message.reply(reply);
    } catch (error) {
        await message.reply('Error searching for TV series. Please try again.');
        console.error(error);
    }
});

// Get TV series details command
cmd({
    pattern: "details",
    desc: "Get details of a selected TV series",
    category: "media",
    filename: "cinesubz_plugin.js"
}, async (message, match) => {
    const index = parseInt(match[1]) - 1;
    if (isNaN(index)) {
        await message.reply('Please provide a valid series number. Usage: !details <number>');
        return;
    }
    try {
        const searchResponse = await axios.get(`https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/search/?q=2024`);
        const series = searchResponse.data.results[index];
        if (!series) {
            await message.reply('Invalid series number.');
            return;
        }
        const detailsResponse = await axios.get(`https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/details?url=${encodeURIComponent(series.url)}`);
        const details = detailsResponse.data;
        let reply = `Title: ${details.title}\nDescription: ${details.description}\n`;
        reply += 'Episodes:\n';
        details.episodes.forEach((episode, i) => {
            reply += `${i + 1}. ${episode.title} - ${episode.url}\n`;
        });
        reply += 'Reply with `!download <episode_number>` to get download links.';
        await message.reply(reply);
    } catch (error) {
        await message.reply('Error fetching series details. Please try again.');
        console.error(error);
    }
});

// Get download links command
cmd({
    pattern: "download",
    desc: "Get download links for a TV series episode",
    category: "media",
    filename: "cinesubz_plugin.js"
}, async (message, match) => {
    const episodeIndex = parseInt(match[1]) - 1;
    if (isNaN(episodeIndex)) {
        await message.reply('Please provide a valid episode number. Usage: !download <episode_number>');
        return;
    }
    try {
        const searchResponse = await axios.get(`https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/search/?q=2024`);
        const series = searchResponse.data.results[0]; // Assuming first series for simplicity
        const detailsResponse = await axios.get(`https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/details?url=${encodeURIComponent(series.url)}`);
        const episode = detailsResponse.data.episodes[episodeIndex];
        if (!episode) {
            await message.reply('Invalid episode number.');
            return;
        }
        const downloadResponse = await axios.get(`https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/downloadlinks?url=${encodeURIComponent(episode.url)}`);
        const links = downloadResponse.data.downloadLinks;
        let reply = 'Download Links:\n';
        links.forEach((link, index) => {
            reply += `${index + 1}. Quality: ${link.quality} - ${link.url}\n`;
        });
        await message.reply(reply);
    } catch (error) {
        await message.reply('Error fetching download links. Please try again.');
        console.error(error);
    }
});

// Help command
cmd({
    pattern: "help",
    desc: "Show available commands for Cinesubz bot",
    category: "media",
    filename: "cinesubz_plugin.js"
}, async (message) => {
    await message.reply(
        'Cinesubz TV Series Bot Commands:\n' +
        '!search <query> - Search for TV series\n' +
        '!details <number> - Get details of a series\n' +
        '!download <episode_number> - Get download links for an episode\n' +
        '!help - Show this help message'
    );
});

module.exports = { commands };