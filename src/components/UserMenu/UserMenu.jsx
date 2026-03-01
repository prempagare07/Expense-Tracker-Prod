import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../AuthModal/AuthModal';
import { useExpenses } from '../../context/ExpenseContext';
import { getUserCount } from '../../utils/userStorage';
import { gravatarUrl } from '../../utils/md5';
import './UserMenu.css';

export default function UserMenu() {
  const { currentUser, isAuthenticated, signOut } = useAuth();
  const { expenses } = useExpenses();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showSignIn,   setShowSignIn]   = useState(false);
  const [photoError,   setPhotoError]   = useState(false);
  const rootRef = useRef(null);

  // Reset photo error when user changes
  useEffect(() => { setPhotoError(false); }, [currentUser?.email]);

  // Close both panels on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setShowDropdown(false);
        setShowSignIn(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const userCount = getUserCount();

  // ── GUEST ──────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="um-root um-root--guest" ref={rootRef}>
        <button
          className={`um-signin-btn ${showSignIn ? 'um-signin-btn--active' : ''}`}
          onClick={() => setShowSignIn((p) => !p)}
          title="Sign in to save your expenses"
          aria-expanded={showSignIn}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Sign In
        </button>

        {showSignIn && (
          <div className="um-signin-panel">
            <AuthModal onClose={() => setShowSignIn(false)} guestExpenseCount={expenses.length} />
          </div>
        )}
      </div>
    );
  }

  // ── SIGNED IN ──────────────────────────────────────────────────────────────
  const isGmail   = currentUser.email?.toLowerCase().endsWith('@gmail.com');
  const photoUrl  = isGmail ? gravatarUrl(currentUser.email, 80) : null;
  const showPhoto = photoUrl && !photoError;
  const initials  = currentUser.avatar || currentUser.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="um-root" ref={rootRef}>
      <button
        className="um-avatar-btn"
        onClick={() => setShowDropdown((p) => !p)}
        aria-expanded={showDropdown}
        aria-label="Account menu"
        title={currentUser.name}
      >
        <div className="um-avatar" style={showPhoto ? {} : { background: currentUser.color || '#8c1d40' }}>
          {showPhoto ? (
            <img
              src={photoUrl}
              alt={currentUser.name}
              className="um-avatar-img"
              onError={() => setPhotoError(true)}
            />
          ) : initials}
        </div>
        <svg
          className={`um-chevron ${showDropdown ? 'um-chevron--open' : ''}`}
          viewBox="0 0 24 24" width="12" height="12"
          fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {showDropdown && (
        <div className="um-dropdown">
          {/* User info */}
          <div className="um-dropdown__info">
            <div
              className="um-dropdown__avatar"
              style={showPhoto ? {} : { background: currentUser.color || '#8c1d40' }}
            >
              {showPhoto ? (
                <img
                  src={photoUrl}
                  alt={currentUser.name}
                  className="um-avatar-img"
                  onError={() => setPhotoError(true)}
                />
              ) : initials}
            </div>
            <div>
              <div className="um-dropdown__name">{currentUser.name}</div>
              <div className="um-dropdown__email">{currentUser.email}</div>
            </div>
          </div>

          <div className="um-dropdown__divider" />

          <div className="um-dropdown__stats">
            <div className="um-stat">
              <span className="um-stat__label">Your expenses</span>
              <span className="um-stat__val">{expenses.length}</span>
            </div>
            <div className="um-stat">
              <span className="um-stat__label">Registered users</span>
              <span className="um-stat__val">{userCount} / 200</span>
            </div>
          </div>

          <div className="um-dropdown__divider" />

          <button
            className="um-dropdown__signout"
            onClick={() => { signOut(); setShowDropdown(false); }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
