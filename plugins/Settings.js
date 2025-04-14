// `commands/settings.js` - `.settings` command to show bot settings.
const { MessageType } = require('@adiwajshing/baileys');
const config = require('../config'); // config.js එක import කරන්න
const { cmd } = require('../command'); // cmd function එක import

cmd({
  name: 'settings',
  desc: 'Shows the current bot settings with toggle options',
  category: 'bot',
}, async (client, message) => {
  // Settings array එකක් තනනවා
  const settings = [
    { name: 'Auto Read', status: config.AUTO_READ_STATUS === 'true' ? 'ON' : 'OFF' },
    { name: 'Auto Bio', status: config.AUTO_BIO_STATUS === 'true' ? 'ON' : 'OFF' },
    { name: 'Auto React', status: config.AUTO_REACT_STATUS === 'true' ? 'ON' : 'OFF' },
  ];

  // Message එකට settings format එකක් සාදා ගැනීම
  let settingsMessage = '🔧 **Bot Settings** 🔧\n\n';
  settings.forEach((setting) => {
    settingsMessage += `🔸 ${setting.name}: *${setting.status}*\n`;
  });

  // Message එක බොට් user එකට එවීම
  await client.sendMessage(
    message.key.remoteJid,
    { text: settingsMessage, mimetype: MessageType.text },
    MessageType.text
  );
});
