import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { CATEGORIES, SORT_OPTIONS } from '../../utils/constants';
import './FilterBar.css';

export default function FilterBar() {
  const {
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSort,
    expenses,
    categoryTotals,
  } = useExpenses();

  const categoriesWithData = CATEGORIES.filter(
    (c) => categoryTotals[c.value] > 0
  );

  return (
    <div className="filter-bar">
      {/* ── Search ── */}
      <div className="filter-search">
        <svg
          className="filter-search__icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Search expenses…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="filter-search__input"
          aria-label="Search expenses"
        />
        {searchQuery && (
          <button
            className="filter-search__clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Category Pills ── */}
      <div className="filter-categories" role="group" aria-label="Filter by category">
        <button
          className={`filter-pill ${filterCategory === 'all' ? 'filter-pill--active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          🗂️ All
          <span className="filter-pill__count">{expenses.length}</span>
        </button>

        {categoriesWithData.map((cat) => {
          const count = expenses.filter((e) => e.category === cat.value).length;
          return (
            <button
              key={cat.value}
              className={`filter-pill ${filterCategory === cat.value ? 'filter-pill--active' : ''}`}
              onClick={() => setFilterCategory(cat.value)}
              style={
                filterCategory === cat.value
                  ? {
                      '--pill-color': cat.color,
                      background: `${cat.color}25`,
                      borderColor: `${cat.color}55`,
                      color: cat.color,
                    }
                  : { '--pill-color': cat.color }
              }
            >
              {cat.icon} {cat.label}
              <span className="filter-pill__count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Sort ── */}
      <div className="filter-sort">
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="filter-sort__icon"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
        <select
          value={sortBy}
          onChange={(e) => setSort(e.target.value)}
          className="filter-sort__select"
          aria-label="Sort expenses"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
