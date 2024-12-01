import { createContext, useContext, useState } from 'react';

const HRContext = createContext();

export const HRProvider = ({ children }) => {
  const [isHRMode, setIsHRMode] = useState(false);
  const access_token = localStorage.getItem('accessToken');
    fetch('http://26.15.99.17:8000/profile/check/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setIsHRMode(data.super_user && ['/dashboard/benefits', '/dashboard/applications', '/dashboard/users', '/dashboard/statistics'].includes(window.location.pathname))
      })
      .catch((error) => console.error(error));

  return <HRContext.Provider value={{ isHRMode, setIsHRMode }}>{children}</HRContext.Provider>;
};

export const useHR = () => useContext(HRContext);
