const { cmd } = require("../command");

cmd(

  {

    pattern: "owner",

    desc: "Show owner contact information",

    category: "info",

    filename: __filename,

  },

  async (client, m) => {

    const ownerNumber = "94766863255"; // ඔබේ නම්බරය මෙහි දාන්න

    const ownerName = "Pathum Rajapaksha"; // ඔබේ නම මෙහි දාන්න

    const vcard =

      "BEGIN:VCARD\n" +

      "VERSION:3.0\n" +

      `FN:${ownerName}\n` +

      `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n` +

      "END:VCARD";

    await client.sendMessage(m.chat, {

      contacts: {

        displayName: ownerName,

        contacts: [{ vcard }],

      },

    });

    await client.sendMessage(m.chat, {

      text: `*🤖 BOT OWNER INFO*\n\n👤 *Name:* ${ownerName}\n📞 *Number:* wa.me/${ownerNumber}\n\nඔබට bot පිළිබඳ support අවශ්‍ය නම් Owner අමතන්න.`,

      footer: "MANJU_MD - WhatsApp Bot",

      buttons: [

        {

          buttonId: `.menu`,

          buttonText: { displayText: "📜 Menu" },

          type: 1,

        },

        {

          buttonId: `.ping`,

          buttonText: { displayText: "📶 Ping" },

          type: 1,

        },

      ],

      headerType: 1,

    });

  }

);