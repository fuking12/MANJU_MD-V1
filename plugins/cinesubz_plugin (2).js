const { cmd, commands } = require('./command');
const axios = require('axios');
const { MessageMedia, Buttons } = require('whatsapp-web.js');

// Store user state to track search results and selected series
const userState = new Map();

cmd({
    pattern: "Search",
    desc: "Search for TV series and handle details and downloads",
    category: "media",
    filename: "cinesubz_plugin.js"
}, async (message, match) => {
    const chatId = message.from;
    const text = match[1] ? match[1].trim() : '';

    // Step 1: Handle search query
    if (!userState.has(chatId) || text) {
        if (!text) {
            await message.reply('Please provide a search query. Usage: !Search <query>');
            return;
        }
        try {
            const response = await axios.get(`https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/search/?q=${encodeURIComponent(text)}`);
            const results = response.data.results;
            if (results.length === 0) {
                await message.reply('No TV series found for your query.');
                return;
            }
            let reply = 'Found TV Series:\n';
            results.forEach((series, index) => {
                reply += `${index + 1}. ${series.title}\n`;
            });
            reply += 'Reply with the number of the series to get details.';
            userState.set(chatId, { step: 'select_series', results });
            await message.reply(reply);
        } catch (error) {
            await message.reply('Error searching for TV series. Please try again.');
            console.error(error);
        }
        return;
    }

    // Step 2: Handle series selection and fetch details with download buttons
    const state = userState.get(chatId);
    if (state.step === 'select_series') {
        const index = parseInt(text) - 1;
        if (isNaN(index) || !state.results[index]) {
            await message.reply('Please provide a valid series number.');
            return;
        }
        try {
            const series = state.results[index];
            const detailsResponse = await axios.get(`https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/details?url=${encodeURIComponent(series.url)}`);
            const details = detailsResponse.data;
            let reply = `Title: ${details.title}\nDescription: ${details.description}\nEpisodes:\n`;
            const episodeButtons = [];
            details.episodes.forEach((episode, i) => {
                reply += `${i + 1}. ${episode.title}\n`;
                episodeButtons.push({
                    buttonId: `download_${i}`,
                    buttonText: { displayText: `Episode ${i + 1}` },
                    type: 1
                });
            });
            userState.set(chatId, { step: 'select_episode', seriesUrl: series.url, episodes: details.episodes });
            const buttons = new Buttons(reply, episodeButtons, 'Select an episode to download', 'Cinesubz Bot');
            await message.reply(buttons);
        } catch (error) {
            await message.reply('Error fetching series details. Please try again.');
            console.error(error);
        }
        return;
    }
});

// Handle button interactions for episode downloads
cmd({
    pattern: "button",
    desc: "Handle button clicks for episode downloads",
    category: "media",
    filename: "cinesubz_plugin.js"
}, async (message) => {
    const chatId = message.from;
    const state = userState.get(chatId);
    if (!state || state.step !== 'select_episode' || !message.selectedButtonId) {
        return;
    }

    const episodeIndex = parseInt(message.selectedButtonId.replace('download_', ''));
    const episode = state.episodes[episodeIndex];
    if (!episode) {
        await message.reply('Invalid episode selection.');
        return;
    }

    try {
        const downloadResponse = await axios.get(`https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/downloadlinks?url=${encodeURIComponent(episode.url)}`);
        const links = downloadResponse.data.downloadLinks;
        let reply = `Download Links for ${episode.title}:\n`;
        const qualityButtons = links.map((link, index) => ({
            buttonId: `quality_${index}_${episode.url}`,
            buttonText: { displayText: link.quality },
            type: 1
        }));
        links.forEach((link, index) => {
            reply += `${index + 1}. Quality: ${link.quality}\n`;
        });
        userState.set(chatId, { step: 'select_quality', links });
        const buttons = new Buttons(reply, qualityButtons, 'Select a quality to download', 'Cinesubz Bot');
        await message.reply(buttons);
    } catch (error) {
        await message.reply('Error fetching download links. Please try again.');
        console.error(error);
    }
});

// Handle quality selection for download
cmd({
    pattern: "button",
    desc: "Handle quality button clicks for downloading",
    category: "media",
    filename: "cinesubz_plugin.js"
}, async (message) => {
    const chatId = message.from;
    const state = userState.get(chatId);
    if (!state || state.step !== 'select_quality' || !message.selectedButtonId) {
        return;
    }

    const [_, index] = message.selectedButtonId.split('_').slice(1);
    const link = state.links[parseInt(index)];
    if (!link) {
        await message.reply('Invalid quality selection.');
        return;
    }

    try {
        await message.reply(`Download Link: ${link.url}`);
        userState.delete(chatId); // Clear state after providing download link
    } catch (error) {
        await message.reply('Error providing download link. Please try again.');
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
        '!Search <query> - Search for TV series and follow prompts to download\n' +
        '!help - Show this help message'
    );
});

module.exports = { commands };