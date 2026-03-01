import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import BudgetModal from '../BudgetModal/BudgetModal';
import UserMenu from '../UserMenu/UserMenu';
import './Header.css';

export default function Header({ onAddExpense }) {
  const { totalExpenses, currentMonthTotal, monthlyBudget, budgetUsedPercent } = useExpenses();
  const { currentUser, isAuthenticated } = useAuth();
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const budgetStatus =
    budgetUsedPercent >= 90 ? 'critical' :
    budgetUsedPercent >= 70 ? 'warning'  : 'healthy';

  const brandTitle = isAuthenticated
    ? `${currentUser.name.split(' ')[0]}'s Expense Tracker`
    : 'Expense Tracker';

  return (
    // Sticky wrapper keeps both the header bar and budget progress line pinned
    <div className="header-sticky">
      <header className="app-header">
        {/* ── Logo + Branding ── */}
        <div className="header-brand">
          <div className="asu-logo-block">
            <span className="asu-logo-text">A</span>
            <span className="asu-logo-text">S</span>
            <span className="asu-logo-text">U</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">{brandTitle}</span>
            <span className="brand-subtitle">Arizona State University · Sun Devils Finance</span>
          </div>
        </div>

        {/* ── Quick Stats ── */}
        <div className="header-stats">
          <div className="stat-chip">
            <span className="stat-chip-label">Total</span>
            <span className="stat-chip-value">{formatCurrency(totalExpenses)}</span>
          </div>
          <div className={`stat-chip stat-chip--month ${budgetStatus !== 'healthy' ? 'stat-chip--' + budgetStatus : ''}`}>
            <span className="stat-chip-label">This Month</span>
            <span className="stat-chip-value">{formatCurrency(currentMonthTotal)}</span>
          </div>
          {monthlyBudget > 0 && (
            <div className={`stat-chip stat-chip--budget stat-chip--${budgetStatus}`}>
              <span className="stat-chip-label">Budget</span>
              <span className="stat-chip-value">{budgetUsedPercent.toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="header-actions">
          <button
            className="btn-budget"
            onClick={() => setShowBudgetModal(true)}
            title="Set monthly budget"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Budget
          </button>
          <button className="btn-add-expense" onClick={onAddExpense}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Expense
          </button>
          <UserMenu />
        </div>
      </header>

      {/* Budget progress bar — sticks directly below the header */}
      {monthlyBudget > 0 && (
        <div className="budget-progress-bar-wrap">
          <div
            className={`budget-progress-bar budget-progress-bar--${budgetStatus}`}
            style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
          />
        </div>
      )}

      {showBudgetModal && <BudgetModal onClose={() => setShowBudgetModal(false)} />}
    </div>
  );
}
