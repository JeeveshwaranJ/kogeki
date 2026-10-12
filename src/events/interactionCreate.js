/**
 * Interaction Create Event Handler
 * Routes and executes slash (/) commands
 */

const attackCommand = require('../commands/attack');
const attacksCommand = require('../commands/attacks');
const hpCommand = require('../commands/hp');
const helpCommand = require('../commands/help');
const { getAttack } = require('../data/attacks');

/**
 * Handle incoming interaction
 * @param {import('discord.js').Interaction} interaction
 */
async function handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        // 1. Universal /attack command
        if (commandName === 'attack') {
            await attackCommand.executeSlash(interaction);
            return;
        }

        // 2. Utility /attacks command
        if (commandName === 'attacks') {
            await attacksCommand.execute(interaction);
            return;
        }

        // 3. Utility /hp command
        if (commandName === 'hp') {
            await hpCommand.execute(interaction);
            return;
        }

        // 4. Utility /help command
        if (commandName === 'help') {
            await helpCommand.execute(interaction);
            return;
        }

        // 5. Direct attack shortcuts (e.g. /rasengan, /chidori, /perv, /domain)
        const attackConfig = getAttack(commandName);
        if (attackConfig) {
            await attackCommand.executeSlash(interaction, commandName);
            return;
        }

        // Unknown command safeguard
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: `❓ Unknown slash command: \`/${commandName}\``,
                ephemeral: true
            });
        }
    } catch (error) {
        console.error(`[Error] Error executing slash command '/${commandName}':`, error);

        const errorMsg = '⚠️ An unexpected error occurred while executing this slash command. Please try again later.';
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: errorMsg }).catch(() => {});
        } else {
            await interaction.reply({ content: errorMsg, ephemeral: true }).catch(() => {});
        }
    }
}

module.exports = {
    name: 'interactionCreate',
    execute: handleInteraction
};
