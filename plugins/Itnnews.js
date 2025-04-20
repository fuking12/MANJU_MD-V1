const axios = require('axios');

const { cmd } = require('../command');

cmd({

    pattern: 'itnnews',

    desc: 'Get the latest ITN news.',

    category: 'News',

    use: '.itnnews',

    react: '📰',

    filename: __filename

}, async (conn, mek, m, { reply }) => {

    try {

        // Fetch latest news from the API

        const res = await axios.get('https://suhas-bro-api.vercel.app/news/itn');

        const newsData = res.data;

        if (!newsData || !Array.isArray(newsData) || newsData.length === 0) {

            return reply("❌ No news available at the moment.");

        }

        const article = newsData[0];

        // Optional check if fields exist

        if (!article.title || !article.summary || !article.link) {

            return reply("❌ News data is incomplete.");

        }

        // Build the reply

        let newsReply = `📰 *Latest ITN News*\n\n`;

        newsReply += `📝 *Title:* ${article.title}\n`;

        newsReply += `📝 *Summary:* ${article.summary}\n`;

        newsReply += `🔗 *Link:* ${article.link}`;

        reply(newsReply);

    } catch (error) {

        console.error("Error fetching news:", error.message);

        reply("❌ An error occurred while fetching the latest news.");

    }

});