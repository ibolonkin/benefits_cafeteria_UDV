import { useState, createContext } from 'react';
import { Navigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);

  const checkAuthStatus = async () => {
    const access_token = localStorage.getItem('accessToken');
    if (access_token) {
      const response = await fetch('http://26.15.99.17:8000/u/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (response.ok) {
        setIsAuth(true);
      } else {
        const refreshToken = async () => {
          try {
            const response = await fetch('http://26.15.99.17:8000/v1/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            });

            if (!response.ok) {
              return <Navigate to="/login" />;
            }

            return await response.json();
          } catch (error) {
            console.error(error);
            throw error;
          }
        };
        await refreshToken();
      }
    } else {
      setIsAuth(false);
    }
  };

  return <AuthContext.Provider value={{ isAuth, checkAuthStatus }}>{children}</AuthContext.Provider>;
};
