const { cmd } = require('../command');
const OpenAI = require('openai-api');

cmd({
    pattern: "autoreply",
    react: "🤖",
    desc: "AI-powered auto replies",
    category: "tools"
}, async (m, { text }) => {
    const openai = new OpenAI(process.env.OPENAI_KEY);
    const response = await openai.complete({
        prompt: text,
        maxTokens: 100
    });
    m.reply(response.data.choices[0].text.trim());
});
