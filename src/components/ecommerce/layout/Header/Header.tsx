'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/components/providers/StoreProvider';
import { BRAND_CONFIG } from '@/config/brand';

const CartIcon = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const itemCount = useAppStore((state) => state.getCartTotalItems());

  const displayItemCount = isMounted ? itemCount : 0;

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      aria-label="View Cart"
    >
      <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      {displayItemCount > 0 && (
        <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-black text-white border border-white text-xs flex items-center justify-center">
          {displayItemCount}
        </span>
      )}
    </Link>
  );
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      event.preventDefault();
      router.replace('/', { scroll: false });

      if (window.scrollY !== 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 w-full max-w-[100vw] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden"
      style={{
        position: 'sticky',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    >
      <div className="container mx-auto p-2 flex justify-between items-center">
        <div></div>

        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          onClick={handleLogoClick}
        >
          <span className="text-2xl font-bold tracking-tighter uppercase">
            <span>{BRAND_CONFIG.name}</span>
          </span>
        </Link>

        <div>
          <CartIcon />
        </div>
      </div>
    </header>
  );
} 