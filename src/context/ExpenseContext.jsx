/**
 * ExpenseContext — all expense state + per-user persistence.
 *
 * Key behaviours
 *  • Guest (not signed in): expenses live only in React state (lost on refresh).
 *  • Signed-in user: expenses are read from / written to their slot in
 *    localStorage (via userStorage) so they survive refresh.
 *  • When currentUser changes (sign-in / sign-out) the expense list is
 *    re-hydrated from the new user's stored data.
 *  • Registers a getter with AuthContext so AuthContext can read in-memory
 *    guest expenses at sign-in time and offer to import them.
 */
import React, {
  createContext, useContext, useReducer,
  useEffect, useCallback, useRef,
} from 'react';
import { useAuth } from './AuthContext';
import { loadUserData } from '../utils/userStorage';

// ─── Action Types ──────────────────────────────────────────────────────────────
export const ACTIONS = {
  ADD_EXPENSE:         'ADD_EXPENSE',
  UPDATE_EXPENSE:      'UPDATE_EXPENSE',
  DELETE_EXPENSE:      'DELETE_EXPENSE',
  SET_FILTER_CATEGORY: 'SET_FILTER_CATEGORY',
  SET_SEARCH_QUERY:    'SET_SEARCH_QUERY',
  SET_SORT:            'SET_SORT',
  SET_BUDGET:          'SET_BUDGET',
  LOAD_EXPENSES:       'LOAD_EXPENSES',
};

// ─── Initial State ─────────────────────────────────────────────────────────────
const initialState = {
  expenses:       [],
  filterCategory: 'all',
  searchQuery:    '',
  sortBy:         'date_desc',
  monthlyBudget:  0,
};

// ─── Reducer ───────────────────────────────────────────────────────────────────
function expenseReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_EXPENSES:
      return {
        ...state,
        expenses:      action.payload.expenses ?? [],
        monthlyBudget: action.payload.budget   ?? 0,
      };
    case ACTIONS.ADD_EXPENSE:
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case ACTIONS.UPDATE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case ACTIONS.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };
    case ACTIONS.SET_FILTER_CATEGORY: return { ...state, filterCategory: action.payload };
    case ACTIONS.SET_SEARCH_QUERY:    return { ...state, searchQuery:    action.payload };
    case ACTIONS.SET_SORT:            return { ...state, sortBy:         action.payload };
    case ACTIONS.SET_BUDGET:          return { ...state, monthlyBudget:  action.payload };
    default: return state;
  }
}

// ─── Derived helpers ───────────────────────────────────────────────────────────
function getFiltered(expenses, filterCategory, searchQuery, sortBy) {
  let list = [...expenses];

  if (filterCategory !== 'all')
    list = list.filter((e) => e.category === filterCategory);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
    );
  }

  list.sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':   return new Date(b.date) - new Date(a.date);
      case 'date_asc':    return new Date(a.date) - new Date(b.date);
      case 'amount_desc': return b.amount - a.amount;
      case 'amount_asc':  return a.amount - b.amount;
      case 'title_asc':   return a.title.localeCompare(b.title);
      case 'title_desc':  return b.title.localeCompare(a.title);
      default:            return 0;
    }
  });

  return list;
}

function getCategoryTotals(expenses) {
  return expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
}

function getCurrentMonthTotal(expenses) {
  const now = new Date();
  return expenses
    .filter((e) => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + e.amount, 0);
}

// ─── Context ───────────────────────────────────────────────────────────────────
const ExpenseContext = createContext(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function ExpenseProvider({ children }) {
  const { currentUser, authReady, persistUserData, registerGuestExpenseGetter } = useAuth();
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Expose a getter so AuthContext can read guest expenses at sign-in time
  const expensesRef = useRef(state.expenses);
  expensesRef.current = state.expenses;

  useEffect(() => {
    registerGuestExpenseGetter(() => expensesRef.current);
  }, [registerGuestExpenseGetter]);

  // ── Load data when auth state changes ────────────────────────────────────────
  useEffect(() => {
    if (!authReady) return;

    if (currentUser) {
      // Signed-in: load this user's stored expenses + budget
      const stored = loadUserData(currentUser.id);
      dispatch({
        type: ACTIONS.LOAD_EXPENSES,
        payload: {
          expenses: stored?.expenses ?? [],
          budget:   stored?.budget   ?? 0,
        },
      });
    } else {
      // Signed out: clear the list (guest starts fresh)
      dispatch({ type: ACTIONS.LOAD_EXPENSES, payload: { expenses: [], budget: 0 } });
    }
  }, [authReady, currentUser?.id]);

  // ── Persist whenever expenses or budget change (signed-in users only) ─────────
  useEffect(() => {
    if (!authReady || !currentUser) return;
    persistUserData({ expenses: state.expenses, budget: state.monthlyBudget });
  }, [authReady, currentUser, state.expenses, state.monthlyBudget, persistUserData]);

  // ── Action Creators ────────────────────────────────────────────────────────────
  const addExpense        = useCallback((e)  => dispatch({ type: ACTIONS.ADD_EXPENSE,         payload: e  }), []);
  const updateExpense     = useCallback((e)  => dispatch({ type: ACTIONS.UPDATE_EXPENSE,       payload: e  }), []);
  const deleteExpense     = useCallback((id) => dispatch({ type: ACTIONS.DELETE_EXPENSE,       payload: id }), []);
  const setFilterCategory = useCallback((c)  => dispatch({ type: ACTIONS.SET_FILTER_CATEGORY, payload: c  }), []);
  const setSearchQuery    = useCallback((q)  => dispatch({ type: ACTIONS.SET_SEARCH_QUERY,    payload: q  }), []);
  const setSort           = useCallback((s)  => dispatch({ type: ACTIONS.SET_SORT,            payload: s  }), []);
  const setBudget         = useCallback((b)  => dispatch({ type: ACTIONS.SET_BUDGET,          payload: b  }), []);

  // ── Derived Values ─────────────────────────────────────────────────────────────
  const filteredExpenses  = getFiltered(state.expenses, state.filterCategory, state.searchQuery, state.sortBy);
  const totalExpenses     = state.expenses.reduce((s, e) => s + e.amount, 0);
  const currentMonthTotal = getCurrentMonthTotal(state.expenses);
  const categoryTotals    = getCategoryTotals(state.expenses);
  const budgetUsedPercent = state.monthlyBudget > 0
    ? Math.min((currentMonthTotal / state.monthlyBudget) * 100, 100)
    : 0;

  const value = {
    expenses:         state.expenses,
    filteredExpenses,
    filterCategory:   state.filterCategory,
    searchQuery:      state.searchQuery,
    sortBy:           state.sortBy,
    monthlyBudget:    state.monthlyBudget,
    totalExpenses,
    currentMonthTotal,
    categoryTotals,
    budgetUsedPercent,
    addExpense,
    updateExpense,
    deleteExpense,
    setFilterCategory,
    setSearchQuery,
    setSort,
    setBudget,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
}
