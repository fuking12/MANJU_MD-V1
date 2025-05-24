const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

cmd({
    pattern: "addplugin",
    desc: "නව plugin එකක් bot එකට dynamically එකතු කරන්න",
    category: "owner",
    react: "🔌",
    filename: __filename
},
async (sock, mek, m, { from, args, q, isOwner, reply }) => {
    if (!isOwner) {
        await reply("❌ මෙම command එක bot ownerට පමණයි.");
        return;
    }

    if (!q) {
        await reply("❌ Plugin code එක command එකත් එක්ක දෙන්න. උදා: .addplugin [plugin code]");
        return;
    }

    try {
        // Plugins folder එක exist කරනවද බලනවා, නැත්නම් හදනවා
        const pluginsDir = path.join(__dirname, '../plugins');
        if (!fs.existsSync(pluginsDir)) {
            fs.mkdirSync(pluginsDir, { recursive: true });
            await reply("📁 Plugins folder එක හදන ලදි.");
        }

        // Unique plugin name එකක් timestamp එකෙන් හදනවා
        const pluginName = `plugin_${Date.now()}.js`;
        const pluginPath = path.join(pluginsDir, pluginName);

        // Debug: Log the path
        console.log(`Attempting to save plugin at: ${pluginPath}`);

        // Basic code validation
        if (!q.includes('cmd') || !q.includes('require')) {
            await reply("⚠️ Plugin code එකේ 'cmd' function එක සහ require statements තියෙන්න ඕන.");
        }

        // Check write permissions
        try {
            fs.accessSync(pluginsDir, fs.constants.W_OK);
        } catch (permError) {
            await reply("❌ Plugins folder එකට write කිරීමට permission නැත. Permission check කරන්න.");
            console.error(`Permission error: ${permError.message}`);
            return;
        }

        // Plugin code එක file එකකට save කරනවා
        fs.writeFileSync(pluginPath, q);
        console.log(`Plugin saved at: ${pluginPath}`);

        // File එක save වුණාද බලනවා
        if (!fs.existsSync(pluginPath)) {
            await reply("❌ Plugin එක save කරන්න බැරි වුණා.");
            console.error("File save failed: File does not exist after write.");
            return;
        }

        // Plugin එක dynamically load කරනවා
        try {
            require(pluginPath);
            await reply(`✅ '${pluginName}' plugin එක successfully එකතු වුණා!`);
            console.log(`Plugin ${pluginName} loaded successfully.`);
        } catch (loadError) {
            // Load කරන්න බැරි වුණොත් file එක delete කරනවා
            fs.unlinkSync(pluginPath);
            await reply(`❌ Plugin load කරද්දි error එකක්: ${loadError.message}`);
            console.error(`Load error: ${loadError.message}`);
            return;
        }

    } catch (error) {
        await reply(`❌ Plugin එකතු කරද්දි error එකක්: ${error.message}`);
        console.error(`General error: ${error.message}`);
    }
});
