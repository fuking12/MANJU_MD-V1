const { cmd } = require('../command');

cmd({
  pattern: "hello",
  desc: "Replies in Sinhala",
  category: "test",
  react: "🙏"
}, async (client, m, sock) => {
  await sock.sendMessage(m.chat, { text: "ආයුබෝවන්! ඔබට කොහොම ද?" }, { quoted: m });
});
