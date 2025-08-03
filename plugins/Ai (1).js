const axios = require('axios');

const { cmd } = require('../command');

cmd(

  {

    pattern: "ai",

    desc: "Get AI response using Nekorinn RipLeAI API",

    category: "info",

    filename: __filename,

    react: "🤖" // Reaction when command is executed

  },

  async (sock, mek, m, { from, args, q, reply }) => {

    try {

      if (!q) {

        await reply("❌ Text input දෙන්න. උදා: .ai හායි, මට උදව් කරන්න");

        return;

      }

      const text = encodeURIComponent(q.trim());

      const apiUrl = `https://api.nekorinn.my.id/ai/ripleai?text=${text}`;

      console.log(`Sending AI request for: ${text}, URL: ${apiUrl}`);

      const response = await axios.get(apiUrl, { timeout: 15000 }); // 15 seconds timeout

      console.log("Full API Response:", JSON.stringify(response.data, null, 2));

      if (!response.data || typeof response.data !== 'object') {

        console.error("Invalid API response format:", response.data);

        await reply("❌ API response invalid.");

        return;

      }

      let aiResponse = '';

      // Function to search for meaningful string value recursively

      const findResponse = (obj) => {

        if (!obj || typeof obj !== 'object') return '';

        for (let key in obj) {

          const value = obj[key];

          if (typeof value === 'string' && value.trim() !== '' && !value.startsWith('@')) {

            // Filter out usernames or mentions (e.g., @nekorinnn)

            return value;

          } else if (typeof value === 'object' && value !== null) {

            const nestedResponse = findResponse(value);

            if (nestedResponse) return nestedResponse;

          }

        }

        return '';

      };

      aiResponse = findResponse(response.data);

      if (!aiResponse || aiResponse.trim() === '') {

        console.log("No valid AI response found after recursive search:", response.data);

        // Fallback to any non-empty string if no meaningful response

        aiResponse = Object.values(response.data).find(val => typeof val === 'string' && val.trim() !== '') || 'No response';

        console.log(`Fallback AI response: ${aiResponse}`);

        if (aiResponse === 'No response') {

          await reply("❌ No response from AI.");

          return;

        }

      }

      const message = `🤖 *AI Response:*\n${aiResponse}`;

      await sock.sendMessage(from, { text: message }, { quoted: mek });

    } catch (error) {

      console.error(`Error Details: ${error.message}`);

      if (error.response) {

        console.error(`API Response Status: ${error.response.status}`);

        console.error(`API Response Data: ${JSON.stringify(error.response.data, null, 2)}`);

      } else if (error.request) {

        console.error("No response received, likely network issue:", error.request);

      } else {

        console.error("Error setting up request:", error.message);

      }

      await reply(`❌ Error getting AI response: ${error.message}. Console log check කරන්න.`);

    }

  }

);