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
        await citel.reply('🔍 Hentai විඩියෝ සොයමින්... ටිකක් ඉන්න...');

        // API request එක යවනවා
        const apiUrl = 'https://www.dark-yasiya-api.site/download/henati';
        const response = await axios.get(apiUrl, {
            params: { query: text.trim() },
            headers: { 'User-Agent': 'WhatsAppBot/1.0' }
        });

        // API response එක check කරනවා
        if (!response.data || !Array.isArray(response.data.videos) || response.data.videos.length === 0) {
            return await citel.reply('ඔබේ query එකට Hentai වීඩියෝ හමු වුණේ නැහැ.');
        }

        // පැළඳේ video තොරතුරු ගන්නවා
        const video = response.data.videos[0];
        
        // Validate the necessary fields exist
        if (!video.title || !video.duration || !video.quality || !video.url) {
            return await citel.reply('ආපසු සොයාගත් වීඩියෝට තොරතුරු සම්පූර්ණ නැවුම් බව ප්‍රතික්ෂේප කරන ලදි.');
        }

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
        
        // Write the file safely
        await fs.writeFile(tempFilePath, Buffer.from(videoResponse.data));
        
        // Video එක WhatsApp හරහා යවනවා
        await citel.reply({
            video: { url: tempFilePath },
            caption: `මෙන්න ඔබේ Hentai වීඩියෝ: ${video.title}`,
            mimetype: 'video/mp4'
        });

    } catch (error) {
        console.error('Hentai command එකේ දෝෂයක්:', error.message);  // Log only the error message for a cleaner log
       
       let errorMessage = '❌ Hentai වීඩියෝ ඩවුන්ලෝඩ් කිරීමේදී දෝෂයක් ඇති වුණා. ';
       
       if (error.response) {
           errorMessage += 'වැඩි විස්තර සඳහා පිවිසෙන්න.';  // If it's a response error
       } else if (error.code) {
           errorMessage += `දෝෂ කේතය: ${error.code}`;  // If it has a code property
       } else {
           errorMessage += error.message;  // General fallback for other errors
       }
       
       await citel.reply(errorMessage);
   } finally {
       try {
           // Cleanup the temp file regardless of whether there was an error or not but ensure it exists first.
           if (tempFilePath && fs.existsSync(tempFilePath)) {
               await fs.unlink(tempFilePath);
           }
       } catch (cleanupError) {
           console.error('Failed to delete temp file:', cleanupError.message);
       }
   }
});
    
