import React, { createContext, useContext, useState, useEffect } from 'react';
import { Technician } from '../types';

interface AuthContextType {
  technician: Technician | null;
  token: string | null;
  login: (token: string, technician: Technician) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data in localStorage
    const storedToken = localStorage.getItem('fieldtech_token');
    const storedTechnician = localStorage.getItem('fieldtech_technician');

    if (storedToken && storedTechnician) {
      try {
        const parsedTechnician = JSON.parse(storedTechnician);
        setToken(storedToken);
        setTechnician(parsedTechnician);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('fieldtech_token');
        localStorage.removeItem('fieldtech_technician');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newTechnician: Technician) => {
    setToken(newToken);
    setTechnician(newTechnician);
    localStorage.setItem('fieldtech_token', newToken);
    localStorage.setItem('fieldtech_technician', JSON.stringify(newTechnician));
  };

  const logout = () => {
    setToken(null);
    setTechnician(null);
    localStorage.removeItem('fieldtech_token');
    localStorage.removeItem('fieldtech_technician');
  };

  const value = {
    technician,
    token,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};