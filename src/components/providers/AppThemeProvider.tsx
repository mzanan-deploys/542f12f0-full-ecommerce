'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes';
import { usePathname } from 'next/navigation';

export function AppThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname();
  const isSetPage = pathname.startsWith('/set/');
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  let forcedThemeValue: string | undefined = undefined;
  if (!isSetPage) {
    forcedThemeValue = 'light';
  }

  return (
    <NextThemesProvider
      {...props}
      forcedTheme={forcedThemeValue}
    >
      {children}
    </NextThemesProvider>
  );
}
