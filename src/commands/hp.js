/**
 * HP (Health Points) Command
 * Checks the current HP and battle status of the user
 * Supports both Prefix commands (!) and Slash commands (/)
 */

const { EmbedBuilder } = require('discord.js');
const hpSystem = require('../systems/hp');

async function handleHp(context, args = []) {
    let target = null;

    if (context.isChatInputCommand?.()) {
        target = context.options.getUser('user') || context.user;
    } else {
        target = context.author;
        if (context.mentions?.users?.first()) {
            target = context.mentions.users.first();
        } else if (args && args[0]) {
            const potentialId = args[0].replace(/[<@!>]/g, '');
            if (/^\d{17,20}$/.test(potentialId)) {
                try {
                    target = await context.client.users.fetch(potentialId);
                } catch {
                    target = context.author;
                }
            }
        }
    }

    // Check if target is a bot
    if (target.bot) {
        return context.reply({
            content: `🤖 **${target.username}** is an immortal bot with infinite HP (∞ / ∞)!`
        });
    }

    const targetName = target.displayName || target.username;
    const profile = hpSystem.getUser(target.id, targetName);
    const healthBar = hpSystem.createHealthBar(profile.hp, profile.max_hp, 10);
    const percentage = Math.round((profile.hp / profile.max_hp) * 100);

    let statusText = '💪 Alive & Ready for Battle';
    let statusColor = '#00E676'; // Green

    if (profile.hp <= 0 && profile.defeated_at) {
        const elapsed = Date.now() - profile.defeated_at;
        const restoreDuration = hpSystem.getRestoreTimeMs();
        const remaining = Math.max(0, Math.ceil((restoreDuration - elapsed) / 1000));

        statusText = `💀 Defeated! (Reviving in ${remaining}s)`;
        statusColor = '#D50000'; // Red
    } else if (percentage <= 25) {
        statusText = '⚠️ Critical Condition!';
        statusColor = '#FF1744'; // Red-orange
    } else if (percentage <= 50) {
        statusText = '🩹 Injured';
        statusColor = '#FFEA00'; // Yellow
    }

    const embed = new EmbedBuilder()
        .setTitle(`❤️ ${targetName}'s Health Status`)
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setColor(statusColor)
        .addFields(
            {
                name: '👤 User',
                value: `<@${target.id}>`,
                inline: true
            },
            {
                name: '📊 Health Points',
                value: `**${profile.hp} / ${profile.max_hp} HP** (${percentage}%)`,
                inline: true
            },
            {
                name: 'Status',
                value: statusText,
                inline: true
            },
            {
                name: 'Health Gauge',
                value: healthBar,
                inline: false
            },
            {
                name: '⚔️ Battle Record',
                value: `🏆 KOs Dealt: **${profile.battles_won}** | 💀 Times Defeated: **${profile.battles_lost}**`,
                inline: false
            }
        )
        .setFooter({
            text: 'Default HP: 1000 • Auto-revives on defeat'
        })
        .setTimestamp();

    return context.reply({ embeds: [embed] });
}

module.exports = {
    name: 'hp',
    description: 'Check your current HP or another user\'s HP',
    usage: '!hp [@user] OR /hp [user:@user]',
    execute: handleHp
};
