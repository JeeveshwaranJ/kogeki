/**
 * Attack Command
 * Handles executing anime attacks between users
 * Supports both Prefix commands (!) and Slash commands (/)
 */

const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getAttack, getAllAttacks } = require('../data/attacks');
const hpSystem = require('../systems/hp');
const cooldownSystem = require('../systems/cooldown');

/**
 * Core reusable attack execution logic
 * Shared between Prefix commands and Slash commands
 * 
 * @param {object} options
 * @param {import('discord.js').User} options.attacker - The user executing the attack
 * @param {string} options.attackerName - Display name of attacker
 * @param {import('discord.js').User|null} options.target - The attacked user
 * @param {string} options.attackKey - The attack key (e.g. rasengan, chidori)
 * @param {Function} options.replyError - Handler for validation/error messages
 * @param {Function} options.sendSuccess - Handler for sending final attack card
 */
async function handleAttackCore({ attacker, attackerName, target, attackKey, replyError, sendSuccess }) {
    // 1. Validate attack existence
    const attack = getAttack(attackKey);
    if (!attack) {
        return replyError(
            `❌ **Unknown attack:** \`${attackKey}\`\nUse \`!attacks\` or \`/attacks\` to see all available attacks!`
        );
    }

    // 2. Validation: Missing target
    if (!target) {
        return replyError(
            `🎯 **Please mention a target to attack!**\nExample: \`!${attackKey} @user\` or \`/${attackKey} user:@user\``
        );
    }

    // 3. Validation: Self-attack prevention
    if (target.id === attacker.id) {
        return replyError(
            `❌ **You cannot attack yourself!** Even ninja warriors need self-preservation.`
        );
    }

    // 4. Validation: Attacking bots
    if (target.bot) {
        return replyError(
            `🤖 **You cannot attack bots!** Mechanical beings are immune to anime attacks.`
        );
    }

    // 5. Check per-user attack cooldown
    if (cooldownSystem.isOnCooldown(attacker.id, attackKey)) {
        const remainingSeconds = cooldownSystem.getRemainingSeconds(attacker.id, attackKey);
        return replyError(
            `⏳ **${attack.name}** is on cooldown. Try again in **${remainingSeconds}** second${remainingSeconds === 1 ? '' : 's'}.`
        );
    }

    // 6. Calculate random damage
    const damage = Math.floor(Math.random() * (attack.maxDamage - attack.minDamage + 1)) + attack.minDamage;

    // 7. Apply damage via persistent SQLite HP system
    const targetName = target.displayName || target.username;
    const result = hpSystem.applyDamage(target.id, targetName, damage, attacker.id);

    // If target was already defeated and is still regenerating
    if (result.alreadyDefeated) {
        return replyError(
            `💀 **${targetName}** is already defeated!\nThey are recovering their chakra. Try again in **${result.remainingRevivalSeconds}**s.`
        );
    }

    // 8. Put attack on cooldown for this user
    cooldownSystem.setCooldown(attacker.id, attackKey, attack.cooldown);

    // 9. Build attractive Discord Embed
    const embed = new EmbedBuilder()
        .setTitle(`${attack.emoji} ${attack.name.toUpperCase()}!`)
        .setDescription(`**${attackerName}** unleashed **${attack.name}** on **${targetName}**!`)
        .setColor(attack.color || '#E91E63')
        .setFooter({
            text: `Anime: ${attack.anime || 'Anime Universe'} • Cooldown: ${attack.cooldown}s`
        })
        .setTimestamp();

    // Prepare GIF image attachment
    const files = [];
    const localFilePath = attack.localFile ? path.resolve(__dirname, '../../', attack.localFile) : null;
    const attachmentFileName = `${attackKey}.gif`;

    // Discord default bot file upload limit is 8-10MB without Nitro boost
    const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

    if (localFilePath && fs.existsSync(localFilePath)) {
        const stats = fs.statSync(localFilePath);
        if (stats.size <= MAX_ATTACHMENT_BYTES) {
            const fileAttachment = new AttachmentBuilder(localFilePath, { name: attachmentFileName });
            files.push(fileAttachment);
            embed.setImage(`attachment://${attachmentFileName}`);
        } else if (attack.gif && attack.gif.trim() !== '') {
            embed.setImage(attack.gif);
        }
    } else if (attack.gif && attack.gif.trim() !== '') {
        embed.setImage(attack.gif);
    }

    // If the target's HP reached 0
    if (result.isDefeated) {
        embed.addFields({
            name: '💀 DEFEATED!',
            value: `**${targetName} has been defeated!**\nAuto-reviving in **${result.remainingRevivalSeconds}** seconds...`,
            inline: false
        });
    }

    // 10. Send payload
    return sendSuccess({
        content: `⚔️ <@${target.id}> has been attacked!`,
        embeds: [embed],
        files: files,
        fallbackGif: attack.gif
    });
}

/**
 * Execute attack from prefix command (!rasengan @user)
 * @param {import('discord.js').Message} message 
 * @param {string} attackKey 
 * @param {string[]} args 
 */
async function executeAttack(message, attackKey, args = []) {
    let target = message.mentions.users.first();

    // If not in mentions, check if first argument is a user ID
    if (!target && args[0]) {
        const potentialId = args[0].replace(/[<@!>]/g, '');
        if (/^\d{17,20}$/.test(potentialId)) {
            try {
                target = await message.client.users.fetch(potentialId);
            } catch (err) {
                target = null;
            }
        }
    }

    const attacker = message.author;
    const attackerName = message.member?.displayName || message.author.username;

    return handleAttackCore({
        attacker,
        attackerName,
        target,
        attackKey,
        replyError: async (content) => message.reply({ content }),
        sendSuccess: async ({ content, embeds, files, fallbackGif }) => {
            try {
                return await message.channel.send({ content, embeds, files });
            } catch (err) {
                if (files.length > 0 && fallbackGif) {
                    embeds[0].setImage(fallbackGif);
                    return await message.channel.send({ content, embeds, files: [] });
                }
                throw err;
            }
        }
    });
}

/**
 * Execute attack from slash command (/rasengan user:@user or /attack attack:rasengan user:@user)
 * @param {import('discord.js').ChatInputCommandInteraction} interaction 
 * @param {string|null} attackKeyOverride 
 */
async function executeSlash(interaction, attackKeyOverride = null) {
    const attackKey = attackKeyOverride || interaction.options.getString('attack')?.toLowerCase();
    const target = interaction.options.getUser('user');

    // Always defer reply since GIF loading/processing can take time
    await interaction.deferReply();

    const attacker = interaction.user;
    const attackerName = interaction.member?.displayName || interaction.user.username;

    return handleAttackCore({
        attacker,
        attackerName,
        target,
        attackKey,
        replyError: async (content) => interaction.editReply({ content }),
        sendSuccess: async ({ content, embeds, files, fallbackGif }) => {
            try {
                return await interaction.editReply({ content, embeds, files });
            } catch (err) {
                if (files.length > 0 && fallbackGif) {
                    embeds[0].setImage(fallbackGif);
                    return await interaction.editReply({ content, embeds, files: [] });
                }
                throw err;
            }
        }
    });
}

module.exports = {
    name: 'attack',
    description: 'Attack another user with an anime move',
    usage: '!attack <attack_name> @user OR !<attack_name> @user',
    execute: async (message, args) => {
        // Universal command syntax: !attack <attack_name> @user
        if (args.length === 0) {
            return message.reply({
                content: `❓ **Usage:** \`!attack <attack> @user\`\nExample: \`!attack rasengan @${message.author.username}\`\nType \`!attacks\` to see all moves!`
            });
        }

        const attackKey = args[0].toLowerCase();
        const targetArgs = args.slice(1);
        return executeAttack(message, attackKey, targetArgs);
    },
    executeAttack,
    executeSlash,
    handleAttackCore
};
