import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { CATEGORIES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './ExpenseItem.css';

export default function ExpenseItem({ expense, onEdit }) {
  const { deleteExpense } = useExpenses();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const category = CATEGORIES.find((c) => c.value === expense.category) || {
    icon: '📦',
    label: 'Other',
    color: '#888',
  };

  function handleDeleteConfirm() {
    setDeleting(true);
    // Small delay for animation
    setTimeout(() => deleteExpense(expense.id), 250);
  }

  return (
    <div className={`expense-item ${deleting ? 'expense-item--deleting' : ''}`}>
      {/* Category icon badge */}
      <div
        className="ei-icon"
        style={{
          background: `${category.color}22`,
          border: `1.5px solid ${category.color}55`,
          color: category.color,
        }}
      >
        {category.icon}
      </div>

      {/* Main info */}
      <div className="ei-info">
        <div className="ei-title-row">
          <span className="ei-title" title={expense.title}>{expense.title}</span>
          <span
            className="ei-category-pill"
            style={{
              background: `${category.color}20`,
              color: category.color,
              border: `1px solid ${category.color}40`,
            }}
          >
            {category.label}
          </span>
        </div>
        <div className="ei-meta">
          <span className="ei-date">📅 {formatDate(expense.date)}</span>
          {expense.description && (
            <span className="ei-desc" title={expense.description}>
              {expense.description.length > 50
                ? expense.description.slice(0, 50) + '…'
                : expense.description}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="ei-amount">{formatCurrency(expense.amount)}</div>

      {/* Actions */}
      {!confirmDelete ? (
        <div className="ei-actions">
          <button
            className="ei-btn ei-btn--edit"
            onClick={() => onEdit(expense)}
            title="Edit expense"
            aria-label="Edit expense"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="ei-btn ei-btn--delete"
            onClick={() => setConfirmDelete(true)}
            title="Delete expense"
            aria-label="Delete expense"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="ei-confirm-delete">
          <span className="ei-confirm-msg">Delete?</span>
          <button className="ei-btn ei-btn--confirm-yes" onClick={handleDeleteConfirm}>
            Yes
          </button>
          <button className="ei-btn ei-btn--confirm-no" onClick={() => setConfirmDelete(false)}>
            No
          </button>
        </div>
      )}
    </div>
  );
}
