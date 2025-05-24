const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

cmd({
    pattern: "addplugin",
    desc: "Add a new plugin to the bot dynamically",
    category: "owner",
    react: "🔌",
    filename: __filename
},
async (sock, mek, m, { from, args, q, isOwner, reply }) => {
    if (!isOwner) {
        await reply("❌ This command is restricted to the bot owner.");
        return;
    }

    if (!q) {
        await reply("❌ Please provide the plugin code after the command. Example: .addplugin [plugin code]");
        return;
    }

    try {
        // Generate a unique plugin name based on timestamp
        const pluginName = `plugin_${Date.now()}.js`;
        const pluginPath = path.join(__dirname, '../plugins', pluginName);

        // Basic validation of the plugin code
        if (!q.includes('cmd') || !q.includes('require')) {
            await reply("⚠️ Warning: The plugin code should use the 'cmd' function and proper require statements.");
        }

        // Write the plugin code to a file
        fs.writeFileSync(pluginPath, q);

        // Verify the plugin file exists
        if (!fs.existsSync(pluginPath)) {
            await reply("❌ Failed to save the plugin.");
            return;
        }

        // Dynamically load the plugin
        try {
            require(pluginPath);
            await reply(`✅ Plugin '${pluginName}' added and loaded successfully!`);
        } catch (loadError) {
            // Remove the faulty plugin file if loading fails
            fs.unlinkSync(pluginPath);
            await reply(`❌ Error loading plugin: ${loadError.message}`);
            return;
        }

    } catch (error) {
        await reply(`❌ Error adding plugin: ${error.message}`);
    }
});
