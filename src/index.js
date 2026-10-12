/**
 * Anime Attack Bot - Main Entry Point
 * Built with Node.js and discord.js v14
 */

require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, Events } = require('discord.js');
const messageCreateEvent = require('./events/messageCreate');
const interactionCreateEvent = require('./events/interactionCreate');

// Validate Discord Bot Token
const token = process.env.DISCORD_TOKEN;
if (!token || token === 'your_bot_token_here' || token.trim() === '') {
    console.error('================================================================');
    console.error('❌ ERROR: DISCORD_TOKEN is missing or not configured in .env file!');
    console.error('Please open .env and add your valid Discord bot token:');
    console.error('DISCORD_TOKEN=your_token_here');
    console.error('================================================================');
    process.exit(1);
}

// Initialize Discord Client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // Required to read prefix commands like !rasengan
    ]
});

// Bot Ready Event
client.once('clientReady', () => {
    console.log('====================================================');
    console.log(`🤖 Logged in successfully as: ${client.user.tag}`);
    console.log(`🆔 Application (Client) ID: ${client.user.id}`);
    console.log(`⚡ Connected to ${client.guilds.cache.size} server(s)`);
    console.log(`🗡️  Prefix: ${process.env.PREFIX || '!'}`);
    console.log('⚔️  Anime Attack Bot is ready for battle!');
    console.log('====================================================');

    // Set custom activity status
    client.user.setPresence({
        activities: [{
            name: `${process.env.PREFIX || '!'}help | Anime Attacks ⚡`,
            type: ActivityType.Playing
        }],
        status: 'online'
    });
});

// Handle incoming prefix messages (!)
client.on(Events.MessageCreate, (message) => {
    messageCreateEvent.execute(message);
});

// Handle incoming slash command interactions (/)
client.on(Events.InteractionCreate, (interaction) => {
    interactionCreateEvent.execute(interaction);
});

// Global Error Handlers to prevent bot crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Unhandled Rejection]', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[Uncaught Exception]', error);
});

// Graceful process termination
const cleanup = () => {
    console.log('\nShutting down Anime Attack Bot...');
    client.destroy();
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Login to Discord
client.login(token).catch((err) => {
    console.error('❌ Failed to login to Discord:', err.message);
    console.error('Verify that your token in .env is correct and that your bot has privileged Message Content intent enabled.');
});
