import React, { useState, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import PalmBackground from './components/PalmBackground/PalmBackground';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import FilterBar from './components/FilterBar/FilterBar';
import ExpenseList from './components/ExpenseList/ExpenseList';
import ExpenseForm from './components/ExpenseForm/ExpenseForm';
import Analytics from './components/Analytics/Analytics';
import UnsavedBanner from './components/UnsavedBanner/UnsavedBanner';
import './App.css';

function AppContent() {
  const [showForm,      setShowForm]      = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const handleOpenAdd  = useCallback(() => { setEditingExpense(null); setShowForm(true);  }, []);
  const handleOpenEdit = useCallback((e) => { setEditingExpense(e);   setShowForm(true);  }, []);
  const handleClose    = useCallback(() => { setEditingExpense(null); setShowForm(false); }, []);

  return (
    <div className="app-root">
      <PalmBackground />

      <Header onAddExpense={handleOpenAdd} />

      <main className="app-main">
        <div className="app-container">

          {/* Overview stats */}
          <Dashboard />

          {/* Search + category filter */}
          <FilterBar />

          {/* Expense list */}
          <ExpenseList onEdit={handleOpenEdit} />

          {/* D3 Analytics — below the list */}
          <Analytics />

        </div>
      </main>

      <footer className="app-footer">
        <span>Built by <strong>Prem Pagare</strong> · Arizona State University</span>
        <span className="app-footer__divider">·</span>
        <span className="app-footer__tag">Sun Devils 🔱</span>
      </footer>

      <UnsavedBanner />

      {/* Add / Edit modal — centered overlay */}
      {showForm && (
        <ExpenseForm expenseToEdit={editingExpense} onClose={handleClose} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </AuthProvider>
  );
}
