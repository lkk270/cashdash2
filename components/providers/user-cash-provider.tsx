'use client';

import React, { useState, createContext, useContext, ReactNode } from 'react';

interface UserCashContextProps {
  userCashString: string;
  setUserCashString: (cash: string) => void;
}

export const UserCashContext = createContext<UserCashContextProps>({
  userCashString: '$0.00',
  setUserCashString: () => {},
});

interface UserCashProviderProps {
  children: ReactNode;
  initialCash: string;
}

export const useUserCash = () => {
  return useContext(UserCashContext);
};

export const UserCashProvider: React.FC<UserCashProviderProps> = ({ children, initialCash }) => {
  const [userCashString, setUserCashString] = useState(initialCash);

  return (
    <UserCashContext.Provider value={{ userCashString, setUserCashString }}>
      {children}
    </UserCashContext.Provider>
  );
};
