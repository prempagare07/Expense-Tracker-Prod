/**
 * Multi-user localStorage engine — FIFO eviction at 200 users
 * Author: Prem Pagare | Arizona State University
 *
 * Storage layout:
 *   asu_et_registry          →  string[]  ordered user-id list (oldest → newest)
 *   asu_et_u_<id>            →  { profile, expenses, budget }
 *   asu_et_session           →  string    current user-id (survives refresh)
 */

const MAX_USERS     = 200;
const REGISTRY_KEY  = 'asu_et_registry';
const SESSION_KEY   = 'asu_et_session';
const userKey = (id) => `asu_et_u_${id}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parse(raw, fallback) {
  try { return JSON.parse(raw) ?? fallback; } catch { return fallback; }
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export function getRegistry() {
  return parse(localStorage.getItem(REGISTRY_KEY), []);
}

function saveRegistry(reg) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
}

/** Returns total number of registered users. */
export function getUserCount() {
  return getRegistry().length;
}

// ─── User Data ────────────────────────────────────────────────────────────────

export function loadUserData(userId) {
  return parse(localStorage.getItem(userKey(userId)), null);
}

export function saveUserData(userId, { profile, expenses, budget }) {
  const registry = getRegistry();

  if (!registry.includes(userId)) {
    // Brand-new user — enforce 200-user cap (FIFO eviction)
    if (registry.length >= MAX_USERS) {
      const evictId = registry.shift();            // remove the oldest user
      localStorage.removeItem(userKey(evictId));   // delete their data
      console.info(`[UserStorage] Evicted oldest user "${evictId}" (cap=${MAX_USERS})`);
    }
    registry.push(userId);  // append newest user
    saveRegistry(registry);
  }

  localStorage.setItem(
    userKey(userId),
    JSON.stringify({ profile, expenses, budget, updatedAt: new Date().toISOString() })
  );
}

export function deleteUserData(userId) {
  const registry = getRegistry().filter((id) => id !== userId);
  saveRegistry(registry);
  localStorage.removeItem(userKey(userId));
}

// ─── Session (current logged-in user) ─────────────────────────────────────────

export function getSessionUserId() {
  return localStorage.getItem(SESSION_KEY) || null;
}

export function setSessionUserId(userId) {
  localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── ID generation (deterministic from e-mail, so same e-mail = same account) ─

export function emailToUserId(email) {
  // Produce a safe, stable key from any e-mail address
  return 'u_' + email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
}
