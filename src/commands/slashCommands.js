/**
 * Slash Commands Registry & Definitions
 * Uses SlashCommandBuilder from discord.js v14
 */

const { SlashCommandBuilder } = require('discord.js');
const { getAllAttacks, getAttack } = require('../data/attacks');

/**
 * Builds and returns an array of all application (slash) command JSON definitions
 * @returns {object[]} Array of REST-compatible command JSON definitions
 */
function getSlashCommandsData() {
    const commands = [];

    // 1. Universal /attack command
    const universalAttack = new SlashCommandBuilder()
        .setName('attack')
        .setDescription('Attack a Discord user with any anime attack')
        .addStringOption(option =>
            option
                .setName('attack')
                .setDescription('The name of the attack to unleash (e.g. rasengan, chidori, bankai)')
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member you want to attack')
                .setRequired(true)
        );
    commands.push(universalAttack.toJSON());

    // 2. Individual shortcut slash commands for every attack in data/attacks.js
    const allAttacks = getAllAttacks();
    for (const [key, atk] of Object.entries(allAttacks)) {
        const cmd = new SlashCommandBuilder()
            .setName(key)
            .setDescription(`Unleash ${atk.name} (${atk.anime || 'Anime'}) on a user`)
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription(`The target to attack with ${atk.name}`)
                    .setRequired(true)
            );
        commands.push(cmd.toJSON());
    }

    // 3. Common aliases as top-level shortcut slash commands
    const aliases = [
        { name: 'perv', targetKey: 'sexyjutsu', desc: 'Use Sexy Jutsu on a user' },
        { name: 'domain', targetKey: 'domainexpansion', desc: 'Use Domain Expansion on a user' },
        { name: 'purple', targetKey: 'hollowpurple', desc: 'Use Hollow Purple on a user' },
        { name: 'punch', targetKey: 'seriouspunch', desc: 'Use Saitama Serious Punch on a user' },
        { name: 'tyod', targetKey: 'thousandyears', desc: 'Use Thousand Years of Death on a user' }
    ];

    for (const alias of aliases) {
        // Only add if not already in commands list
        if (!commands.some(c => c.name === alias.name)) {
            const cmd = new SlashCommandBuilder()
                .setName(alias.name)
                .setDescription(alias.desc)
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to attack')
                        .setRequired(true)
                );
            commands.push(cmd.toJSON());
        }
    }

    // 4. /attacks utility command
    const attacksCmd = new SlashCommandBuilder()
        .setName('attacks')
        .setDescription('Display all available anime attacks, damage ranges, and cooldowns');
    commands.push(attacksCmd.toJSON());

    // 5. /hp utility command
    const hpCmd = new SlashCommandBuilder()
        .setName('hp')
        .setDescription('Check your current HP or another user\'s HP')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user whose HP you want to check (leave empty for yourself)')
                .setRequired(false)
        );
    commands.push(hpCmd.toJSON());

    // 6. /help utility command
    const helpCmd = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display the bot guide, command list, and battle mechanics');
    commands.push(helpCmd.toJSON());

    return commands;
}

module.exports = {
    getSlashCommandsData
};
