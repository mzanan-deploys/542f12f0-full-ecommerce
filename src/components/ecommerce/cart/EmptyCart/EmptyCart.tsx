import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { clearHomeScrollPosition } from '@/lib/utils/scrollHelpers';

export function EmptyCart() {
    return (
        <div className="min-h-full flex items-center justify-center">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-6">
                        <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                    <p className="text-gray-600 mb-8">
                        Looks like you haven't added any items to your cart yet. 
                        Browse our collections to find something you love.
                    </p>
                    <Link href="/">
                        <Button className="w-full" onClick={clearHomeScrollPosition}>
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
} 