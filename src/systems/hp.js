/**
 * Persistent HP (Health Points) System
 * Backed by SQLite via better-sqlite3
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high performance and durability
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username TEXT,
        hp INTEGER NOT NULL DEFAULT 1000,
        max_hp INTEGER NOT NULL DEFAULT 1000,
        defeated_at INTEGER DEFAULT NULL,
        last_attacked_at INTEGER DEFAULT NULL,
        battles_won INTEGER NOT NULL DEFAULT 0,
        battles_lost INTEGER NOT NULL DEFAULT 0
    );
`);

// Prepared statements for maximum query efficiency
const stmtGetUser = db.prepare('SELECT * FROM users WHERE user_id = ?');
const stmtInsertUser = db.prepare(`
    INSERT INTO users (user_id, username, hp, max_hp, defeated_at, last_attacked_at)
    VALUES (?, ?, ?, ?, NULL, NULL)
`);
const stmtUpdateHP = db.prepare(`
    UPDATE users 
    SET hp = ?, username = ?, defeated_at = ?, last_attacked_at = ?
    WHERE user_id = ?
`);
const stmtIncrementWins = db.prepare(`
    UPDATE users SET battles_won = battles_won + 1 WHERE user_id = ?
`);
const stmtIncrementLosses = db.prepare(`
    UPDATE users SET battles_lost = battles_lost + 1 WHERE user_id = ?
`);
const stmtRestoreHP = db.prepare(`
    UPDATE users SET hp = max_hp, defeated_at = NULL WHERE user_id = ?
`);

const DEFAULT_MAX_HP = 1000;

/**
 * Get the configurable HP restoration time in milliseconds
 */
function getRestoreTimeMs() {
    const seconds = parseInt(process.env.HP_RESTORE_TIME_SECONDS, 10);
    return (isNaN(seconds) || seconds <= 0 ? 60 : seconds) * 1000;
}

/**
 * Get or initialize a user profile from the database
 * Automatically resolves HP restoration if cooldown has elapsed
 * @param {string} userId - Discord User ID
 * @param {string} username - Discord Username
 * @returns {object} User record
 */
function getUser(userId, username = 'Unknown') {
    let user = stmtGetUser.get(userId);

    if (!user) {
        stmtInsertUser.run(userId, username, DEFAULT_MAX_HP, DEFAULT_MAX_HP);
        user = stmtGetUser.get(userId);
    }

    // Check if user was defeated and restoration period has expired
    if (user.hp <= 0 && user.defeated_at) {
        const elapsed = Date.now() - user.defeated_at;
        const restoreDuration = getRestoreTimeMs();

        if (elapsed >= restoreDuration) {
            stmtRestoreHP.run(userId);
            user = stmtGetUser.get(userId);
        }
    }

    return user;
}

/**
 * Apply damage to a user
 * @param {string} targetId - Discord User ID of the target
 * @param {string} targetUsername - Discord Username of the target
 * @param {number} damage - Damage amount to subtract
 * @param {string} attackerId - Optional attacker ID for stats
 * @returns {object} { previousHp, newHp, maxHp, isDefeated, alreadyDefeated, remainingRevivalSeconds }
 */
function applyDamage(targetId, targetUsername, damage, attackerId = null) {
    const user = getUser(targetId, targetUsername);
    const restoreDuration = getRestoreTimeMs();

    // If user is currently defeated and waiting to revive
    if (user.hp <= 0 && user.defeated_at) {
        const elapsed = Date.now() - user.defeated_at;
        if (elapsed < restoreDuration) {
            const remainingSeconds = Math.ceil((restoreDuration - elapsed) / 1000);
            return {
                previousHp: 0,
                newHp: 0,
                maxHp: user.max_hp,
                isDefeated: true,
                alreadyDefeated: true,
                remainingRevivalSeconds: remainingSeconds
            };
        } else {
            // Restore immediately
            stmtRestoreHP.run(targetId);
            user.hp = user.max_hp;
            user.defeated_at = null;
        }
    }

    const previousHp = user.hp;
    const newHp = Math.max(0, previousHp - damage);
    const now = Date.now();
    const isDefeated = newHp === 0;
    const defeatedAt = isDefeated ? now : null;

    stmtUpdateHP.run(newHp, targetUsername, defeatedAt, now, targetId);

    if (isDefeated) {
        stmtIncrementLosses.run(targetId);
        if (attackerId) {
            stmtIncrementWins.run(attackerId);
        }
    }

    return {
        previousHp,
        newHp,
        maxHp: user.max_hp,
        isDefeated,
        alreadyDefeated: false,
        remainingRevivalSeconds: isDefeated ? Math.ceil(restoreDuration / 1000) : 0
    };
}

/**
 * Restores a user's HP to maximum
 * @param {string} userId 
 */
function restoreUser(userId) {
    stmtRestoreHP.run(userId);
    return stmtGetUser.get(userId);
}

/**
 * Generate a visual ASCII/Unicode Health Bar
 * @param {number} current 
 * @param {number} max 
 * @param {number} size - Length of bar (default 10)
 * @returns {string} e.g. "🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜"
 */
function createHealthBar(current, max, size = 10) {
    const percentage = Math.max(0, Math.min(1, current / max));
    const filledBlocks = Math.round(percentage * size);
    const emptyBlocks = size - filledBlocks;

    // Use colored emoji indicators based on health percentage
    let fillChar = '🟩'; // Green for high HP
    if (percentage <= 0.25) {
        fillChar = '🟥'; // Red for critical HP
    } else if (percentage <= 0.50) {
        fillChar = '🟨'; // Yellow for low HP
    }

    const emptyChar = '⬛';
    return `${fillChar.repeat(filledBlocks)}${emptyChar.repeat(emptyBlocks)}`;
}

module.exports = {
    getUser,
    applyDamage,
    restoreUser,
    createHealthBar,
    getRestoreTimeMs,
    DEFAULT_MAX_HP
};
