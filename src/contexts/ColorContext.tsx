
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ColorContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  backgroundGradient: string;
  setBackgroundGradient: (gradient: string) => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const useColor = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColor must be used within a ColorProvider');
  }
  return context;
};

const defaultColors = [
  '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', 
  '#EF4444', '#3B82F6', '#8B5A2B', '#059669'
];

export const ColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6');
  const [backgroundGradient, setBackgroundGradient] = useState('');

  useEffect(() => {
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
      setPrimaryColor(savedColor);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    // Update CSS custom properties for dynamic theming
    const root = document.documentElement;
    root.style.setProperty('--dynamic-primary', primaryColor);
    root.style.setProperty('--dynamic-primary-rgb', hexToRgb(primaryColor));
  }, [primaryColor]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '139, 92, 246';
  };

  return (
    <ColorContext.Provider value={{ 
      primaryColor, 
      setPrimaryColor, 
      backgroundGradient, 
      setBackgroundGradient 
    }}>
      {children}
    </ColorContext.Provider>
  );
};
