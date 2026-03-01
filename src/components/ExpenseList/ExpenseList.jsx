import React, { useMemo, useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import ExpenseItem from '../ExpenseItem/ExpenseItem';
import { getMonthYear } from '../../utils/formatters';
import './ExpenseList.css';

const MAX_VISIBLE = 5;

function groupByMonth(expenses) {
  const groups = {};
  expenses.forEach((exp) => {
    const key = getMonthYear(exp.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(exp);
  });
  return Object.entries(groups);
}

export default function ExpenseList({ onEdit }) {
  const { filteredExpenses, expenses, filterCategory, searchQuery } = useExpenses();
  const [expandedGroups, setExpandedGroups] = useState({});

  const grouped = useMemo(() => groupByMonth(filteredExpenses), [filteredExpenses]);
  const isFiltered = filterCategory !== 'all' || searchQuery.trim() !== '';

  const toggleGroup = (month) =>
    setExpandedGroups((prev) => ({ ...prev, [month]: !prev[month] }));

  if (expenses.length === 0) return null;

  if (filteredExpenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <span className="expense-list-empty__icon">🔍</span>
        <p>No expenses match your current filters.</p>
        <span className="expense-list-empty__hint">Try changing the category or search query.</span>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <div className="expense-list__header">
        <h2 className="expense-list__title">
          {isFiltered ? 'Filtered Results' : 'All Expenses'}
          <span className="expense-list__count">{filteredExpenses.length}</span>
        </h2>
      </div>

      <div className="expense-list__groups">
        {grouped.map(([month, items]) => {
          const isExpanded = !!expandedGroups[month];
          const hasMore    = items.length > MAX_VISIBLE;
          const hidden     = items.length - MAX_VISIBLE;
          const visible    = isExpanded ? items : items.slice(0, MAX_VISIBLE);

          return (
            <div key={month} className="expense-group">
              {/* Month header */}
              <div className="expense-group__label">
                <span className="expense-group__month">{month}</span>
                <div className="expense-group__right">
                  <span className="expense-group__subtotal">
                    {items.length} item{items.length !== 1 ? 's' : ''} ·{' '}
                    <span className="expense-group__amount">
                      ${items.reduce((s, e) => s + e.amount, 0)
                           .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </span>
                  {hasMore && (
                    <button
                      className="expense-group__toggle"
                      onClick={() => toggleGroup(month)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? '▲ Show less' : `▼ +${hidden} more`}
                    </button>
                  )}
                </div>
              </div>

              {/* Items — scrollable when expanded and many entries */}
              <div className={`expense-group__items${isExpanded && hasMore ? ' expense-group__items--expanded' : ''}`}>
                {visible.map((exp, idx) => (
                  <ExpenseItem
                    key={exp.id}
                    expense={exp}
                    onEdit={onEdit}
                    style={{ animationDelay: `${idx * 35}ms` }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
