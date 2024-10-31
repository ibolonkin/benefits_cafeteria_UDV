import { createContext, useContext, useState } from 'react';

const HRContext = createContext();

export const HRProvider = ({ children }) => {
  const [isHRMode, setIsHRMode] = useState(false);

  return <HRContext.Provider value={{ isHRMode, setIsHRMode }}>{children}</HRContext.Provider>;
};

export const useHR = () => useContext(HRContext);
