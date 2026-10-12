/**
 * Message Create Event Handler
 * Parses commands, validates inputs, and delegates to command handlers
 */

const attackCommand = require('../commands/attack');
const attacksCommand = require('../commands/attacks');
const hpCommand = require('../commands/hp');
const helpCommand = require('../commands/help');
const { getAttack } = require('../data/attacks');

// Command registry for standard commands
const commands = new Map([
    ['attack', attackCommand],
    ['attacks', attacksCommand],
    ['hp', hpCommand],
    ['health', hpCommand],
    ['help', helpCommand]
]);

/**
 * Handle incoming message event
 * @param {import('discord.js').Message} message 
 */
async function handleMessage(message) {
    // Ignore bot messages and system messages
    if (message.author.bot || message.system) return;

    const prefix = process.env.PREFIX || '!';

    // Must start with the command prefix
    if (!message.content.startsWith(prefix)) return;

    // Parse command name and arguments
    const content = message.content.slice(prefix.length).trim();
    if (!content) return;

    const [rawCmd, ...args] = content.split(/\s+/);
    const commandName = rawCmd.toLowerCase();

    try {
        // 1. Check for standard commands (!help, !hp, !attacks, !attack)
        if (commands.has(commandName)) {
            const command = commands.get(commandName);
            await command.execute(message, args);
            return;
        }

        // 2. Check if the command itself is an anime attack (e.g. !rasengan, !chidori, !kamehameha)
        const attackConfig = getAttack(commandName);
        if (attackConfig) {
            await attackCommand.executeAttack(message, commandName, args);
            return;
        }

        // 3. Graceful handling for unknown commands
        // If user typed something that starts with prefix, let them know gracefully
        return message.reply({
            content: `❓ **Unknown command:** \`${prefix}${commandName}\`\nType \`${prefix}help\` to see all commands or \`${prefix}attacks\` for all anime attacks!`
        });

    } catch (error) {
        console.error(`[Error] Error executing command '${commandName}':`, error);

        // Graceful error notification to user
        if (message.channel && message.channel.send) {
            message.reply({
                content: '⚠️ An unexpected error occurred while executing this command. Please try again later.'
            }).catch(() => {
                // Ignore failure to reply if missing channel permissions
            });
        }
    }
}

module.exports = {
    name: 'messageCreate',
    execute: handleMessage
};
