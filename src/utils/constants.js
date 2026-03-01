// ASU Brand Colors
export const ASU_COLORS = {
  maroon: '#8C1D40',
  maroonDark: '#6B1530',
  maroonLight: '#A52050',
  gold: '#FFC627',
  goldDark: '#E6B020',
  goldLight: '#FFD45C',
  black: '#191919',
  darkGray: '#2D2D2D',
  gray: '#4A4A4A',
  lightGray: '#F5F5F5',
  white: '#FFFFFF',
};

// Expense Categories with icons and colors
export const CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: '🍽️', color: '#FF6B6B' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#4ECDC4' },
  { value: 'education', label: 'Education', icon: '📚', color: '#45B7D1' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎮', color: '#96CEB4' },
  { value: 'health', label: 'Health & Fitness', icon: '💊', color: '#FFEAA7' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#DDA0DD' },
  { value: 'housing', label: 'Housing & Rent', icon: '🏠', color: '#F0A500' },
  { value: 'utilities', label: 'Utilities', icon: '💡', color: '#A8D8EA' },
  { value: 'travel', label: 'Travel', icon: '✈️', color: '#98D8C8' },
  { value: 'subscriptions', label: 'Subscriptions', icon: '📱', color: '#B8B8FF' },
  { value: 'other', label: 'Other', icon: '📦', color: '#C8C8C8' },
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'amount_desc', label: 'Highest Amount' },
  { value: 'amount_asc', label: 'Lowest Amount' },
  { value: 'title_asc', label: 'Title A–Z' },
  { value: 'title_desc', label: 'Title Z–A' },
];

export const LOCAL_STORAGE_KEY = 'prem_asu_expenses';
export const BUDGET_STORAGE_KEY = 'prem_asu_budget';
