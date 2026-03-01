import React, { useMemo } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import './Dashboard.css';

function StatCard({ icon, label, value, subValue, accent, highlight }) {
  return (
    <div className={`stat-card ${highlight ? 'stat-card--highlight' : ''}`} style={{ '--accent': accent }}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
        {subValue && <span className="stat-card__sub">{subValue}</span>}
      </div>
    </div>
  );
}

function CategoryBar({ category, amount, total }) {
  const cat = CATEGORIES.find((c) => c.value === category);
  const pct = total > 0 ? (amount / total) * 100 : 0;

  return (
    <div className="cat-bar">
      <div className="cat-bar__meta">
        <span className="cat-bar__icon">{cat?.icon || '📦'}</span>
        <span className="cat-bar__label">{cat?.label || category}</span>
        <span className="cat-bar__amount">{formatCurrency(amount)}</span>
        <span className="cat-bar__pct">{pct.toFixed(1)}%</span>
      </div>
      <div className="cat-bar__track">
        <div
          className="cat-bar__fill"
          style={{ width: `${pct}%`, background: cat?.color || '#888' }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { expenses, totalExpenses, currentMonthTotal, categoryTotals, monthlyBudget, budgetUsedPercent } = useExpenses();

  const topCategories = useMemo(() => {
    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [categoryTotals]);

  const highestExpense = useMemo(() => {
    if (!expenses.length) return null;
    return expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0]);
  }, [expenses]);

  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  if (expenses.length === 0) {
    return (
      <div className="dashboard-empty">
        <div className="dashboard-empty__graphic">💸</div>
        <h3>No expenses yet</h3>
        <p>Add your first expense to see your spending overview here.</p>
      </div>
    );
  }

  return (
    <section className="dashboard">
      {/* ── Summary Cards ── */}
      <div className="stat-cards">
        <StatCard
          icon="💰"
          label="Total Spent"
          value={formatCurrency(totalExpenses)}
          subValue={`${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`}
          accent="#ffc627"
          highlight
        />
        <StatCard
          icon="📅"
          label="This Month"
          value={formatCurrency(currentMonthTotal)}
          subValue={
            monthlyBudget > 0
              ? `${budgetUsedPercent.toFixed(0)}% of ${formatCurrency(monthlyBudget)} budget`
              : 'No budget set'
          }
          accent={budgetUsedPercent >= 90 ? '#ff5e5e' : budgetUsedPercent >= 70 ? '#f5a623' : '#4ecdc4'}
        />
        <StatCard
          icon="📊"
          label="Avg. per Expense"
          value={formatCurrency(avgExpense)}
          subValue="across all time"
          accent="#96ceb4"
        />
        {highestExpense && (
          <StatCard
            icon="⬆️"
            label="Highest Expense"
            value={formatCurrency(highestExpense.amount)}
            subValue={highestExpense.title}
            accent="#dda0dd"
          />
        )}
      </div>

    </section>
  );
}
