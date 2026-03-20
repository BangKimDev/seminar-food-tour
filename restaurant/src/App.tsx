/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingScreen } from './components/common/LoadingScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { SystemUser, Restaurant } from './types';
import { SAMPLE_RESTAURANT } from './constants';

const App = () => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('foodstreet_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setRestaurant(SAMPLE_RESTAURANT);
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('foodstreet_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData: SystemUser) => {
    setUser(userData);
    setRestaurant(SAMPLE_RESTAURANT);
    localStorage.setItem('foodstreet_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('foodstreet_user');
    setUser(null);
    setRestaurant(null);
  };

  if (loading) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <div className="min-h-screen font-sans text-slate-900">
        {!user ? (
          <AuthScreen onLogin={handleLoginSuccess} />
        ) : (
          <Dashboard restaurant={restaurant!} onLogout={handleLogout} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
