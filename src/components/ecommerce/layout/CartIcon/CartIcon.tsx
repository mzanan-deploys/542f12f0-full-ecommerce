'use client'

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useAppStore } from '@/components/providers/StoreProvider';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function CartIcon() {
    const [isHydrated, setIsHydrated] = useState(false);
    const totalItems = useAppStore((state) => state.getCartTotalItems());

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    return (
        <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" aria-label="Shopping Cart">
                <ShoppingCart className="h-5 w-5" />
                {isHydrated && totalItems > 0 && (
                     <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {totalItems}
                    </span>
                )}
            </Button>
        </Link>
    );
} 