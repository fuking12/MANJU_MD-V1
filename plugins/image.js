const { cmd } = require('../command');
const g_i_s = require('g-i-s');

cmd({
    pattern: "img",
    alias: ["googleimg", "image"],
    react: "🔍",
    desc: "Search for images on Google",
    category: "search",
    use: '.img <query>',
    filename: __filename
},
async(conn, mek, m, { from, reply, q, pushname }) => {
    try {
        if (!q) return await reply("Please provide a search query!");

        await reply("🔍 Searching images... Please wait...");

        g_i_s(q, async (error, result) => {
            if (error || !result.length) return reply("No images found for your query!");

            // Send the first 5 images with interactive buttons
            const images = result.slice(0, 5);
            let push = [];
            
            for (let i = 0; i < images.length; i++) {
                push.push({
                    body: proto.Message.InteractiveMessage.Body.fromObject({
                        text: `Image ${i+1} of ${images.length}`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.fromObject({
                        text: '❄️Frozen Queen❄️ by Mr Chathura'
                    }),
                    header: proto.Message.InteractiveMessage.Header.fromObject({
                        title: `Results for: ${q}`,
                        hasMediaAttachment: true,
                        imageMessage: await createImage(images[i].url)
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: []
                    })
                });
            }

            const msg = generateWAMessageFromContent(from, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: `Hello ${pushname}, here are your image results for: ${q}`
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: '❄️Frozen Queen❄️ by Mr Chathura'
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                                hasMediaAttachment: false
                            }),
                            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                                cards: push
                            })
                        })
                    }
                }
            }, {});

            await conn.relayMessage(from, msg.message, {
                messageId: msg.key.id
            });
        });

        async function createImage(url) {
            const { imageMessage } = await generateWAMessageContent({
                image: { url }
            }, {
                upload: conn.waUploadToServer
            });
            return imageMessage;
        }

    } catch (error) {
        console.error(error);
        reply('An error occurred while processing your request. Please try again later.');
    }
});
