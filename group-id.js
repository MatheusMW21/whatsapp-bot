const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Client is ready!');

    // Fetch all chats (including groups)
    const chats = await client.getChats();

    // Find groups and log their names and IDs
    chats.forEach(chat => {
        if (chat.isGroup) {
            console.log(`Group Name: ${chat.name}`);
            console.log(`Group ID: ${chat.id._serialized}`);
        }
    });
});

client.initialize();