const { cmd } = require('./Command.js');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

cmd({
    pattern: 'henati',
    desc: 'Hentai වීඩියෝ ඩවුන්ලෝඩ් කිරීමට API එක භාවිතා කරනවා',
    category: 'media',
    filename: 'HentaiDownloadPlugin.js',
    fromMe: false
}, async (Void, citel, text) => {
    try {
        // URL හෝ query එක තිබේදැයි බලනවා
        if (!text) {
            return await citel.reply('කරුණාකර වීඩියෝ නමක් හෝ URL එකක් දෙන්න. උදා: !henati <video_name_or_url>');
        }

        // Loading indicator
        await citel.reply('🔍 Hentai වීඩියෝ සොයමින්... ටිකක් ඉන්න...');

        // API request එක යවනවා
        const apiUrl = 'https://www.dark-yasiya-api.site/download/henati';
        const response = await axios.get(apiUrl, {
            params: { query: text.trim() },
            headers: { 'User-Agent': 'WhatsAppBot/1.0' }
        });

        // API response එක check කරනවා
        if (!response.data || !response.data.videos || response.data.videos.length === 0) {
            return await citel.reply('ඔබේ query එකට Hentai වීඩියෝ හමු වුණේ නැහැ.');
        }

        // පළවෙනි video එක ගන්නවා
        const video = response.data.videos[0];

        // Video තොරතුරු යවනවා
        await citel.reply(
            `🎬 *ශීර්ෂය:* ${video.title}\n` +
            `⏱ *කාලය:* ${video.duration}\n` +
            `📊 *ගුණාත්මකභාවය:* ${video.quality}\n` +
            `⬇️ වීඩියෝ ඩවුන්ලෝඩ් කරමින්... ටිකක් ඉන්න...`
        );

        // Temp directory එක check කරලා create කරනවා
        const tempDir = path.join(__dirname, '../temp');
        await fs.mkdir(tempDir, { recursive: true });

        // Video එක ඩවුන්ලෝඩ් කරනවා
        const videoResponse = await axios.get(video.url, {
            responseType: 'arraybuffer'
        });

        // Temp file path එක හදනවා
        const tempFilePath = path.join(tempDir, `${Date.now()}_hentai.mp4`);
        await fs.writeFile(tempFilePath, Buffer.from(videoResponse.data));

        // Video එක WhatsApp හරහා යවනවා
        await citel.reply({
            video: { url: tempFilePath },
            caption: `මෙන්න ඔබේ Hentai වීඩියෝ: ${video.title}`,
            mimetype: 'video/mp4'
        });

        // Temp file එක delete කරනවා
        await fs.unlink(tempFilePath);

    } catch (error) {
        console.error('Hentai command එකේ දෝෂයක්:', error);
        await citel.reply('❌ Hentai වීඩියෝ ඩවුන්ලෝඩ් කිරීමේදී දෝෂයක් ඇති වුණා. නැවත උත්සාහ කරන්න.');
    }
});
