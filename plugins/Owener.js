const { cmd } = require("../command");
const fs = require("fs");

cmd({
    pattern: "restart",
    fromMe: true,
    desc: "Bot එක restart කරන්න",
    category: "owner",
    filename: __filename,
}, async (client, m, sock) => {
    await sock.reply("Bot එක දැන් restart වෙන්න යනවා...");
    process.exit(0);
});

cmd({
    pattern: "broadcast",
    fromMe: true,
    desc: "ඔයාලට inbox / group broadcast එකක් යවන්න",
    category: "owner",
    filename: __filename,
}, async (client, m, sock) => {
    if (!sock.q) return sock.reply("කරුණාකර Broadcast message එකක් දාන්න.");

    const chats = await client.groupFetchAllParticipating();
    const groups = Object.entries(chats).map(([jid, group]) => jid);

    for (let jid of groups) {
        await client.sendMessage(jid, { text: sock.q });
    }

    sock.reply("Broadcast එක groups වලට යවලා තියෙනවා.");
});

cmd({
    pattern: "listplugins",
    fromMe: true,
    desc: "ඉන්ස්ටෝල් කරලා තියෙන plugins list එක පෙන්වයි",
    category: "owner",
    filename: __filename,
}, async (_client, _m, sock) => {
    const pluginPath = "./plugins";
    const plugins = fs.readdirSync(pluginPath).filter(file => file.endsWith(".js"));
    const list = plugins.map(p => `• ${p}`).join("\n");
    sock.reply(`🧩 Installed Plugins:\n${list}`);
});

cmd({
    pattern: "eval",
    fromMe: true,
    desc: "Eval JavaScript code (Owner only)",
    category: "owner",
    filename: __filename,
}, async (_client, _m, sock) => {
    try {
        let evaled = await eval(sock.q);
        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
        sock.reply("```" + evaled + "```");
    } catch (err) {
        sock.reply("```" + err + "```");
    }
});
