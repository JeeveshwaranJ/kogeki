/**
 * Per-User, Per-Attack Cooldown System
 * Tracks attack cooldowns in-memory with automatic cleanup
 */

class CooldownSystem {
    constructor() {
        // Map key format: `${userId}:${attackKey}` => expirationTimestamp (ms)
        this.cooldowns = new Map();

        // Periodically prune expired entries every 5 minutes to avoid memory leaks
        setInterval(() => this.pruneExpired(), 5 * 60 * 1000).unref();
    }

    /**
     * Generate standard key
     */
    _getKey(userId, attackKey) {
        return `${userId}:${attackKey.toLowerCase()}`;
    }

    /**
     * Check if a specific attack is currently on cooldown for a user
     * @param {string} userId 
     * @param {string} attackKey 
     * @returns {boolean}
     */
    isOnCooldown(userId, attackKey) {
        const key = this._getKey(userId, attackKey);
        const expiresAt = this.cooldowns.get(key);

        if (!expiresAt) return false;

        if (Date.now() >= expiresAt) {
            this.cooldowns.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Get remaining cooldown time in seconds (rounded up)
     * @param {string} userId 
     * @param {string} attackKey 
     * @returns {number} Remaining seconds, or 0 if not on cooldown
     */
    getRemainingSeconds(userId, attackKey) {
        const key = this._getKey(userId, attackKey);
        const expiresAt = this.cooldowns.get(key);

        if (!expiresAt) return 0;

        const remainingMs = expiresAt - Date.now();
        if (remainingMs <= 0) {
            this.cooldowns.delete(key);
            return 0;
        }

        return Math.ceil(remainingMs / 1000);
    }

    /**
     * Set a cooldown for a user's attack
     * @param {string} userId 
     * @param {string} attackKey 
     * @param {number} cooldownSeconds 
     */
    setCooldown(userId, attackKey, cooldownSeconds) {
        if (!cooldownSeconds || cooldownSeconds <= 0) return;

        const key = this._getKey(userId, attackKey);
        const expiresAt = Date.now() + (cooldownSeconds * 1000);
        this.cooldowns.set(key, expiresAt);
    }

    /**
     * Clear all cooldowns for a user (useful for admin/resets)
     * @param {string} userId 
     */
    clearUserCooldowns(userId) {
        for (const [key] of this.cooldowns.entries()) {
            if (key.startsWith(`${userId}:`)) {
                this.cooldowns.delete(key);
            }
        }
    }

    /**
     * Prune expired cooldown records from memory
     */
    pruneExpired() {
        const now = Date.now();
        for (const [key, expiresAt] of this.cooldowns.entries()) {
            if (now >= expiresAt) {
                this.cooldowns.delete(key);
            }
        }
    }
}

// Export singleton instance
module.exports = new CooldownSystem();
