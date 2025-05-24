const { cmd, commands } = require('./Command.js');
const axios = require('axios');

// Video download command
cmd({
    pattern: "sweetvideo",
    desc: "Download videos from xvideos.com",
    category: "media",
    filename: "sweetVideoDownloader.js"
}, async (info, args) => {
    try {
        const url = args[0];
        if (!url || !url.includes("xvideos.com")) {
            return info.reply("Please provide a valid xvideos.com video URL!");
        }

        // Fetch download links for the video
        const response = await axios.get(`https://www.dark-yasiya-api.site/download/xvideo?url=${encodeURIComponent(url)}`);
        const videoData = response.data;

        if (!videoData.downloadLinks || videoData.downloadLinks.length === 0) {
            return info.reply("No download links found for this video!");
        }

        let reply = `🎥 Video Download Links:\n\n`;
        reply += `Title: ${videoData.title || "Unknown Title"}\n`;
        reply += `URL: ${url}\n`;
        reply += "Available Download Links:\n";
        videoData.downloadLinks.forEach((link, index) => {
            reply += `   ${index + 1}. ${link.quality || "Link"}: ${link.url}\n`;
        });

        // Automatically select the first download link
        const firstLink = videoData.downloadLinks[0];
        reply += `\n📥 Download started for: ${firstLink.quality || "Link"} - ${firstLink.url}`;

        await info.reply(reply);
    } catch (error) {
        await info.reply(`Error fetching video download links: ${error.message}`);
    }
});

module.exports = commands;
