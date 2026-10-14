/**
 * Attack Configuration Database
 * 
 * To add a new anime attack:
 * Simply add a new key below with:
 *  - name: Display name of the attack
 *  - anime: The anime series the attack is from
 *  - emoji: Associated emoji
 *  - minDamage: Minimum damage dealt
 *  - maxDamage: Maximum damage dealt
 *  - cooldown: Cooldown in seconds for the user
 *  - color: Hex color code for the Discord embed
 *  - gif: Direct GIF URL displayed in Discord
 *  - description: Brief description of the attack
 */

const attacks = {
    rasengan: {
        name: "Rasengan",
        anime: "Naruto",
        emoji: "🌀",
        minDamage: 50,
        maxDamage: 100,
        cooldown: 5,
        color: "#1E90FF",
        gif: "https://media1.tenor.com/m/dVmmLryumyIAAAAC/noticeded.gif",
        localFile: "assets/gifs/rasengan.gif",
        description: "A spinning ball of compressed chakra formed in the palm of the hand."
    },

    chidori: {
        name: "Chidori",
        anime: "Naruto",
        emoji: "⚡",
        minDamage: 40,
        maxDamage: 110,
        cooldown: 5,
        color: "#00E5FF",
        gif: "https://media1.tenor.com/m/vD_zDK1eerEAAAAd/sasuke-chidori.gif",
        localFile: "assets/gifs/chidori.gif",
        description: "A high-concentration thrust of lightning chakra that chirps like a thousand birds."
    },

    getsuga: {
        name: "Getsuga Tensho",
        anime: "Bleach",
        emoji: "🌑",
        minDamage: 60,
        maxDamage: 120,
        cooldown: 7,
        color: "#8B0000",
        gif: "https://media1.tenor.com/m/9JCm2CbhGKkAAAAd/bleach-ironsilver.gif",
        localFile: "assets/gifs/getsuga.gif",
        description: "Fires concentrated spiritual pressure from the blade in a crescent slash."
    },

    kamehameha: {
        name: "Kamehameha",
        anime: "Dragon Ball",
        emoji: "💥",
        minDamage: 70,
        maxDamage: 130,
        cooldown: 8,
        color: "#00BFFF",
        gif: "https://media1.tenor.com/m/KYgf0F7s1v8AAAAC/dragon-ball-super-goku.gif",
        localFile: "assets/gifs/kamehameha.gif",
        description: "A powerful blast of concentrated latent Ki energy fired from cupped hands."
    },

    bankai: {
        name: "Bankai",
        anime: "Bleach",
        emoji: "⚔️",
        minDamage: 80,
        maxDamage: 150,
        cooldown: 10,
        color: "#7B1FA2",
        gif: "https://media1.tenor.com/m/0uTbOCbxtPkAAAAd/bankai-senbonzakura-kageyoshi.gif",
        localFile: "assets/gifs/bankai.gif",
        description: "The ultimate Zanpakuto release, unleashing immense destructive power."
    },

    sexyjutsu: {
        name: "Sexy Jutsu",
        anime: "Naruto",
        emoji: "💋",
        minDamage: 35,
        maxDamage: 95,
        cooldown: 5,
        color: "#FF69B4",
        gif: "https://media1.tenor.com/m/p19kr6b4sLUAAAAC/anime-manga.gif",
        localFile: "assets/gifs/sexyjutsu.gif",
        description: "Transforms into a stunning figure, inflicting a lethal nosebleed and massive distraction!"
    },

    thousandyears: {
        name: "Thousand Years of Death",
        anime: "Naruto",
        emoji: "👉",
        minDamage: 30,
        maxDamage: 85,
        cooldown: 4,
        color: "#FF8C00",
        gif: "https://i.pinimg.com/originals/69/95/f6/6995f6a0dd021ae706b4726b1537a83e.gif",
        localFile: "assets/gifs/thousandyears.gif",
        description: "A legendary secret taijutsu where two fingers are forcefully thrust into the target!"
    },

    domainexpansion: {
        name: "Domain Expansion",
        anime: "Jujutsu Kaisen",
        emoji: "🤞",
        minDamage: 90,
        maxDamage: 165,
        cooldown: 12,
        color: "#4A148C",
        gif: "https://media1.tenor.com/m/MfMS51gTUc4AAAAd/satoru-gojo-domain-expansion.gif",
        localFile: "assets/gifs/domainexpansion.gif",
        description: "Expands an innate domain, trapping the target in a space with a guaranteed-hit attack!"
    },

    hollowpurple: {
        name: "Hollow Purple",
        anime: "Jujutsu Kaisen",
        emoji: "🔮",
        minDamage: 85,
        maxDamage: 160,
        cooldown: 10,
        color: "#8A2BE2",
        gif: "https://media1.tenor.com/m/iQUf_YXMOlUAAAAd/gojo-satoru-hollow-purple.gif",
        localFile: "assets/gifs/hollowpurple.gif",
        description: "Combines Blue and Red into an imaginary mass that erases everything in its path."
    },

    amaterasu: {
        name: "Amaterasu",
        anime: "Naruto",
        emoji: "🔥",
        minDamage: 75,
        maxDamage: 140,
        cooldown: 9,
        color: "#212121",
        gif: "https://media1.tenor.com/m/g7NxVOQ8ziAAAAAC/itachi-sharingan.gif",
        localFile: "assets/gifs/amaterasu.gif",
        description: "Ignites inextinguishable black flames of the Mangekyo Sharingan upon the target."
    },

    seriouspunch: {
        name: "Serious Punch",
        anime: "One Punch Man",
        emoji: "👊",
        minDamage: 100,
        maxDamage: 200,
        cooldown: 15,
        color: "#D50000",
        gif: "https://media1.tenor.com/m/vZN9K_z-Bq4AAAAd/saitama.gif",
        localFile: "assets/gifs/seriouspunch.gif",
        description: "A devastating full-strength punch from Saitama that parts the atmosphere."
    },

    spiritbomb: {
        name: "Spirit Bomb",
        anime: "Dragon Ball",
        emoji: "☀️",
        minDamage: 95,
        maxDamage: 175,
        cooldown: 12,
        color: "#00E5FF",
        gif: "https://i.pinimg.com/originals/55/53/ab/5553ab657086178c6940d04dee914236.gif",
        localFile: "assets/gifs/spiritbomb.gif",
        description: "Gathers latent energy from across the galaxy into a giant sphere of pure light."
    },

    waterbreathing: {
        name: "Water Breathing",
        anime: "Demon Slayer",
        emoji: "🌊",
        minDamage: 65,
        maxDamage: 125,
        cooldown: 7,
        color: "#0288D1",
        gif: "https://media1.tenor.com/m/cUTX3c265cEAAAAC/water-breathing-power.gif",
        localFile: "assets/gifs/waterbreathing.gif",
        description: "Unleashes a flowing, continuous dragon blade slash of high-speed water."
    },

    fart: {
        name: "Fart",
        anime: "Anime",
        emoji: "💨",
        minDamage: 25,
        maxDamage: 80,
        cooldown: 4,
        color: "#8BC34A",
        gif: "https://media1.tenor.com/m/QVmVpgsRCesAAAAC/anime-fart.gif",
        localFile: "assets/gifs/fart.gif",
        description: "Unleashes a lethal bio-gas blast directly on the target!"
    },

    slipper: {
        name: "Slipper",
        anime: "Anime",
        emoji: "🩴",
        minDamage: 30,
        maxDamage: 75,
        cooldown: 4,
        color: "#FF9800",
        gif: "https://media1.tenor.com/m/Gqt_vhCUwh0AAAAC/the-demon-prince-of-momochi-shoe.gif",
        localFile: "assets/gifs/slipper.gif",
        description: "Throws a high-velocity precision slipper right at the target's face!"
    },

    nuke: {
        name: "Nuke",
        anime: "Anime",
        emoji: "☢️",
        minDamage: 110,
        maxDamage: 210,
        cooldown: 15,
        color: "#FF3D00",
        gif: "https://media1.tenor.com/m/V6k3KbrycpsAAAAC/anime-explosion.gif",
        localFile: "assets/gifs/nuke.gif",
        description: "Drops a colossal tactical atomic explosion, vaporizing the entire battlefield!"
    },

    grope: {
        name: "Grope",
        anime: "Anime",
        emoji: "👐",
        minDamage: 30,
        maxDamage: 85,
        cooldown: 5,
        color: "#E91E63",
        gif: "https://24.media.tumblr.com/7c1a0347bad4e4930699c4deea4cc919/tumblr_mkke80kTLV1s83c9go1_500.gif",
        localFile: "assets/gifs/grope.gif",
        description: "A sneaky comedic grope attack causing maximum embarrassment and psychological damage!"
    }
};

// Aliases mapping common shortcuts
const aliases = {
    perv: 'sexyjutsu',
    sexy: 'sexyjutsu',
    oiroke: 'sexyjutsu',
    sennen: 'thousandyears',
    tyod: 'thousandyears',
    domain: 'domainexpansion',
    purple: 'hollowpurple',
    saitama: 'seriouspunch',
    punch: 'seriouspunch',
    genkidama: 'spiritbomb',
    shoe: 'slipper',
    chappal: 'slipper',
    explosion: 'nuke'
};

/**
 * Get an attack by key (case-insensitive, supports aliases)
 * @param {string} attackKey 
 * @returns {object|null}
 */
function getAttack(attackKey) {
    if (!attackKey) return null;
    const key = attackKey.toLowerCase().trim();
    const resolvedKey = aliases[key] || key;
    return attacks[resolvedKey] || null;
}

/**
 * Get all available attack keys and objects
 * @returns {object}
 */
function getAllAttacks() {
    return attacks;
}

module.exports = {
    attacks,
    getAttack,
    getAllAttacks
};
