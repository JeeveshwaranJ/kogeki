# ⚡ Kōgeki — Anime Attack Discord Bot

An interactive and modular anime attack Discord bot built with **Node.js, JavaScript, and discord.js v14**.

Supports **both Prefix commands (`!`) and official Discord Slash commands (`/`)** seamlessly!

---

## 🌟 Key Features

- **Dual Command Support**:
  - Prefix commands: `!rasengan @user`
  - Slash commands: `/rasengan user:@user`
- **13+ Iconic Anime Attacks & Perv Moves**:
  - `!rasengan` / `/rasengan` (Naruto)
  - `!chidori` / `/chidori` (Naruto)
  - `!getsuga` / `/getsuga` (Bleach)
  - `!kamehameha` / `/kamehameha` (Dragon Ball)
  - `!bankai` / `/bankai` (Bleach)
  - `!perv` / `/perv` or `!sexyjutsu` / `/sexyjutsu` (Naruto Sexy Jutsu)
  - `!thousandyears` / `/thousandyears` (Naruto Sennen Goroshi)
  - `!domain` / `/domain` (JJK Domain Expansion)
  - `!purple` / `/purple` (JJK Hollow Purple)
  - `!amaterasu` / `/amaterasu` (Naruto Mangekyo Sharingan)
  - `!punch` / `/punch` (One Punch Man Serious Punch)
  - `!spiritbomb` / `/spiritbomb` (Dragon Ball Z)
  - `!waterbreathing` / `/waterbreathing` (Demon Slayer)
  - `!attack <name> @user` / `/attack attack:<name> user:@user` (Universal syntax)
- **Shared, Reusable Engine**:
  - Prefix and Slash commands share the exact same attack execution logic, cooldowns, and damage calculations.
- **Persistent HP System (SQLite)**:
  - Base health of **1000 HP** for every user.
  - Automatically tracks battle victories and defeats.
  - When HP hits `0`, the target is defeated and automatically revives after a recovery duration.
- **Per-User Cooldown Engine**:
  - Independent cooldown tracking per user, per attack.
  - Real-time countdown warnings: `⏳ Rasengan is on cooldown. Try again in 4 seconds.`
- **Visual Discord Embeds & GIFs**:
  - Custom color scheme per anime attack.
  - Animated battle GIFs loaded locally or via direct CDN.
  - Automatic size limits and upload fallback guards.

---

## 📁 Project Structure

```text
anime-attack-bot/
│
├── src/
│   ├── commands/
│   │   ├── attack.js        # Core attack logic (shared by prefix & slash commands)
│   │   ├── attacks.js       # List attacks, damage, and cooldowns
│   │   ├── hp.js            # User HP status and battle record
│   │   ├── help.js          # Help menu displaying ! and / commands
│   │   └── slashCommands.js # SlashCommandBuilder application command definitions
│   │
│   ├── events/
│   │   ├── messageCreate.js     # Handles prefix commands (!)
│   │   └── interactionCreate.js # Handles slash command interactions (/)
│   │
│   ├── data/
│   │   └── attacks.js       # Extensible attack configuration & GIF links
│   │
│   ├── systems/
│   │   ├── cooldown.js      # Per-user attack cooldown tracker
│   │   └── hp.js            # SQLite persistent health & auto-revival engine
│   │
│   ├── deploy-commands.js   # Script to register slash commands to Discord
│   └── index.js             # Client initialization, intents, presence & event router
│
├── assets/
│   └── gifs/                # Local verified high-res attack GIFs
│
├── test/
│   └── test_systems.js      # Automated unit test suite
│
├── .env                     # Private environment configuration
├── .env.example             # Configuration template
├── .gitignore               # Git ignore list
├── package.json             # Dependencies and scripts
└── README.md                # Documentation
```

---

## 🚀 Setup & Installation Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure `.env`
Open `.env` (or copy `.env.example` to `.env`):

```env
# Discord Bot Token
DISCORD_TOKEN=your_bot_token_here

# Discord Client (Application) ID
CLIENT_ID=your_client_id_here

# Discord Server (Guild) ID for INSTANT slash command updates (Optional)
GUILD_ID=your_test_server_id_here

# Command Prefix (default: !)
PREFIX=!

# Defeated recovery duration in seconds (default: 60)
HP_RESTORE_TIME_SECONDS=60
```

> **Tip for Guild ID**: In Discord, enable **User Settings -> Advanced -> Developer Mode**, then right-click your server icon and click **Copy Server ID**. Adding your `GUILD_ID` allows slash commands to update **instantly** without waiting for Discord's global cache!

---

## ⚡ Deploying Slash Commands

Run the deployment script to register your slash commands with Discord:

```bash
# Register commands (instant update if GUILD_ID is in .env, otherwise global)
npm run deploy

# Or register globally across all servers:
npm run deploy -- --global
```

You should see:
```text
====================================================
📦 Loaded 22 application (/) commands for registration.
📍 Deploying commands to Guild (Server ID: 123456789)...
⚡ (Guild commands update INSTANTLY in your server!)
✅ Successfully deployed 22 slash commands!
====================================================
```

---

## 🎮 Starting the Bot

Start your bot locally:

```bash
npm start
```

You can now use both command styles in Discord:
- **Prefix**: `!rasengan @user`
- **Slash**: `/rasengan user:@user`
- **Universal**: `!attack rasengan @user` or `/attack attack:rasengan user:@user`
- **List Attacks**: `!attacks` or `/attacks`
- **Check Health**: `!hp` or `/hp`
- **Help Menu**: `!help` or `/help`
