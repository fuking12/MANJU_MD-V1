const axios = require('axios');
const { cmd } = require('../command');

// Derana News API
const DERANA_API = 'https://dizer-adaderana-news-api.vercel.app/news';

// NewsAPI.org Key
const NEWSAPI_KEY = "0f2c43ab11324578a7b1709651736382";

// 1. Derana News (Original Code - Unmodified)
cmd({
    pattern: "derananews",
    alias: ["derana", "news3"],
    react: "📑",
    desc: "Get Derana News Headlines",
    category: "news",
    use: '.derana',
    filename: __filename
},
async (conn, mek, m, { from, quoted }) => {
    try {
        const response = await axios.get(DERANA_API);
        const news = response.data[0];
        const msg = `
📑 *Derana News*
*Title:* ${news.title || 'N/A'}
*News:* ${news.description || 'N/A'}
*Date:* ${news.time || 'N/A'}
*Link:* ${news.new_url || 'N/A'}
> © Powered by Queen Rashu MD ✾
        `;
        await conn.sendMessage(from, { 
            image: { url: news.image || '' }, 
            caption: msg 
        }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply('⚠️ දෝෂයක් සිදු විය. API එකෙන් දත්ත ලබා ගැනීමට නොහැකි විය!');
    }
});

// 2. International News (Original Code - Unmodified)
cmd({
    pattern: "news2",
    desc: "Get international news headlines",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWSAPI_KEY}`);
        const articles = response.data.articles;
        if (!articles.length) return reply("No news articles found.");
        
        for (let i = 0; i < Math.min(articles.length, 5); i++) {
            const article = articles[i];
            let message = `
📰 *${article.title}*
⚠️ _${article.description}_
🔗 _${article.url}_
> © Powered by Queen Rashu MD ✾
            `;
            if (article.urlToImage) {
                await conn.sendMessage(from, { image: { url: article.urlToImage }, caption: message });
            } else {
                await conn.sendMessage(from, { text: message });
            }
        }
    } catch (e) {
        console.error("Error fetching news:", e);
        reply("Could not fetch news. Please try again later.");
    }
});
