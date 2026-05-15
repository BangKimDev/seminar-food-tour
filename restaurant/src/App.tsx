import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingScreen } from './components/common/LoadingScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { SystemUser, Restaurant } from './types';
import { restaurantService, RestaurantData } from './services/restaurantService';

const mapRestaurant = (data: RestaurantData, user: SystemUser): Restaurant => ({
  id: data.id,
  ownerId: user.id,
  ownerEmail: user.email,
  name: data.name,
  description: data.description,
  cuisine: data.cuisine,
  location: {
    lat: data.poi?.lat ?? 10.7769,
    lng: data.poi?.lng ?? 106.7009,
  },
  imageUrl: data.imageUrl,
  openingHours: data.openingHours,
  status: data.status,
  views: data.views,
  createdAt: new Date().toISOString(),
});

const fetchRestaurant = async (user: SystemUser): Promise<Restaurant | null> => {
  try {
    if (user.restaurantId) {
      const data = await restaurantService.getById(user.restaurantId);
      if (data) return mapRestaurant(data, user);
    }
    const data = await restaurantService.getMyRestaurant(user.id);
    if (data) return mapRestaurant(data, user);
    return null;
  } catch {
    return null;
  }
};

const App = () => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    (async () => {
      const savedUser = localStorage.getItem('foodstreet_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          const data = await fetchRestaurant(parsedUser);
          if (data) {
            setUser(parsedUser);
            setRestaurant(data);
          } else {
            localStorage.removeItem('foodstreet_user');
          }
        } catch (e) {
          console.error('Failed to parse saved user', e);
          localStorage.removeItem('foodstreet_user');
        }
      }
      setLoadingUser(false);
    })();
  }, []);

  const handleLoginSuccess = async (userData: SystemUser) => {
    setLoadingUser(true);
    localStorage.setItem('foodstreet_user', JSON.stringify(userData));
    const data = await fetchRestaurant(userData);
    if (data) {
      setUser(userData);
      setRestaurant(data);
    } else {
      localStorage.removeItem('foodstreet_user');
    }
    setLoadingUser(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('foodstreet_user');
    setUser(null);
    setRestaurant(null);
  };

  const handleRestaurantUpdate = (data: RestaurantData) => {
    if (user) {
      setRestaurant(mapRestaurant(data, user));
    }
  };

  if (loadingUser) return <LoadingScreen />;

  if (!user) return <AuthScreen onLogin={handleLoginSuccess} />;

  return (
    <ErrorBoundary>
      <div className="min-h-screen text-charcoal">
        <Dashboard restaurant={restaurant!} onLogout={handleLogout} onRestaurantUpdate={handleRestaurantUpdate} />
      </div>
    </ErrorBoundary>
  );
};

export default App;
