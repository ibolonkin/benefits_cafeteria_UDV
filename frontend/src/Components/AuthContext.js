import { useState, createContext } from 'react';
import { useNavigate } from 'react-router-dom';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    const access_token = localStorage.getItem('accessToken');
    if (access_token) {
      const response = await fetch('http://26.15.99.17:8000/v1/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (response.ok) {
        setIsAuth(true);
      } else {
        localStorage.removeItem('accessToken');
        setIsAuth(false);
        navigate('/login');
      }
    } else {
      setIsAuth(false);
      navigate('/login');
    }
  };

  return <AuthContext.Provider value={{ isAuth, checkAuthStatus }}>{children}</AuthContext.Provider>;
};
