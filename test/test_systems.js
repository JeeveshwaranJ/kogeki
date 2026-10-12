/**
 * Self-Test Script for HP, Cooldown, and Attacks Systems
 */

const assert = require('assert');
const { getAttack, getAllAttacks } = require('../src/data/attacks');
const hpSystem = require('../src/systems/hp');
const cooldownSystem = require('../src/systems/cooldown');

console.log('🧪 Starting System Tests...\n');

// 1. Attack Database Test
console.log('--- 1. Testing Attack Database ---');
const attacks = getAllAttacks();
const requiredAttacks = ['rasengan', 'chidori', 'getsuga', 'kamehameha', 'bankai'];

for (const key of requiredAttacks) {
    const atk = getAttack(key);
    assert(atk !== null, `Attack ${key} should exist`);
    assert(typeof atk.name === 'string', `${key} should have a name`);
    assert(typeof atk.emoji === 'string', `${key} should have an emoji`);
    assert(typeof atk.minDamage === 'number', `${key} should have minDamage`);
    assert(typeof atk.maxDamage === 'number', `${key} should have maxDamage`);
    assert(atk.maxDamage >= atk.minDamage, `${key} maxDamage should be >= minDamage`);
    assert(typeof atk.cooldown === 'number', `${key} should have cooldown`);
    assert(typeof atk.gif === 'string' && atk.gif.startsWith('http'), `${key} should have a valid gif URL`);
    console.log(`  ✓ ${atk.name} (${atk.emoji}) verified: ${atk.minDamage}-${atk.maxDamage} DMG, ${atk.cooldown}s CD`);
}

// 2. Cooldown System Test
console.log('\n--- 2. Testing Cooldown System ---');
const testUser = 'user_123';
const testAttack = 'rasengan';

assert(!cooldownSystem.isOnCooldown(testUser, testAttack), 'User should not initially be on cooldown');
cooldownSystem.setCooldown(testUser, testAttack, 5);
assert(cooldownSystem.isOnCooldown(testUser, testAttack), 'User should now be on cooldown');
const rem = cooldownSystem.getRemainingSeconds(testUser, testAttack);
assert(rem > 0 && rem <= 5, `Remaining seconds should be around 5, got ${rem}`);
console.log(`  ✓ Cooldown set and verified: ${rem}s remaining`);

// 3. HP System Test
console.log('\n--- 3. Testing Persistent HP System ---');
const targetUser = 'target_999';
const initialUser = hpSystem.getUser(targetUser, 'TestDummy');
assert.strictEqual(initialUser.hp, 1000, 'Initial HP should be 1000');
console.log(`  ✓ Initial HP: ${initialUser.hp}/${initialUser.max_hp}`);

// Apply 100 damage
const damageResult = hpSystem.applyDamage(targetUser, 'TestDummy', 100, testUser);
assert.strictEqual(damageResult.previousHp, 1000, 'Previous HP should be 1000');
assert.strictEqual(damageResult.newHp, 900, 'New HP should be 900');
assert(!damageResult.isDefeated, 'Target should not be defeated');
console.log(`  ✓ Dealt 100 damage: ${damageResult.previousHp} -> ${damageResult.newHp}`);

// Health bar test
const bar = hpSystem.createHealthBar(900, 1000, 10);
assert(typeof bar === 'string' && bar.length > 0, 'Health bar should render');
console.log(`  ✓ Health bar rendered: ${bar}`);

// Apply lethal damage
const lethalResult = hpSystem.applyDamage(targetUser, 'TestDummy', 1000, testUser);
assert.strictEqual(lethalResult.newHp, 0, 'HP should clamp at 0');
assert(lethalResult.isDefeated, 'Target should be defeated');
console.log(`  ✓ Lethal damage dealt: HP is now ${lethalResult.newHp}, Defeated: ${lethalResult.isDefeated}`);

// Attempt damage on defeated user
const defeatedResult = hpSystem.applyDamage(targetUser, 'TestDummy', 50, testUser);
assert(defeatedResult.alreadyDefeated, 'Target should be flagged as alreadyDefeated');
console.log(`  ✓ Attacking defeated target correctly prevented (recovery in ${defeatedResult.remainingRevivalSeconds}s)`);

console.log('\n✅ ALL SYSTEM TESTS PASSED SUCCESSFULLY!');
