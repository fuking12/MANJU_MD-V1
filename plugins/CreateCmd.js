const { cmd, commands } = require('./command.js');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
});

// Client initialization events
client.on('qr', (qr) => {
  console.log('QR Code received, scan it with your WhatsApp app:');
  require('qrcode-terminal').generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp Bot is ready!');
});

client.on('authenticated', () => {
  console.log('Authenticated successfully!');
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failure:', msg);
});

// Register .addplugin command using cmd function
cmd(
  {
    pattern: 'addplugin',
    desc: 'Add a new plugin via WhatsApp message',
    category: 'utility',
    fromMe: false,
    filename: 'addplugin.js',
  },
  async (message, args) => {
    try {
      // Extract plugin code (everything after .addplugin)
      const pluginCode = message.body.slice('.addplugin '.length).trim();

      if (!pluginCode) {
        await message.reply('Please provide plugin code. Format: .addplugin pattern category desc function(message, args) {...}');
        return;
      }

      // Parse plugin code (expected format: pattern category desc handlerFunction)
      const match = pluginCode.match(/^(\w+)\s+(\w+)\s+([^\{]+)\s*(\{[\s\S]+\})$/);
      if (!match) {
        await message.reply('Invalid plugin format. Use: .addplugin pattern category desc function(message, args) {...}');
        return;
      }

      const pattern = match[1];
      const category = match[2];
      const desc = match[3].trim();
      const handlerCode = match[4];

      // Create function from handler code
      const handler = new Function('message', 'args', handlerCode);

      // Register the plugin using cmd function
      cmd(
        {
          pattern: pattern,
          category: category,
          desc: desc,
          fromMe: false,
          filename: 'dynamic_plugin',
        },
        handler
      );

      await message.reply(`Plugin "${pattern}" added successfully! Try using .${pattern}`);
    } catch (error) {
      console.error('Error adding plugin:', error);
      await message.reply('Error adding plugin: ' + error.message);
    }
  }
);

// Message handler
client.on('message', async (message) => {
  // Check if message starts with '.'
  if (message.body.startsWith('.')) {
    const [command, ...args] = message.body.slice(1).split(' ');

    // Find matching command in commands array
    const matchedCommand = commands.find((cmd) => cmd.pattern === command);

    if (matchedCommand) {
      try {
        await matchedCommand.function(message, args);
      } catch (error) {
        console.error(`Error executing command ${command}:`, error);
        await message.reply('Error executing command. Please try again.');
      }
    } else {
      await message.reply('Unrecognized command. Use .addplugin to add a new command or try: ' + commands.map(cmd => `.${cmd.pattern}`).join(', '));
    }
  }
});

// Start the client
client.initialize();
