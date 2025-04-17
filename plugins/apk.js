const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

class APKDownloader {
    constructor(apiKey, baseUrl = 'https://api.genux.me/api/download/apk') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.headers = { 'User-Agent': 'APKDownloader/1.0' };
    }

    async downloadAPK(query, outputDir = 'downloads', filename = null) {
        /**
         * ලබා දුන් query එකට අදාළ APK ගොනුව බාගත කරයි.
         * @param {string} query - බාගත කිරීමට යෙදුම (උදා: 'whatsapp')
         * @param {string} outputDir - APK ගොනුව සේව් කරන ඩිරෙක්ටරිය
         * @param {string|null} filename - APK ගොනුවට අභිරුචි නමක් (අත්‍යවශ්‍ය නොවේ)
         * @returns {Promise<boolean>} - බාගත කිරීම සාර්ථක නම් true, නැත්නම් false
         */
        try {
            // API ඉල්ලීම සකස් කිරීම
            const params = new URLSearchParams({ query, apikey: this.apiKey });
            const requestUrl = `${this.baseUrl}?${params.toString()}`;

            // API එකට ඉල්ලීම යවන්න
            const response = await axios.get(requestUrl, {
                headers: this.headers,
                responseType: 'stream'
            });

            // ඩිරෙක්ටරියක් නැත්නම් හදන්න
            await fs.mkdir(outputDir, { recursive: true });

            // ගොනුවේ නම සකස් කිරීම
            const apkFilename = filename || `${query}.apk`;
            const filePath = path.join(outputDir, apkFilename);

            // APK ගොනුව සේව් කිරීම
            const writer = require('fs').createWriteStream(filePath);
            response.data.pipe(writer);

            // බාගත කිරීම අවසන් වීම බලා සිටීම
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            console.log(`APK ගොනුව '${filePath}' ලෙස සාර්ථකව බාගත කරන ලදි!`);
            return true;

        } catch (error) {
            console.error(`දෝෂයක් ඇතිවිය: ${error.message}`);
            return false;
        }
    }
}

// භාවිතා කිරීමේ උදාහරණය
(async () => {
    const apiKey = 'GENUX-WXSU5DK';
    const downloader = new APKDownloader(apiKey);
    await downloader.downloadAPK('whatsapp');
})();
