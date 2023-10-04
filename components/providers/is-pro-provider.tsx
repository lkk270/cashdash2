'use client';

import { TrendingUpIcon } from 'lucide-react';
import React, { useState, createContext, useContext, ReactNode } from 'react';

interface IsProContextProps {
  isPro: boolean;
  setIsPro: (isPro: boolean) => void;
}

export const IsProContext = createContext<IsProContextProps>({
  isPro: false,
  setIsPro: () => {},
});

interface IsProProviderProps {
  children: ReactNode;
  initialIsPro: boolean;
}

export const useIsPro = () => {
  return useContext(IsProContext);
};

export const IsProProvider: React.FC<IsProProviderProps> = ({ children, initialIsPro }) => {
  const [isPro, setIsPro] = useState(initialIsPro);

  return <IsProContext.Provider value={{ isPro, setIsPro }}>{children}</IsProContext.Provider>;
};
