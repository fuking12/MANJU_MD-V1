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
        // Plugins folder එක resolve කරනවා
        const pluginsDir = path.resolve(__dirname, '../plugins');
        console.log(`Plugins directory path: ${pluginsDir}`);

        // Plugins folder එක exist කරනවද බලනවා, නැත්නම් හදනවා
        if (!fs.existsSync(pluginsDir)) {
            console.log(`Creating plugins directory at: ${pluginsDir}`);
            fs.mkdirSync(pluginsDir, { recursive: true });
            await reply("📁 Plugins folder එක හදන ලදි.");
        }

        // Check write permissions
        try {
            fs.accessSync(pluginsDir, fs.constants.W_OK);
            console.log(`Write permission confirmed for: ${pluginsDir}`);
        } catch (permError) {
            console.error(`Permission error: ${permError.message}`);
            await reply(`❌ Plugins folder එකට write කිරීමට permission නැත: ${permError.message}`);
            return;
        }

        // Unique plugin name එකක් timestamp එකෙන් හදනවා
        const pluginName = `plugin_${Date.now()}.js`;
        const pluginPath = path.join(pluginsDir, pluginName);
        console.log(`Attempting to save plugin at: ${pluginPath}`);

        // Basic code validation
        if (!q.includes('cmd') || !q.includes('require')) {
            await reply("⚠️ Plugin code එකේ 'cmd' function එක සහ require statements තියෙන්න ඕන.");
            return;
        }

        // Plugin code එක file එකකට save කරනවා
        try {
            fs.writeFileSync(pluginPath, q, { encoding: 'utf8' });
            console.log(`Plugin successfully saved at: ${pluginPath}`);
        } catch (writeError) {
            console.error(`Write error: ${writeError.message}`);
            await reply(`❌ Plugin file එක save කරද්දි error එකක්: ${writeError.message}`);
            return;
        }

        // File එක save වුණාද බලනවා
        if (!fs.existsSync(pluginPath)) {
            console.error(`File save failed: ${pluginPath} does not exist after write.`);
            await reply("❌ Plugin එක save කරන්න බැරි වුණා: File එක exist කරන්නේ නැත.");
            return;
        }

        // File content verify කරනවා
        const savedContent = fs.readFileSync(pluginPath, 'utf8');
        if (savedContent !== q) {
            console.error(`File content mismatch at: ${pluginPath}`);
            fs.unlinkSync(pluginPath);
            await reply("❌ Plugin file එක save වුණත් content mismatch වුණා.");
            return;
        }

        // Plugin එක dynamically load කරනවා
        try {
            // Clear require cache to avoid loading old version
            delete require.cache[require.resolve(pluginPath)];
            require(pluginPath);
            console.log(`Plugin ${pluginName} loaded successfully.`);
            await reply(`✅ '${pluginName}' plugin එක successfully එකතු වුණා!`);
        } catch (loadError) {
            console.error(`Load error: ${loadError.message}`);
            fs.unlinkSync(pluginPath);
            await reply(`❌ Plugin load කරද්දි error එකක්: ${loadError.message}`);
            return;
        }

    } catch (error) {
        console.error(`General error: ${error.message}`);
        await reply(`❌ Plugin එකතු කරද්දි error එකක්: ${error.message}`);
    }
});
