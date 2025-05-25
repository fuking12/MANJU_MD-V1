const { cmd, commands } = require('../command'); // Import cmd and commands from the command module
const fg = require('api-dylux'); // Import the api-dylux library for YouTube downloads
const yts = require('yt-search'); // Import the yt-search library for YouTube search

cmd({
    pattern: "audio", // Command trigger: !audio
    desc: "download songs", // Description of the command
    react: '🎶', // Reaction emoji when the command is executed
    category: "download", // Category of the command
    filename: __filename // File name of the current script
},
async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Get query from q or join args with spaces
        const p = q || args.join(" ");
        if (!p) return reply("Please provide a URL or song name.");

        // Search YouTube for the query
        const search = await yts(p);
        if (!search.videos || search.videos.length === 0) return reply("No songs found for your query.");

        const data = search.videos[0]; // Get the first video result
        const url = data.url; // Extract the URL of the first video

        // Validate if the URL is a valid YouTube link
        if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
            return await reply('This is not a valid YouTube URL. Please provide a valid YouTube link.');
        }

        // Prepare description for the song
        let desc = `
🎵 *MANJU_MD SONG DOWNLOADER* 🎵

Title: ${data.title}
Description: ${data.description || 'None'}
Duration: ${data.timestamp}
Uploaded: ${data.ago}
Views: ${data.views}

MADE BY MANJU_MD V1 ✅
`;

        // Send thumbnail with description (with fallback thumbnail if unavailable)
        await robin.sendMessage(from, { 
            image: { url: data.thumbnail || 'https://via.placeholder.com/150' }, 
            caption: desc 
        }, { quoted: mek });

        // Download audio
        let down;
        try {
            down = await fg.yta(url); // Download audio using api-dylux
            if (!down || !down.dl_url) {
                return await reply('Download link not found. Please check the URL and try again.');
            }
        } catch (e) {
            console.error('fg.yta Error:', e); // Log the error
            return await reply(`❌ Error downloading the song: ${e.message}`);
        }

        const downloadUrl = down.dl_url; // Extract the download URL

        // Send audio message
        await robin.sendMessage(from, { 
            audio: { url: downloadUrl }, 
            mimetype: "audio/mpeg" 
        }, { quoted: mek });

    } catch (e) {
        console.error("Error:", e); // Log any general errors
        await reply(`❌ Error: ${e.message}`); // Send error message to user
    }
});
