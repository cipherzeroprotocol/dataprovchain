import React, { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

export const ThemeContext = createContext();

const THEME_KEY = 'dataprovchain_theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Try to get theme from localStorage
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light'; // Default theme
  });
  
  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);
  
  const setLightTheme = useCallback(() => setTheme('light'), []);
  const setDarkTheme = useCallback(() => setTheme('dark'), []);
  
  return (
    <ThemeContext.Provider 
      value={{
        theme, 
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setLightTheme,
        setDarkTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
