const config = require("../config");
const { cmd, commands } = require('../command');
const os = require('os');
const fetch = require("node-fetch");
const { getBuffer, runtime } = require('../lib/functions');

// Dtz PastPaper Bot Theme (assuming it's available in the same context or imported)
const dtzTheme = {
  header: `╭═📚DTZ PASTPAPER BOT📚═╮\n  ✦ SL EDUCATION A/L EDITION✦\n╰═══📚Powered by Dtz📚═══╯\n`,
  box: function (title, content) {
    return `${this.header}╔════📖${title}📖════╗\n\n${content}\n\n╚══📖DTZ PASTPAPER BOT📖══╝\n✦ PREPARE SMART, SCORE HIGH ✦\n> BY SL EDUCATION WITH PAPERS\n> A/L EDITION`;
  },
  getForwardProps: function () {
    return {
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        stanzaId: "DTZ" + Math.random().toString(16).substr(2, 12).toUpperCase(),
        mentionedJid: [],
        conversionData: {
          conversionDelaySeconds: 0,
          conversionSource: "dtz_pastpaper",
          conversionType: "message",
        },
      },
    };
  },
  resultEmojis: ["📚", "📝", "✍️", "📖", "✅", "📄", "💡", "🎓", "🔍", "🚀"],
};

cmd({
    pattern: "menu",
    desc: "Check bot online or no.",
    category: "main",
    react: dtzTheme.resultEmojis[0], // 📚
    filename: __filename
},
async (conn, mek, m, {
    from, pushname, reply
}) => {
    try {
        const caption = dtzTheme.box(
            "Bot Status",
            `${dtzTheme.resultEmojis[7]} *Welcome, ${pushname}!*\n\n` +
            `${dtzTheme.resultEmojis[0]} *Bot Name*: DTZ PastPaper Bot\n` +
            `${dtzTheme.resultEmojis[4]} *Version*: 2.0.0 Premium\n` +
            `${dtzTheme.resultEmojis[6]} *Uptime*: ${runtime(process.uptime())}\n` +
            `${dtzTheme.resultEmojis[5]} *RAM Usage*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB\n\n` +
            `${dtzTheme.resultEmojis[9]} *System Specifications*\n` +
            `  ${dtzTheme.resultEmojis[2]} RAM: 32GB DDR5 Ultra Speed\n` +
            `  ${dtzTheme.resultEmojis[1]} CPU: Intel Core i9-13900K\n` +
            `  ${dtzTheme.resultEmojis[8]} GPU: RTX 4080 Ti SuperFast\n` +
            `  ${dtzTheme.resultEmojis[4]} Status: 🟢 Online 24/7\n\n` +
            `${dtzTheme.resultEmojis[0]} *Past Paper Features*\n` +
            `> ${dtzTheme.resultEmojis[1]} Grade 6-13 Past Papers\n` +
            `> ${dtzTheme.resultEmojis[7]} University Exam Papers\n` +
            `> ${dtzTheme.resultEmojis[5]} MCQ Collections & Answers\n` +
            `> ${dtzTheme.resultEmojis[8]} Subject-wise Search Engine\n` +
            `> ${dtzTheme.resultEmojis[4]} Model Papers & Marking Schemes\n` +
            `> ${dtzTheme.resultEmojis[6]} Syllabus & Study Guides\n` +
            `> ${dtzTheme.resultEmojis[9]} Exam Tips & Success Strategies\n` +
            `> ${dtzTheme.resultEmojis[2]} Quick Paper Downloads\n` +
            `> ${dtzTheme.resultEmojis[3]} Performance Analytics\n` +
            `> ${dtzTheme.resultEmojis[7]} Smart Study Recommendations\n\n` +
            `> Powered by DTZ PASTPAPER BOT`
        );

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/gxgikz.jpg" }, // Same image as in Dtz PastPaper Bot
            caption: caption,
            buttons: [
                {
                    buttonId: 'menu_action',
                    buttonText: { displayText: `${dtzTheme.resultEmojis[8]} Select Menu` },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: `${dtzTheme.resultEmojis[0]} DTZ PastPaper Menu`,
                            sections: [
                                {
                                    title: `${dtzTheme.resultEmojis[7]} Premium Features`,
                                    rows: [
                                        {
                                            title: `${dtzTheme.resultEmojis[3]} All Commands`,
                                            description: 'View Complete Command Collection',
                                            id: '.help'
                                        },
                                        {
                                            title: `${dtzTheme.resultEmojis[8]} Contact Owner`,
                                            description: 'Get VIP Support & Assistance',
                                            id: '.owner'
                                        },
                                        {
                                            title: `${dtzTheme.resultEmojis[0]} E-Thaksalawa`,
                                            description: 'Access Premium Paper Library',
                                            id: '.eth'
                                        },
                                        {
                                            title: `${dtzTheme.resultEmojis[7]} Study Hub`,
                                            description: 'Extra Learning Materials',
                                            id: '.study'
                                        },
                                        {
                                            title: `${dtzTheme.resultEmojis[9]} Short Notes`,
                                            description: 'Exam Strategies & Techniques',
                                            id: '.stnote'
                                        },
                                        {
                                            title: `${dtzTheme.resultEmojis[8]} Bot Stats`,
                                            description: 'System Performance Analytics',
                                            id: '.ping'
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                }
            ],
            headerType: 1,
            viewOnce: true,
            ...dtzTheme.getForwardProps(), // Apply Dtz forward properties
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: dtzTheme.resultEmojis[4], key: mek.key } });

    } catch (e) {
        console.error("Error in alive2 command:", e);
        await conn.sendMessage(
            from,
            {
                text: dtzTheme.box(
                    "Bot Error",
                    `${dtzTheme.resultEmojis[0]} Error: ${e.message || "Failed to check bot status"}\n${dtzTheme.resultEmojis[1]} Try again later`
                ),
                ...dtzTheme.getForwardProps(),
            },
            { quoted: mek }
        );
        await conn.sendMessage(from, { react: { text: dtzTheme.resultEmojis[0], key: mek.key } });
    }
});