const { cmd, Sticker } = require('../command');

cmd({
    pattern: "sticker",
    react: "🖼️",
    desc: "Create stickers from images"
}, async (m, { quoted }) => {
    const media = await quoted.download();
    const sticker = new Sticker(media, {
        pack: "My Pack",
        author: "You"
    });
    await sticker.build();
    m.reply(await sticker.get());
});
