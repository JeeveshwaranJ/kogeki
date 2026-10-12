/**
 * Attacks Command
 * Lists all available anime attacks and their properties
 * Supports both Prefix commands (!) and Slash commands (/)
 */

const { EmbedBuilder } = require('discord.js');
const { getAllAttacks } = require('../data/attacks');

async function handleAttacks(context) {
    const allAttacks = getAllAttacks();
    const attackKeys = Object.keys(allAttacks);

    const embed = new EmbedBuilder()
        .setTitle('⚡ Available Anime Attacks')
        .setDescription('Choose your jutsu/technique and challenge your friends in battle!\nUse `!<attack> @user` or `/<attack> user:@user` to strike.')
        .setColor('#FF4500')
        .setThumbnail(context.client.user?.displayAvatarURL() || null);

    for (const key of attackKeys) {
        const atk = allAttacks[key];
        embed.addFields({
            name: `${atk.emoji} ${atk.name} (${atk.anime || 'Anime'})`,
            value: [
                `• **Damage:** \`${atk.minDamage} - ${atk.maxDamage} HP\``,
                `• **Cooldown:** \`${atk.cooldown} seconds\``,
                `• **Commands:** \`!${key} @user\` | \`/${key} user:@user\``,
                atk.description ? `• *${atk.description}*` : ''
            ].filter(Boolean).join('\n'),
            inline: false
        });
    }

    embed.setFooter({
        text: `Total attacks: ${attackKeys.length} • Powered by Anime Attack Bot`
    }).setTimestamp();

    if (context.isChatInputCommand?.()) {
        return context.reply({ embeds: [embed] });
    }
    return context.reply({ embeds: [embed] });
}

module.exports = {
    name: 'attacks',
    description: 'Displays all available anime attacks and their stats',
    usage: '!attacks OR /attacks',
    execute: handleAttacks
};
