import { LOCAL_STORAGE_KEY, BUDGET_STORAGE_KEY } from './constants';

export function loadExpenses() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    console.error('Failed to save expenses to localStorage');
  }
}

export function loadBudget() {
  try {
    const data = localStorage.getItem(BUDGET_STORAGE_KEY);
    return data ? parseFloat(data) : 0;
  } catch {
    return 0;
  }
}

export function saveBudget(budget) {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, String(budget));
  } catch {
    console.error('Failed to save budget to localStorage');
  }
}
