const { Client, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config.js');

// Configure Gemini API using config
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    if (message.body === 'hi' || message.body === 'hello') {
        const buttons = new Buttons('ඔබට අවශ්‍ය සේවාව කුමක්ද?', [
            { body: 'සමාජ මාධ්‍ය' },
            { body: 'තොරතුරු' },
            { body: 'සහාය' },
            { body: 'වෙළඳාම' },
            { body: 'සෞඛ්‍ය' },
            { body: 'ආහාර' },
            { body: 'සංචාරක' },
            { body: 'අධ්‍යාපන' },
            { body: 'තාක්ෂණ' },
            { body: 'විනෝද' }
        ], 'සේවාව', 'තෝරන්න');
        client.sendMessage(message.from, buttons);
    } else if (message.body.match(/සමාජ මාධ්‍ය|තොරතුරු|සහාය|වෙළඳාම|සෞඛ්‍ය|ආහාර|සංචාරක|අධ්‍යාපන|තාක්ෂණ|විනෝද/)) {
        const prompt = `මම ${message.body} සේවාව තෝරා ඇත. ඒ ගැන ඉහළම තොරතුරු 2-3 උදාහරණ සමඟ ශීঘ্র ලෙස ලබාදෙන්න.`;
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        client.sendMessage(message.from, result.response.text());
    }
});

client.initialize();
