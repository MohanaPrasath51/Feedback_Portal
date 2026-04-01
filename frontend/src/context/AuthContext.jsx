import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, logOut } from '../firebase/auth';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Firebase user
  const [userProfile, setUserProfile] = useState(null); // MongoDB user
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const { data } = await api.get('/users/me');
    setUserProfile(data);
    return data;
  };

  useEffect(() => {
    // 1. Initial check for Custom JWT (Admins)
    const checkCustomAuth = async () => {
      const customToken = localStorage.getItem('token');
      if (customToken && !currentUser) {
        try {
          await refreshProfile();
        } catch (err) {
          console.error('Custom auth failure:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    // 2. Firebase Auth Listener
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setLoading(true);
      setCurrentUser(firebaseUser);

      if (firebaseUser) {
        try {
          await refreshProfile();
        } catch (err) {
          console.error('Failed to fetch user profile:', err.message);
          setUserProfile(null);
        }
      } else {
        // If no firebase user, and no custom token, clear profile
        if (!localStorage.getItem('token')) {
          setUserProfile(null);
        }
      }

      setLoading(false);
    });

    checkCustomAuth();

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await logOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
