import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import './BudgetModal.css';

export default function BudgetModal({ onClose }) {
  const { monthlyBudget, setBudget } = useExpenses();
  const [value, setValue] = useState(monthlyBudget > 0 ? String(monthlyBudget) : '');
  const [error, setError] = useState('');

  function handleSave() {
    const num = parseFloat(value);
    if (!value || isNaN(num) || num < 0) {
      setError('Please enter a valid non-negative number.');
      return;
    }
    setBudget(num);
    onClose();
  }

  function handleClear() {
    setBudget(0);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
        <div className="budget-modal__header">
          <h2>Monthly Budget</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {monthlyBudget > 0 && (
          <p className="budget-modal__current">
            Current budget: <strong>{formatCurrency(monthlyBudget)}</strong>
          </p>
        )}

        <div className="budget-modal__body">
          <label htmlFor="budget-input">Set your monthly budget (USD)</label>
          <div className="budget-input-wrap">
            <span className="currency-prefix">$</span>
            <input
              id="budget-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 2000"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              autoFocus
            />
          </div>
          {error && <p className="budget-error">{error}</p>}
        </div>

        <div className="budget-modal__footer">
          {monthlyBudget > 0 && (
            <button className="btn-clear-budget" onClick={handleClear}>Clear Budget</button>
          )}
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
