const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

cmd({
    pattern: "makeplugin",
    alias: ["createplugin", "plugincreate"],
    react: "🛠️",
    desc: "ස්වයංක්‍රීයව ප්ලගින නිර්මාණය කරන්න",
    category: "dev",
    use: '.makeplugin <plugin_name> <command>'
}, async (m, { text }) => {
    try {
        const [pluginName, command] = text.split(' ');
        
        if (!pluginName || !command) {
            return m.reply("❌ භාවිතය: *.makeplugin <plugin_name> <command>*");
        }

        // ප්ලගින ගොනුවේ මාර්ගය
        const pluginPath = path.join(__dirname, '..', 'plugins', `${pluginName}.js`);
        
        // ප්ලගින ටෙම්ප්ලේට්
        const pluginTemplate = `const { cmd } = require('../command');

cmd({
    pattern: "${command}",
    alias: ["${command}2"],
    react: "✨",
    desc: "Auto-generated plugin",
    category: "tools",
    filename: __filename
}, async (m, { text }) => {
    m.reply("🔄 මෙම ප්ලගිනය *${pluginName}* මගින් ස්වයංක්‍රීයව නිර්මාණය කරන ලදී!\\n\\nඔබට මෙය අභිරුචිකරණය කළ හැකිය.");
});`;

        // ගොනුව ලියන්න
        fs.writeFileSync(pluginPath, pluginTemplate);
        
        m.reply(`✅ *${pluginName}.js* ප්ලගිනය සාර්ථකව නිර්මාණය කරන ලදී!\\nCommand: *.${command}*`);
    } catch (e) {
        m.reply(`❌ දෝෂය: ${e.message}`);
    }
});
