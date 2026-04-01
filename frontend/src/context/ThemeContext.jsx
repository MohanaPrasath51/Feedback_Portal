import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // Load from userProfile on login
  useEffect(() => {
    if (userProfile?.theme) {
      setIsDarkMode(userProfile.theme === 'dark');
    }
  }, [userProfile?.theme]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Sync to backend if logged in
    if (userProfile) {
      try {
        await api.put('/users/theme', { theme: newMode ? 'dark' : 'light' });
      } catch (err) {
        console.error('Failed to sync theme preference:', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
