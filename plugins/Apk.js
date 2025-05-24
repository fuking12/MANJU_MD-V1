const { cmd } = require('./Command.js');
const { MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "apk",
    desc: "Download an APK file by package ID (e.g., com.dts.freefireth)",
    category: "utility",
    filename: "apk-downloader-plugin.js",
    fromMe: false
}, async (Void, citel, text) => {
    try {
        // Extract package ID from command (e.g., !apk com.dts.freefireth)
        const packageId = text.trim();

        // Validate package ID
        if (!packageId || !packageId.includes('.')) {
            await citel.reply('Please provide a valid package ID (e.g., com.dts.freefireth).');
            return;
        }

        // Inform user that download is starting
        await citel.reply(`Downloading APK for ${packageId}, please wait...`);

        // Define file path for the APK
        const apkPath = path.join(__dirname, `apk-${packageId}-${Date.now()}.apk`);

        // Placeholder API URL (replace with a trusted APK download API)
        const apiUrl = `https://api.apkmonk.com/download/apk?id=${packageId}`; // Hypothetical API

        // Download APK
        const response = await axios({
            url: apiUrl,
            method: 'GET',
            responseType: 'stream'
        });

        // Save the APK file
        const writer = fs.createWriteStream(apkPath);
        response.data.pipe(writer);

        // Handle file write completion
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Check file size (APK should not be empty)
        const stats = fs.statSync(apkPath);
        if (stats.size === 0) {
            await citel.reply('Error: Downloaded APK is empty or invalid.');
            fs.unlinkSync(apkPath);
            return;
        }

        // Send the APK to the user
        const media = MessageMedia.fromFilePath(apkPath);
        await citel.reply(media, { caption: `Here is the APK for ${packageId}!` });

        // Clean up the file after sending
        fs.unlinkSync(apkPath);
    } catch (error) {
        console.error(error);
        await citel.reply('An error occurred while downloading the APK. Please check the package ID or try again later.');
    }
});
