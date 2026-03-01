import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useExpenses } from '../../context/ExpenseContext';
import { CATEGORIES } from '../../utils/constants';
import { validateExpense } from '../../utils/validation';
import { getTodayString } from '../../utils/formatters';
import './ExpenseForm.css';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  amount: '',
  date: getTodayString(),
};

export default function ExpenseForm({ expenseToEdit, onClose }) {
  const { addExpense, updateExpense } = useExpenses();
  const isEditing = Boolean(expenseToEdit);

  const [formData, setFormData] = useState(
    isEditing
      ? { ...expenseToEdit, amount: String(expenseToEdit.amount) }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    // Live-validate touched fields
    const liveErrors = validateExpense({ ...formData, [name]: value });
    setErrors(liveErrors.errors);
  }, [formData]);

  const handleBlur = useCallback((e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(EMPTY_FORM).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const { isValid, errors: validationErrors } = validateExpense(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    const expense = {
      ...(isEditing ? { id: expenseToEdit.id, createdAt: expenseToEdit.createdAt } : { id: uuidv4(), createdAt: new Date().toISOString() }),
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      updatedAt: new Date().toISOString(),
    };

    if (isEditing) {
      updateExpense(expense);
    } else {
      addExpense(expense);
    }

    onClose();
  };

  const selectedCategory = CATEGORIES.find((c) => c.value === formData.category);

  return (
    <div
      className="expense-form-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Edit Expense' : 'Add Expense'}
    >
    <div className="expense-form-card" onClick={(e) => e.stopPropagation()}>
      <div className="expense-form-inner">

        {/* ── Header ── */}
        <div className="ef-header">
          <div className="ef-header__title-block">
            <span className="ef-header__emoji">{isEditing ? '✏️' : '➕'}</span>
            <h2 className="ef-header__title">{isEditing ? 'Edit Expense' : 'New Expense'}</h2>
          </div>
          <button className="ef-close" onClick={onClose} aria-label="Close form">✕</button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate className="ef-form">

          {/* Title */}
          <div className={`ef-field ${touched.title && errors.title ? 'ef-field--error' : touched.title && !errors.title ? 'ef-field--valid' : ''}`}>
            <label className="ef-label" htmlFor="ef-title">
              Title <span className="required-star">*</span>
            </label>
            <div className="ef-input-wrap">
              <input
                id="ef-title"
                name="title"
                type="text"
                placeholder="e.g. Grocery run at Fry's"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={80}
                autoFocus
                className="ef-input"
                aria-describedby={errors.title ? 'ef-title-err' : undefined}
              />
              <span className="ef-char-count">{formData.title.length}/80</span>
            </div>
            {touched.title && errors.title && (
              <p className="ef-error-msg" id="ef-title-err" role="alert">{errors.title}</p>
            )}
          </div>

          {/* Amount & Date Row */}
          <div className="ef-row">
            {/* Amount */}
            <div className={`ef-field ef-field--half ${touched.amount && errors.amount ? 'ef-field--error' : touched.amount && !errors.amount ? 'ef-field--valid' : ''}`}>
              <label className="ef-label" htmlFor="ef-amount">
                Amount (USD) <span className="required-star">*</span>
              </label>
              <div className="ef-input-wrap ef-input-wrap--prefix">
                <span className="ef-prefix">$</span>
                <input
                  id="ef-amount"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="ef-input ef-input--prefixed"
                  aria-describedby={errors.amount ? 'ef-amount-err' : undefined}
                />
              </div>
              {touched.amount && errors.amount && (
                <p className="ef-error-msg" id="ef-amount-err" role="alert">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div className={`ef-field ef-field--half ${touched.date && errors.date ? 'ef-field--error' : touched.date && !errors.date ? 'ef-field--valid' : ''}`}>
              <label className="ef-label" htmlFor="ef-date">
                Date <span className="required-star">*</span>
              </label>
              <input
                id="ef-date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                onBlur={handleBlur}
                max={getTodayString()}
                className="ef-input"
                aria-describedby={errors.date ? 'ef-date-err' : undefined}
              />
              {touched.date && errors.date && (
                <p className="ef-error-msg" id="ef-date-err" role="alert">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className={`ef-field ${touched.category && errors.category ? 'ef-field--error' : touched.category && !errors.category && formData.category ? 'ef-field--valid' : ''}`}>
            <label className="ef-label" htmlFor="ef-category">
              Category <span className="required-star">*</span>
            </label>
            <div className="ef-select-wrap">
              {selectedCategory && (
                <span className="ef-select-icon">{selectedCategory.icon}</span>
              )}
              <select
                id="ef-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`ef-input ef-select ${selectedCategory ? 'ef-select--has-icon' : ''}`}
                aria-describedby={errors.category ? 'ef-cat-err' : undefined}
              >
                <option value="">— Select a category —</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            {touched.category && errors.category && (
              <p className="ef-error-msg" id="ef-cat-err" role="alert">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className={`ef-field ${touched.description && errors.description ? 'ef-field--error' : ''}`}>
            <label className="ef-label" htmlFor="ef-desc">
              Description <span className="optional-tag">optional</span>
            </label>
            <div className="ef-input-wrap">
              <textarea
                id="ef-desc"
                name="description"
                placeholder="Add any notes about this expense…"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={300}
                rows={3}
                className="ef-input ef-textarea"
                aria-describedby={errors.description ? 'ef-desc-err' : undefined}
              />
              <span className="ef-char-count ef-char-count--textarea">
                {formData.description.length}/300
              </span>
            </div>
            {touched.description && errors.description && (
              <p className="ef-error-msg" id="ef-desc-err" role="alert">{errors.description}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="ef-footer">
            <button type="button" className="ef-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="ef-btn-submit"
              disabled={submitting}
            >
              {isEditing ? '💾 Save Changes' : '✅ Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}

