const axios = require('axios');

module.exports = {
    pattern: 'animetv',
    fromMe: false,
    desc: 'ඇනිමේ පරිච්ඡේද බාගත කිරීම (ගුණාත්මක තේරීම සහිත)',
    category: 'download',
    function: async (sock, mek, m, { reply, args }) => {
        try {
            const query = args.join(' ');
            
            if (!query) {
                return await reply('❌ භාවිතය: !anime search_term\nඋදාහරණය: !anime solo leveling 110');
            }

            // පරිච්ඡේද සොයමින්...
            await reply('🔍 පරිච්ඡේද සොයමින්...');
            const searchUrl = `https://thenux-solo-leveling-api.vercel.app/search?q=${encodeURIComponent(query)}`;
            const searchResponse = await axios.get(searchUrl);
            
            if (!searchResponse.data || searchResponse.data.length === 0) {
                return await reply('❌ ප්‍රතිඵල හමු නොවීය. වෙනත් නමක් උත්සාහ කරන්න.');
            }

            // ප්‍රතිඵල ලැයිස්තුවක් ලබා දීම
            const results = searchResponse.data.slice(0, 5); // පළමු ප්‍රතිඵල 5 ක් පමණක්
            let resultText = '📖 හමු වූ පරිච්ඡේද:\n\n';
            results.forEach((item, index) => {
                resultText += `${index+1}. ${item.title}\n`;
            });
            resultText += '\nඔබට අවශ්‍ය පරිච්ඡේදයේ අංකය යවන්න (1-5)';

            await reply(resultText);

            // පරිශීලක පිළිතුරු රැස් කිරීම
            const waitForResponse = async () => {
                return new Promise((resolve) => {
                    const listener = async (response) => {
                        if (response.key.remoteJid === m.key.remoteJid && 
                            response.key.fromMe === m.key.fromMe &&
                            response.message) {
                            const selected = parseInt(response.message.conversation);
                            if (!isNaN(selected) && selected >= 1 && selected <= results.length) {
                                sock.ev.off('messages.upsert', listener);
                                resolve(results[selected-1]);
                            }
                        }
                    };
                    sock.ev.on('messages.upsert', listener);
                    
                    // 30 තත්පරයකින් timeout
                    setTimeout(() => {
                        sock.ev.off('messages.upsert', listener);
                        resolve(null);
                    }, 30000);
                });
            };

            const selectedChapter = await waitForResponse();
            if (!selectedChapter) {
                return await reply('⏰ කාලය ඉක්මවී ඇත. නැවත උත්සාහ කරන්න.');
            }

            // ගුණාත්මක තේරීම්
            await reply(`📥 බාගත කිරීම: ${selectedChapter.title}\n\nගුණාත්මක තේරීම:\n1. උසස්\n2. සාමාන්‍ය\n3. අඩු`);

            const selectedQuality = await waitForResponse();
            if (!selectedQuality || isNaN(parseInt(selectedQuality.message.conversation))) {
                return await reply('⏰ අවලංගු ගුණාත්මක තේරීම. උසස් ගුණාත්මක භාවිතා කරයි.');
            }

            const quality = ['high', 'medium', 'low'][parseInt(selectedQuality.message.conversation)-1] || 'high';

            // පරිච්ඡේදය බාගත කිරීම
            await reply(`⬇️ බාගත කිරීම: ${selectedChapter.title} (${quality} quality)...`);
            const downloadUrl = `https://thenux-solo-leveling-api.vercel.app/chapter?url=${encodeURIComponent(selectedChapter.url)}&quality=${quality}`;
            const downloadResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });

            // පින්තූරය එවීම
            await sock.sendMessage(
                m.key.remoteJid, 
                { 
                    image: downloadResponse.data,
                    caption: `✅ සාර්ථකව බාගත කළ පරිච්ඡේදය: ${selectedChapter.title}\nගුණාත්මක භාවිතය: ${quality}`
                },
                { quoted: mek }
            );

        } catch (error) {
            console.error('පරිච්ඡේද බාගත කිරීමේ දෝෂය:', error);
            await reply('❌ පරිච්ඡේදය බාගත කිරීමට අසමත් විය. කරුණාකර පසුව උත්සාහ කරන්න.');
        }
    }
};
