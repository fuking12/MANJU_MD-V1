const { cmd } = require('../command');

cmd({
  pattern: "hello",
  desc: "Replies in Sinhala",
  category: "test",
  react: "🙏"
}, async (client, m, sock) => {
  console.log(Object.keys(sock)); // Print all methods and properties of 'sock' object
  await sock.sendMessage(m.chat, { text: "ආයුබෝවන්! ඔබට කොහොම ද?" }, { quoted: m });
});
