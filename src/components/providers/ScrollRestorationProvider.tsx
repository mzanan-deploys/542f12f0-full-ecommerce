'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ScrollRestorationContextType {
  isInitialLoadInSession: boolean;
}

const ScrollRestorationContext = createContext<ScrollRestorationContextType>({ 
  isInitialLoadInSession: true 
});

export const useScrollRestorationContext = () => useContext(ScrollRestorationContext);

export const ScrollRestorationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitialLoadInSession, setIsInitialLoadInSession] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
      }

      if (sessionStorage.getItem('sessionStarted')) {
        setIsInitialLoadInSession(false);
      } else {
        sessionStorage.setItem('sessionStarted', 'true');
        setIsInitialLoadInSession(true);
      }
    }
  }, []);

  return (
    <ScrollRestorationContext.Provider value={{ isInitialLoadInSession }}>
      {children}
    </ScrollRestorationContext.Provider>
  );
}; 