/**
 * Slash Commands Deployment Script
 * Registers application (/) commands to Discord via REST API
 * 
 * Usage:
 *   npm run deploy          (Deploys to GUILD_ID if set in .env for instant testing, else global)
 *   npm run deploy --global (Deploys globally to all servers)
 */

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { getSlashCommandsData } = require('./commands/slashCommands');

async function deploy() {
    const token = process.env.DISCORD_TOKEN;
    let clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;
    const isGlobal = process.argv.includes('--global') || (!guildId && true);

    if (!token || token === 'your_bot_token_here' || token.trim() === '') {
        console.error('❌ Error: DISCORD_TOKEN is missing or not configured in .env file!');
        process.exit(1);
    }

    const rest = new REST({ version: '10' }).setToken(token);

    // Auto-detect CLIENT_ID from token if not provided in .env
    if (!clientId || clientId === 'your_client_id_here' || clientId.trim() === '') {
        console.log('🔍 CLIENT_ID not provided in .env. Fetching Application ID automatically from Discord...');
        try {
            const app = await rest.get(Routes.oauth2CurrentApplication());
            clientId = app.id;
            console.log(`✓ Detected Application (Client) ID: ${clientId}`);
        } catch (err) {
            console.error('❌ Failed to fetch Application ID automatically:', err.message);
            console.error('Please set CLIENT_ID in your .env file.');
            process.exit(1);
        }
    }

    const commands = getSlashCommandsData();
    console.log(`====================================================`);
    console.log(`📦 Loaded ${commands.length} application (/) commands for registration.`);

    try {
        if (!isGlobal && guildId) {
            console.log(`📍 Deploying commands to Guild (Server ID: ${guildId})...`);
            console.log(`⚡ (Guild commands update INSTANTLY in your server!)`);

            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );

            console.log(`====================================================`);
            console.log(`✅ Successfully deployed ${data.length} slash commands to server ${guildId}!`);
            console.log(`💡 You can now type '/' in your Discord server to use them.`);
            console.log(`====================================================`);
        } else {
            console.log(`🌐 Deploying commands GLOBALLY across all Discord servers...`);
            console.log(`⏳ (Global commands may take up to an hour to cache across Discord)`);

            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );

            console.log(`====================================================`);
            console.log(`✅ Successfully deployed ${data.length} global slash commands!`);
            console.log(`====================================================`);
        }
    } catch (error) {
        console.error('❌ Error deploying application commands:', error);
        if (error.code === 50001) {
            console.error('⚠️ Missing Access: Ensure the bot is invited to the guild and has application.commands scope.');
        }
    }
}

deploy();
