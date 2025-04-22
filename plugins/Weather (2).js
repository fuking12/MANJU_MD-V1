const { cmd } = require('../command');

const axios = require('axios');

// OpenWeatherMap API Key (ඔබේ API key එක යොදලා තියෙන්නේ)

const API_KEY = 'e903424213daaf469794874970b06f5f';

// Weather command

cmd({

    pattern: "weather",

    desc: "Get current weather information for any city or country.",

    alias: ["wthr"],

    category: "utility",

    react: "🌤️",

    filename: __filename

}, async (conn, mek, m, { from, q, reply }) => {

    try {

        const location = q.trim();

        if (!location) return reply("කරුණාකර නගරයක් හෝ රටක් ඇතුලත් කරන්න. උදා: .weather Colombo");

        // OpenWeatherMap API request

        const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;

        const response = await axios.get(url);

        const weatherData = response.data;

        // Extract relevant weather information

        const cityName = weatherData.name;

        const country = weatherData.sys.country;

        const temperature = weatherData.main.temp;

        const feelsLike = weatherData.main.feels_like;

        const humidity = weatherData.main.humidity;

        const windSpeed = weatherData.wind.speed;

        const description = weatherData.weather[0].description;

        // Format the weather message

        let weatherMessage = `🌤️ *${cityName}, ${country} හි කාලගුණ තත්ත්වය*\n\n`;

        weatherMessage += `*විස්තරය:* ${description}\n`;

        weatherMessage += `*🌡️ උෂ්ණත්වය:* ${temperature}°C\n`;

        weatherMessage += `*🥵 හැඟෙන උෂ්ණත්වය:* ${feelsLike}°C\n`;

        weatherMessage += `*💧 ආර්ද්‍රතාවය:* ${humidity}%\n`;

        weatherMessage += `*💨 සුළං වේගය:* ${windSpeed} m/s\n\n`;

        weatherMessage += `*© MANJU MD Bot*`;

        // Send the weather information with context info similar to SinhalaSub.js

        await conn.sendMessage(from, {

            text: weatherMessage,

            contextInfo: {

                forwardingScore: 999,

                isForwarded: true,

                forwardedNewsletterMessageInfo: {

                    newsletterName: 'Mᴀɴᴊᴜ_ᴍᴅ Iɴғᴏ',

                    newsletterJid: "",

                },

                externalAdReply: {

                    title: '|Mᴀɴᴊᴜ_ᴍᴅ ᴡᴇᴀᴛʜᴇʀ ɪɴғᴏ',

                    body: ' Mᴀɴᴊᴜ_ᴍᴅ ᴡᴀ ʙᴏᴛ ʙᴇꜱᴇᴅ ᴏɴ ʙᴀɪʏʟᴇꜱ',

                    mediaType: 1,

                    sourceUrl: "https://youtu.be/xSArkTWDXBs?si=447mUzkhuNcjvRYK",

                    thumbnailUrl: 'https://raw.githubusercontent.com/Manju362/Link-gamu./refs/heads/main/IMG-20250421-WA0296.jpg',

                    renderLargerThumbnail: false,

                    showAdAttribution: true

                }

            }

        }, { quoted: mek });

        await conn.sendMessage(from, {

            react: { text: '✅', key: mek.key }

        });

    } catch (error) {

        console.error('කාලගුණ තොරතුරු ලබාගැනීමේ දෝෂයක්:', error.response ? error.response.data : error.message);

        await conn.sendMessage(from, {

            react: { text: '❌', key: mek.key }

        });

        if (error.response && error.response.status === 404) {

            reply("නගරය හෝ රට හමු වුණේ නැහැ. කරුණාකර නිවැරදි නමක් ඇතුලත් කරන්න. උදා: .weather Colombo");

        } else if (error.response && error.response.status === 401) {

            reply("API Key එක වලංගු නැහැ. කරුණාකර API Key එක තහවුරු කරන්න හෝ නව API Key එකක් ලබාගන්න.");

        } else {

            reply("කාලගුණ තොරතුරු ලබාගැනීමේදී දෝෂයක් ඇති වුණා. කරුණාකර පසුව උත්සාහ කරන්න.");

        }

    }

});