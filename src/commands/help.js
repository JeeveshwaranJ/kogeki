/**
 * Help Command
 * Displays bot commands, usage guides, and rules
 * Supports both Prefix commands (!) and Slash commands (/)
 */

const { EmbedBuilder } = require('discord.js');

async function handleHelp(context) {
    const prefix = process.env.PREFIX || '!';

    const embed = new EmbedBuilder()
        .setTitle('⚔️ Anime Attack Bot — Command Guide')
        .setDescription('Challenge other server members using iconic anime attacks, manage health points, and rise to battle!\nBoth **Prefix (`!`)** and **Slash (`/`)** commands are supported.')
        .setColor('#7C4DFF')
        .setThumbnail(context.client.user?.displayAvatarURL() || null)
        .addFields(
            {
                name: '💥 Attack Commands (Dual Prefix & Slash)',
                value: [
                    `• \`${prefix}rasengan @user\`  |  \`/rasengan user:@user\``,
                    `• \`${prefix}chidori @user\`  |  \`/chidori user:@user\``,
                    `• \`${prefix}getsuga @user\`  |  \`/getsuga user:@user\``,
                    `• \`${prefix}kamehameha @user\`  |  \`/kamehameha user:@user\``,
                    `• \`${prefix}bankai @user\`  |  \`/bankai user:@user\``,
                    `• \`${prefix}perv @user\`  |  \`/perv user:@user\` *(Sexy Jutsu)*`,
                    `• \`${prefix}thousandyears @user\`  |  \`/thousandyears user:@user\``,
                    `• \`${prefix}domain @user\`  |  \`/domain user:@user\` *(Domain Expansion)*`,
                    `• \`${prefix}purple @user\`  |  \`/purple user:@user\` *(Hollow Purple)*`,
                    `• \`${prefix}amaterasu @user\`  |  \`/amaterasu user:@user\``,
                    `• \`${prefix}punch @user\`  |  \`/punch user:@user\` *(Serious Punch)*`,
                    `• \`${prefix}spiritbomb @user\`  |  \`/spiritbomb user:@user\``,
                    `• \`${prefix}waterbreathing @user\`  |  \`/waterbreathing user:@user\``,
                    `• \`${prefix}fart @user\`  |  \`/fart user:@user\``,
                    `• \`${prefix}attack <name> @user\`  |  \`/attack attack:<name> user:@user\``
                ].join('\n'),
                inline: false
            },
            {
                name: '📊 Utility & Stats',
                value: [
                    `• \`${prefix}attacks\`  |  \`/attacks\` — List all attacks with stats & cooldowns`,
                    `• \`${prefix}hp\`  |  \`/hp\` — View your current Health Points and status`,
                    `• \`${prefix}hp @user\`  |  \`/hp user:@user\` — View another user's Health Points`,
                    `• \`${prefix}help\`  |  \`/help\` — Display this command guide`
                ].join('\n'),
                inline: false
            },
            {
                name: '📜 Battle Rules & Mechanics',
                value: [
                    `• **Base HP:** Every user starts with **1000 HP**.`,
                    `• **Cooldowns:** Attacks have individual cooldowns per user.`,
                    `• **Defeat & Revival:** If a user's HP reaches 0, they are defeated and will auto-revive after recovery.`,
                    `• **Fair Play:** You cannot attack yourself or bots.`
                ].join('\n'),
                inline: false
            },
            {
                name: '💡 Example Usage',
                value: `\`${prefix}rasengan @Alex\`\n\`/rasengan user:@Alex\`\n\`/attack attack:chidori user:@Alex\``,
                inline: false
            }
        )
        .setFooter({
            text: 'Anime Attack Bot • Node.js & discord.js v14'
        })
        .setTimestamp();

    return context.reply({ embeds: [embed] });
}

module.exports = {
    name: 'help',
    description: 'Displays the bot\'s commands and usage examples',
    usage: '!help OR /help',
    execute: handleHelp
};
