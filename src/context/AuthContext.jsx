/**
 * AuthContext — manages the signed-in user across the app.
 *
 * Responsibilities
 *  • Restore session from localStorage on mount (so refresh keeps you logged in)
 *  • Provide signIn(profile) / signOut()
 *  • Expose pendingGuestExpenses so ExpenseContext can offer an import dialog
 *    when a guest signs in after already adding expenses
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  emailToUserId,
  loadUserData,
  saveUserData,
  getSessionUserId,
  setSessionUserId,
  clearSession,
  getUserCount,
} from '../utils/userStorage';

// ─── Context shape ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);   // null = guest
  const [authReady, setAuthReady]     = useState(false);  // true once session restored

  // Ref so ExpenseContext can read guest expenses at sign-in time
  // ExpenseContext will call registerGuestExpenseGetter(getter)
  const guestExpensesGetterRef = useRef(null);

  // ── Restore session from localStorage ────────────────────────────────────────
  useEffect(() => {
    const savedId = getSessionUserId();
    if (savedId) {
      const stored = loadUserData(savedId);
      if (stored?.profile) {
        setCurrentUser({ id: savedId, ...stored.profile });
      } else {
        clearSession(); // stale session
      }
    }
    setAuthReady(true);
  }, []);

  // ── registerGuestExpenseGetter ────────────────────────────────────────────────
  // ExpenseContext registers a getter so AuthContext can read guest expenses
  const registerGuestExpenseGetter = useCallback((getter) => {
    guestExpensesGetterRef.current = getter;
  }, []);

  // ── signIn ────────────────────────────────────────────────────────────────────
  /**
   * @param {object} profile       { name, email, color, avatar }
   * @param {string} passwordHash  md5(password + ':asu:' + email)
   * @returns {{ success, error?, imported?, count? }}
   */
  const signIn = useCallback((profile, passwordHash) => {
    const id      = emailToUserId(profile.email);
    const stored  = loadUserData(id);

    // Returning user — verify password before doing anything else
    if (stored?.profile) {
      if (stored.profile.passwordHash !== passwordHash) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
    }

    // Collect any in-memory guest expenses BEFORE we switch user
    const guestExpenses = guestExpensesGetterRef.current?.() ?? [];

    // Build the user's expense list
    let expenses = stored?.expenses ?? [];
    let imported = false;

    if (guestExpenses.length > 0) {
      const existingIds = new Set(expenses.map((e) => e.id));
      const fresh = guestExpenses.filter((e) => !existingIds.has(e.id));
      expenses = [...fresh, ...expenses];
      imported = fresh.length > 0;
    }

    const budget = stored?.budget ?? 0;

    // Persist (store/update profile with passwordHash so it survives refresh)
    saveUserData(id, { profile: { ...profile, passwordHash }, expenses, budget });
    setSessionUserId(id);
    setCurrentUser({ id, ...profile });

    return { success: true, imported, count: guestExpenses.length };
  }, []);

  // ── signOut ───────────────────────────────────────────────────────────────────
  const signOut = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  // ── Save helper (used by ExpenseContext to persist user data) ─────────────────
  const persistUserData = useCallback(({ expenses, budget }) => {
    if (!currentUser) return;
    const { id, ...profile } = currentUser;
    saveUserData(id, { profile, expenses, budget });
  }, [currentUser]);

  const value = {
    currentUser,          // null | { id, name, email, color, avatar }
    authReady,            // wait for this before rendering expense data
    isAuthenticated: Boolean(currentUser),
    signIn,
    signOut,
    persistUserData,
    registerGuestExpenseGetter,
    userCount: getUserCount(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
