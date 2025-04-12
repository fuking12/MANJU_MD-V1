const axios = require('axios');
const { cmd } = require('./command');  

// SUHAS-MD News Plugin Command

cmd({
    pattern: 'itnnews',
    desc: 'Get the latest ITN news.',
    category: 'News',
    use: '.news',
    react: '📰',
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        // Fetch latest news from the provided API
        const res = await axios.get('https://suhas-bro-api.vercel.app/news/itn');
        const newsData = res.data;

        if (!newsData || newsData.length === 0) {
            return reply("❌ No news available at the moment.");
        }

        // Assuming we want to show the first news item
        const article = newsData[0]; // Get the first news article

        // Create a formatted response with the latest news
        let newsReply = `📰 Latest ITN News:\n\n`;
        newsReply += `📅 Date: article.date`;
        newsReply += `📝 Title:{article.title}\n`;
        newsReply += `📝 Summary: ${article.summary}\n`;
newsReply += `🔗 Link:{article.link}\n`;

        // Send the formatted news response to the user
        reply(newsReply);

    } catch (error) {
        console.error("Error fetching news:", error.message);
        reply("❌ An error occurred while fetching the latest news.");
    }
});


*🌟 Follow Our `WhatsApp Channel` For Informations.⚖️*
https://whatsapp.com/channel/0029Vb2qCQi0LKZKDYT7dl0q


> *© 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 𝚂𝚄𝙷𝙰𝚂  〽️𝙳*
