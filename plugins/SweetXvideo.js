const { cmd, commands } = require('./Command.js');
const axios = require('axios');

// Video download command
cmd({
    pattern: "sweetvideo",
    desc: "Search for video download links from xvideos.com",
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

        // Validate API response
        if (!videoData || typeof videoData !== 'object') {
            return info.reply("Invalid API response. Please try again later.");
        }

        if (!videoData.downloadLinks || !Array.isArray(videoData.downloadLinks) || videoData.downloadLinks.length === 0) {
            return info.reply("No download links found for this video!");
        }

        let reply = `🎥 Video Download Links:\n\n`;
        reply += `Title: ${videoData.title || "Unknown Title"}\n`;
        reply += `URL: ${url}\n`;
        reply += "Available Download Links (Reply with number to select):\n";
        videoData.downloadLinks.forEach((link, index) => {
            reply += `   [${index + 1}] ${link.quality || "Link"}: ${link.url}\n`;
        });

        // Store download links for selection
        info.videoData = info.videoData || {};
        info.videoData[url] = videoData.downloadLinks;

        await info.reply(reply);
    } catch (error) {
        console.error("Error in sweetvideo command:", error);
        await info.reply(`Error fetching video download links: ${error.message || "Unknown error"}`);
    }
});

// Video quality selection command
cmd({
    pattern: "select",
    desc: "Select a video quality to download",
    category: "media",
    filename: "sweetVideoDownloader.js"
}, async (info, args) => {
    try {
        const qualityIndex = parseInt(args[0]) - 1;
        if (isNaN(qualityIndex) || qualityIndex < 0) {
            return info.reply("Please provide a valid number (e.g., .select 1)");
        }

        const videoData = info.videoData || {};
        const videoUrls = Object.keys(videoData);
        if (videoUrls.length === 0) {
            return info.reply("No video data available! Please run .sweetvideo first.");
        }

        // Assume the most recent video URL is the one being selected
        const selectedVideoUrl = videoUrls[videoUrls.length - 1];
        const downloadLinks = videoData[selectedVideoUrl];

        if (!downloadLinks || !Array.isArray(downloadLinks)) {
            return info.reply("No download links available for this video!");
        }

        const selectedLink = downloadLinks[qualityIndex];
        if (!selectedLink) {
            return info.reply("Invalid quality selection! Please choose a valid number.");
        }

        await info.reply(`📥 Download started for: ${selectedLink.quality || "Link"} - ${selectedLink.url}`);
    } catch (error) {
        console.error("Error in select command:", error);
        await info.reply(`Error selecting download: ${error.message || "Unknown error"}`);
    }
});

module.exports = commands;
