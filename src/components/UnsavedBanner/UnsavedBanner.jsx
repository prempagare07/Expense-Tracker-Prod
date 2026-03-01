/**
 * UnsavedBanner
 *
 * Shown at the bottom of the screen when:
 *   • The user is NOT signed in
 *   • AND they have at least one expense in memory
 *
 * Also attaches a `beforeunload` listener so the browser shows its
 * native "Leave site?" dialog if the user tries to close/refresh the tab.
 *
 * Tapping "Sign In to Save" opens the AuthModal so the user can sign in
 * without losing their in-memory data.
 */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import AuthModal from '../AuthModal/AuthModal';
import './UnsavedBanner.css';

export default function UnsavedBanner() {
  const { isAuthenticated } = useAuth();
  const { expenses } = useExpenses();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const shouldWarn = !isAuthenticated && expenses.length > 0;

  // ── beforeunload — browser-native "Leave site?" dialog ───────────────────────
  useEffect(() => {
    if (!shouldWarn) return;

    function handleBeforeUnload(e) {
      e.preventDefault();
      // Modern browsers show a generic message; returning a string is legacy
      e.returnValue = 'You have unsaved expenses. Sign in before leaving so your data is not lost.';
      return e.returnValue;
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldWarn]);

  // Hide banner once user signs in or dismisses
  if (!shouldWarn || dismissed) return null;

  return (
    <>
      <div className="unsaved-banner" role="alert">
        <span className="unsaved-banner__icon">⚠️</span>
        <span className="unsaved-banner__msg">
          You have{' '}
          <strong>
            {expenses.length} unsaved expense{expenses.length !== 1 ? 's' : ''}
          </strong>{' '}
          — they will vanish if you refresh or close this tab.
        </span>
        <button
          className="unsaved-banner__cta"
          onClick={() => setShowModal(true)}
        >
          Sign In to Save
        </button>
        <button
          className="unsaved-banner__dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss warning"
          title="Dismiss (data will still be lost on refresh)"
        >
          ✕
        </button>
      </div>

      {showModal && (
        <AuthModal
          onClose={() => setShowModal(false)}
          guestExpenseCount={expenses.length}
        />
      )}
    </>
  );
}
