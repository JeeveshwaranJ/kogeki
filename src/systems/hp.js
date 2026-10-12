/**
 * Persistent HP (Health Points) System
 * Uses built-in node:sqlite (Node 22+) with automatic fallback to JSON storage
 * Requires ZERO native compilation (no node-gyp, no Python required)
 */

const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const DEFAULT_MAX_HP = 1000;

function getRestoreTimeMs() {
    const seconds = parseInt(process.env.HP_RESTORE_TIME_SECONDS, 10);
    return (isNaN(seconds) || seconds <= 0 ? 60 : seconds) * 1000;
}

// Database storage abstraction
let dbBackend = null;

try {
    // 1. Try Node.js built-in SQLite (Node 22.5+, Node 24)
    const { DatabaseSync } = require('node:sqlite');
    const dbPath = path.join(dbDir, 'database.sqlite');
    const db = new DatabaseSync(dbPath);

    db.exec(`
        PRAGMA journal_mode = WAL;
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

    dbBackend = {
        type: 'sqlite',
        getUser: (id) => stmtGetUser.get(id),
        insertUser: (id, name, hp, maxHp) => stmtInsertUser.run(id, name, hp, maxHp),
        updateHP: (hp, name, defeatedAt, lastAttackedAt, id) => stmtUpdateHP.run(hp, name, defeatedAt, lastAttackedAt, id),
        incrementWins: (id) => stmtIncrementWins.run(id),
        incrementLosses: (id) => stmtIncrementLosses.run(id),
        restoreHP: (id) => stmtRestoreHP.run(id)
    };
} catch {
    // 2. Pure JS File-based Fallback (for older Node versions without node:sqlite)
    const jsonPath = path.join(dbDir, 'users.json');
    let cache = {};

    if (fs.existsSync(jsonPath)) {
        try {
            cache = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        } catch {
            cache = {};
        }
    }

    const save = () => {
        try {
            fs.writeFileSync(jsonPath, JSON.stringify(cache, null, 2), 'utf8');
        } catch (e) {
            console.error('Failed to save users.json:', e);
        }
    };

    dbBackend = {
        type: 'json',
        getUser: (id) => cache[id] ? { ...cache[id] } : null,
        insertUser: (id, name, hp, maxHp) => {
            cache[id] = {
                user_id: id,
                username: name,
                hp,
                max_hp: maxHp,
                defeated_at: null,
                last_attacked_at: null,
                battles_won: 0,
                battles_lost: 0
            };
            save();
        },
        updateHP: (hp, name, defeatedAt, lastAttackedAt, id) => {
            if (cache[id]) {
                cache[id].hp = hp;
                cache[id].username = name;
                cache[id].defeated_at = defeatedAt;
                cache[id].last_attacked_at = lastAttackedAt;
                save();
            }
        },
        incrementWins: (id) => {
            if (cache[id]) {
                cache[id].battles_won = (cache[id].battles_won || 0) + 1;
                save();
            }
        },
        incrementLosses: (id) => {
            if (cache[id]) {
                cache[id].battles_lost = (cache[id].battles_lost || 0) + 1;
                save();
            }
        },
        restoreHP: (id) => {
            if (cache[id]) {
                cache[id].hp = cache[id].max_hp || DEFAULT_MAX_HP;
                cache[id].defeated_at = null;
                save();
            }
        }
    };
}

/**
 * Get or initialize a user profile from database
 * @param {string} userId
 * @param {string} username
 * @returns {object}
 */
function getUser(userId, username = 'Unknown') {
    let user = dbBackend.getUser(userId);

    if (!user) {
        dbBackend.insertUser(userId, username, DEFAULT_MAX_HP, DEFAULT_MAX_HP);
        user = dbBackend.getUser(userId);
    }

    // Auto-revive check
    if (user.hp <= 0 && user.defeated_at) {
        const elapsed = Date.now() - user.defeated_at;
        const restoreDuration = getRestoreTimeMs();

        if (elapsed >= restoreDuration) {
            dbBackend.restoreHP(userId);
            user = dbBackend.getUser(userId);
        }
    }

    return user;
}

/**
 * Apply damage to a user
 * @param {string} targetId 
 * @param {string} targetUsername 
 * @param {number} damage 
 * @param {string} attackerId 
 * @returns {object}
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
            dbBackend.restoreHP(targetId);
            user.hp = user.max_hp;
            user.defeated_at = null;
        }
    }

    const previousHp = user.hp;
    const newHp = Math.max(0, previousHp - damage);
    const now = Date.now();
    const isDefeated = newHp === 0;
    const defeatedAt = isDefeated ? now : null;

    dbBackend.updateHP(newHp, targetUsername, defeatedAt, now, targetId);

    if (isDefeated) {
        dbBackend.incrementLosses(targetId);
        if (attackerId) {
            dbBackend.incrementWins(attackerId);
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
 * Restore user's HP to maximum
 * @param {string} userId 
 */
function restoreUser(userId) {
    dbBackend.restoreHP(userId);
    return dbBackend.getUser(userId);
}

/**
 * Generate a visual ASCII/Unicode Health Bar
 * @param {number} current 
 * @param {number} max 
 * @param {number} size 
 * @returns {string}
 */
function createHealthBar(current, max, size = 10) {
    const percentage = Math.max(0, Math.min(1, current / max));
    const filledBlocks = Math.round(percentage * size);
    const emptyBlocks = size - filledBlocks;

    let fillChar = '🟩';
    if (percentage <= 0.25) {
        fillChar = '🟥';
    } else if (percentage <= 0.50) {
        fillChar = '🟨';
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
