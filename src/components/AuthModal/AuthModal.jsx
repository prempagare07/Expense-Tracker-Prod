/**
 * AuthModal — multi-step sign-in / registration panel (no backdrop overlay).
 *
 * Flow:
 *   Step 'email'    → user types their email, app looks up whether account exists
 *   Step 'password' → returning user: show stored name/avatar, ask for password
 *   Step 'register' → new user: collect name, password, confirm, avatar colour
 *   Step 'success'  → auto-closes after 1.6 s
 */
import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loadUserData, emailToUserId } from '../../utils/userStorage';
import { md5 } from '../../utils/md5';
import './AuthModal.css';

const AVATAR_COLORS = [
  '#8C1D40', '#FFC627', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#DDA0DD', '#F0A500', '#FF6B6B',
];

function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

function hashPassword(password, email) {
  // Salted with email so the same password produces different hashes per account
  return md5(password + ':asu:' + email.toLowerCase().trim());
}

// ── Small components ───────────────────────────────────────────────────────────
function PasswordInput({ id, label, value, onChange, autoFocus, placeholder = '••••••••' }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-pw-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          autoComplete="current-password"
          maxLength={128}
        />
        <button
          type="button"
          className="auth-pw-toggle"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AuthModal({ onClose, guestExpenseCount = 0 }) {
  const { signIn } = useAuth();

  const [step,    setStep]    = useState('email');  // 'email'|'password'|'register'|'success'
  const [email,   setEmail]   = useState('');
  const [name,    setName]    = useState('');
  const [pw,      setPw]      = useState('');
  const [pwConf,  setPwConf]  = useState('');
  const [color,   setColor]   = useState(AVATAR_COLORS[0]);
  const [errors,  setErrors]  = useState({});
  const [authErr, setAuthErr] = useState('');
  const [stored,  setStored]  = useState(null);   // profile of returning user

  const emailRef = useRef(null);

  // ── Step 1: email lookup ─────────────────────────────────────────────────────
  function handleEmailSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrors({ email: 'Enter a valid email address.' });
      return;
    }
    const id   = emailToUserId(trimmed);
    const data = loadUserData(id);
    if (data?.profile) {
      setStored(data.profile);
      setStep('password');
    } else {
      setStep('register');
    }
    setErrors({});
    setPw(''); setPwConf('');
  }

  // ── Step 2a: returning user password check ───────────────────────────────────
  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault();
    if (!pw) { setErrors({ pw: 'Please enter your password.' }); return; }
    setErrors({});

    const hash   = hashPassword(pw, email.trim());
    const result = signIn({ ...stored, email: email.trim().toLowerCase() }, hash);
    if (!result.success) { setAuthErr(result.error); return; }
    setAuthErr('');
    setStep('success');
    setTimeout(onClose, 1600);
  }, [pw, email, stored, signIn, onClose]);

  // ── Step 2b: new user registration ──────────────────────────────────────────
  const handleRegisterSubmit = useCallback((e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim())           errs.name   = 'Full name is required.';
    if (!pw)                    errs.pw     = 'Password is required.';
    else if (pw.length < 6)     errs.pw     = 'Minimum 6 characters.';
    if (pw !== pwConf)          errs.pwConf = 'Passwords do not match.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const profile = {
      name:   name.trim(),
      email:  email.trim().toLowerCase(),
      color,
      avatar: getInitials(name),
    };
    const hash   = hashPassword(pw, profile.email);
    const result = signIn(profile, hash);
    if (!result.success) { setAuthErr(result.error); return; }
    setStep('success');
    setTimeout(onClose, 1600);
  }, [name, pw, pwConf, color, email, signIn, onClose]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="auth-panel-card" role="dialog" aria-modal="true" aria-label="Sign in">
      <button className="auth-modal__close" onClick={onClose} aria-label="Close">✕</button>

      {/* ══ STEP: email ══════════════════════════════════════════════════════════ */}
      {step === 'email' && (
        <>
          <div className="auth-modal__logo"><div className="asu-badge">ASU</div></div>
          <h2 className="auth-modal__title">Sign In</h2>
          {guestExpenseCount > 0 && (
            <p className="auth-modal__sub">
              <span className="auth-modal__guest-hint">
                You have <strong>{guestExpenseCount}</strong> unsaved expense{guestExpenseCount !== 1 ? 's' : ''} — they'll be imported on sign-in.
              </span>
            </p>
          )}
          <form className="auth-form" onSubmit={handleEmailSubmit} noValidate>
            <div className={`auth-field ${errors.email ? 'auth-field--err' : ''}`}>
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email" ref={emailRef}
                type="email" placeholder="you@asu.edu"
                value={email} maxLength={120} autoFocus
                onChange={e => { setEmail(e.target.value); setErrors({}); }}
              />
              {errors.email && <span className="auth-err">{errors.email}</span>}
            </div>
            <button type="submit" className="auth-form__submit">Continue →</button>
            <p className="auth-modal__notice">🔒 All data stays in your browser — no server, no tracking.</p>
          </form>
        </>
      )}

      {/* ══ STEP: password (returning user) ══════════════════════════════════════ */}
      {step === 'password' && stored && (
        <>
          <button className="auth-modal__back" type="button"
            onClick={() => { setStep('email'); setAuthErr(''); setErrors({}); setPw(''); }}>
            ← Back
          </button>

          {/* Returning user profile preview */}
          <div className="auth-returning">
            <div className="auth-returning__avatar" style={{ background: stored.color || '#8c1d40' }}>
              {stored.avatar || stored.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="auth-returning__name">{stored.name}</div>
              <div className="auth-returning__email">{email.trim().toLowerCase()}</div>
            </div>
          </div>

          <form className="auth-form" onSubmit={handlePasswordSubmit} noValidate>
            <div className={errors.pw ? 'auth-field--err' : ''}>
              <PasswordInput
                id="auth-pw-return"
                label="Password"
                value={pw}
                onChange={e => { setPw(e.target.value); setErrors({}); setAuthErr(''); }}
                autoFocus
              />
              {errors.pw && <span className="auth-err">{errors.pw}</span>}
            </div>

            {authErr && (
              <div className="auth-err-banner">
                <span>⚠️</span> {authErr}
              </div>
            )}

            <button type="submit" className="auth-form__submit">🔓 Sign In</button>
          </form>
        </>
      )}

      {/* ══ STEP: register (new user) ═════════════════════════════════════════════ */}
      {step === 'register' && (
        <>
          <button className="auth-modal__back" type="button"
            onClick={() => { setStep('email'); setErrors({}); setPw(''); setPwConf(''); }}>
            ← Back
          </button>
          <h2 className="auth-modal__title">Create Account</h2>
          <p className="auth-modal__sub" style={{ marginBottom: '1rem' }}>
            No account found for <strong style={{ color: '#ffc627' }}>{email.trim().toLowerCase()}</strong>
          </p>

          <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
            {/* Full name */}
            <div className={`auth-field ${errors.name ? 'auth-field--err' : ''}`}>
              <label htmlFor="auth-name">Full name</label>
              <input id="auth-name" type="text" placeholder="Prem Pagare"
                value={name} autoFocus maxLength={60}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              />
              {errors.name && <span className="auth-err">{errors.name}</span>}
            </div>

            {/* Password */}
            <div className={errors.pw ? 'auth-field--err' : ''}>
              <PasswordInput
                id="auth-pw-new" label="Password (min 6 chars)"
                value={pw} placeholder="Create a password"
                onChange={e => { setPw(e.target.value); setErrors(p => ({ ...p, pw: '' })); }}
              />
              {errors.pw && <span className="auth-err">{errors.pw}</span>}
            </div>

            {/* Confirm password */}
            <div className={errors.pwConf ? 'auth-field--err' : ''}>
              <PasswordInput
                id="auth-pw-conf" label="Confirm password"
                value={pwConf} placeholder="Repeat password"
                onChange={e => { setPwConf(e.target.value); setErrors(p => ({ ...p, pwConf: '' })); }}
              />
              {errors.pwConf && <span className="auth-err">{errors.pwConf}</span>}
            </div>

            {/* Avatar colour */}
            <div className="auth-field">
              <label>Avatar colour</label>
              <div className="color-picker">
                {AVATAR_COLORS.map(c => (
                  <button key={c} type="button"
                    className={`color-swatch ${color === c ? 'color-swatch--active' : ''}`}
                    style={{ background: c }} onClick={() => setColor(c)} aria-label={`Colour ${c}`} />
                ))}
                {name && (
                  <div className="avatar-preview" style={{ background: color }}>{getInitials(name)}</div>
                )}
              </div>
            </div>

            {authErr && <div className="auth-err-banner"><span>⚠️</span> {authErr}</div>}

            <button type="submit" className="auth-form__submit">✅ Create Account</button>
            <p className="auth-modal__notice">🔒 All data stays in your browser — no server, no tracking.</p>
          </form>
        </>
      )}

      {/* ══ STEP: success ════════════════════════════════════════════════════════ */}
      {step === 'success' && (
        <div className="auth-success">
          <div className="auth-success__icon">🎉</div>
          <h2>Welcome{stored ? ' back' : ''}, {(name || stored?.name || '').split(' ')[0]}!</h2>
          <p>You're signed in. Your expenses are saved.</p>
        </div>
      )}
    </div>
  );
}
