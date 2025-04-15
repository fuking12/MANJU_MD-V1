const { cmd, commands } = require("../command");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

cmd(
  {
    pattern: "pf",
    alias: ["dp", "profilepic"],
    desc: "Download and send user's profile picture in high quality (works for non-contacts too)",
    category: "utility",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }
  ) => {
    try {
      // Send initial status
      const processingMsg = await reply("Fetching profile picture...");
      
      // Get the target user's JID
      let userJid;
      let targetNumber;
      
      // Case 1: If there are mentions, use the first mentioned user
      if (m.mentions && m.mentions.length > 0) {
        userJid = m.mentions[0];
        targetNumber = userJid.split('@')[0];
      } 
      // Case 2: If there's text after the command, try to use it as a phone number
      else if (q) {
        targetNumber = q.replace(/[^0-9]/g, '');
        
        // Add country code if missing (assuming Sri Lanka for 94)
        if (targetNumber.length === 9) {
          targetNumber = "94" + targetNumber;
        }
        
        // Format the JID properly
        userJid = targetNumber + "@s.whatsapp.net";
      } 
      // Case 3: If replying to a message, use the sender's JID
      else if (quoted) {
        userJid = quoted.sender;
        targetNumber = userJid.split('@')[0];
      } 
      // Case 4: Use the sender's JID (self)
      else {
        userJid = sender;
        targetNumber = userJid.split('@')[0];
      }
      
      // Define the temp directory and image file path
      const tempDir = path.join(__dirname, "../temp");
      const imagePath = path.join(tempDir, `profile_${Date.now()}.jpg`);
      
      // Create the temp directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      console.log(`Attempting to get profile picture for: ${userJid}`);
      
      // Function to attempt to download profile picture with multiple formats and methods
      const downloadProfilePicture = async () => {
        // Array of JID formats to try
        const jidFormats = [
          userJid,  // standard format (@s.whatsapp.net)
          userJid.replace('@s.whatsapp.net', '@c.us'),  // c.us format
          targetNumber + '@g.us'  // group format (sometimes works for individuals)
        ];
        
        // Array of methods to try
        const methods = [
          // Method 1: High quality with true parameter
          async (jid) => {
            try {
              const ppUrl = await robin.profilePictureUrl(jid, 'image', true);
              console.log(`Method 1 success for ${jid}: ${ppUrl}`);
              return ppUrl;
            } catch (err) {
              console.log(`Method 1 failed for ${jid}: ${err.message}`);
              return null;
            }
          },
          
          // Method 2: Standard method
          async (jid) => {
            try {
              const ppUrl = await robin.profilePictureUrl(jid);
              console.log(`Method 2 success for ${jid}: ${ppUrl}`);
              return ppUrl;
            } catch (err) {
              console.log(`Method 2 failed for ${jid}: ${err.message}`);
              return null;
            }
          },
          
          // Method 3: Try with specific options
          async (jid) => {
            try {
              // Some alternative way to get profile picture
              const ppUrl = await robin.profilePictureUrl(jid, 'image');
              console.log(`Method 3 success for ${jid}: ${ppUrl}`);
              return ppUrl;
            } catch (err) {
              console.log(`Method 3 failed for ${jid}: ${err.message}`);
              return null;
            }
          }
        ];
        
        // Try all combinations of JID formats and methods
        for (const jid of jidFormats) {
          for (const method of methods) {
            const url = await method(jid);
            if (url) {
              try {
                // Download with axios
                const response = await axios({
                  method: 'GET',
                  url: url,
                  responseType: 'arraybuffer',
                  headers: {
                    'Accept': 'image/jpeg,image/png,image/*;q=0.8',
                    'Cache-Control': 'no-cache'
                  }
                });
                
                // Write to file
                fs.writeFileSync(imagePath, Buffer.from(response.data));
                return true;
              } catch (err) {
                console.log(`Download failed for ${url}: ${err.message}`);
              }
            }
          }
        }
        
        // If we get here, all methods failed
        return false;
      };
      
      // Try to get the profile picture
      const success = await downloadProfilePicture();
      
      if (success) {
        // Get file size and dimensions
        const fileSize = fs.statSync(imagePath).size;
        const fileSizeKB = (fileSize / 1024).toFixed(2);
        
        // Send the profile picture
        await robin.sendMessage(
          from, 
          {
            image: fs.readFileSync(imagePath),
            caption: `*Profile Picture*\n\n• *User:* @${targetNumber}\n• *Size:* ${fileSizeKB} KB`,
            mentions: [userJid]
          },
          { quoted: mek }
        );
        
        // Clean up
        fs.unlinkSync(imagePath);
        
      } else {
        // Try to implement a non-baileys method for non-contacts
        try {
          console.log("Attempting alternative method for non-contacts...");
          
          // Format the number for WhatsApp's web API
          const formattedNumber = targetNumber.includes("-") ? targetNumber : targetNumber;
          
          // Non-contact method: Use WhatsApp's unofficial web API pattern
          const waURL = `https://web.whatsapp.com/pp?t=s&u=${formattedNumber}@c.us&v=2`;
          console.log(`Trying unofficial URL: ${waURL}`);
          
          // Try to download
          const response = await axios({
            method: 'GET',
            url: waURL,
            responseType: 'arraybuffer',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'image/jpeg,image/png,image/*',
              'Cache-Control': 'no-cache'
            },
            validateStatus: function (status) {
              return status < 500; // Accept all responses except server errors
            }
          });
          
          if (response.status === 200) {
            // Write to file
            fs.writeFileSync(imagePath, Buffer.from(response.data));
            
            // Get file size
            const fileSize = fs.statSync(imagePath).size;
            const fileSizeKB = (fileSize / 1024).toFixed(2);
            
            // Send the profile picture
            await robin.sendMessage(
              from, 
              {
                image: fs.readFileSync(imagePath),
                caption: `*Profile Picture*\n\n• *User:* @${targetNumber}\n• *Size:* ${fileSizeKB} KB\n• *Method:* Alternative (works for non-contacts)`,
                mentions: [userJid]
              },
              { quoted: mek }
            );
            
            // Clean up
            fs.unlinkSync(imagePath);
          } else {
            throw new Error(`HTTP status ${response.status}`);
          }
        } catch (alternativeError) {
          console.log(`Alternative method failed: ${alternativeError.message}`);
          
          // Final fallback - try directly with the WhatsApp CDN URL pattern
          try {
            console.log("Attempting direct CDN method...");
            
            // Format the number for WhatsApp's CDN
            const cleanNumber = targetNumber.replace(/[^0-9]/g, '');
            
            // Try different CDN URL patterns
            const cdnURLs = [
              `https://pps.whatsapp.net/v/t61.24694-24/${cleanNumber}_l.jpg`,
              `https://pps.whatsapp.net/v/t61.24694-24/${cleanNumber}.jpg`,
              `https://cdn.whatsapp.net/v/t61.24694-24/${cleanNumber}.jpg`
            ];
            
            let cdnSuccess = false;
            
            for (const cdnURL of cdnURLs) {
              try {
                console.log(`Trying CDN URL: ${cdnURL}`);
                
                const response = await axios({
                  method: 'GET',
                  url: cdnURL,
                  responseType: 'arraybuffer',
                  timeout: 5000,
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'image/jpeg,image/png,image/*'
                  },
                  validateStatus: function (status) {
                    return status === 200;
                  }
                });
                
                // Write to file
                fs.writeFileSync(imagePath, Buffer.from(response.data));
                
                // Get file size
                const fileSize = fs.statSync(imagePath).size;
                const fileSizeKB = (fileSize / 1024).toFixed(2);
                
                // Send the profile picture
                await robin.sendMessage(
                  from, 
                  {
                    image: fs.readFileSync(imagePath),
                    caption: `*Profile Picture*\n\n• *User:* @${targetNumber}\n• *Size:* ${fileSizeKB} KB\n• *Method:* Direct CDN`,
                    mentions: [userJid]
                  },
                  { quoted: mek }
                );
                
                // Clean up
                fs.unlinkSync(imagePath);
                cdnSuccess = true;
                break;
              } catch (cdnError) {
                console.log(`CDN URL ${cdnURL} failed: ${cdnError.message}`);
              }
            }
            
            if (!cdnSuccess) {
              throw new Error("All CDN URLs failed");
            }
            
          } catch (cdnError) {
            console.log(`CDN method failed: ${cdnError.message}`);
            
            // Send final error message
            await robin.sendMessage(
              from,
              {
                text: `*❌ Could not get profile picture*\n\n• *User:* @${targetNumber}\n\nPossible reasons:\n- User hasn't set a profile picture\n- Privacy settings prevent access\n- User does not exist on WhatsApp`,
                mentions: [userJid]
              },
              { quoted: mek }
            );
          }
        }
      }
      
    } catch (e) {
      console.error(`Profile pic plugin error: ${e.stack || e}`);
      reply(`Error: ${e.message}`);
    }
  }
);
