'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { InfiniteScrollList } from '@/components/ui/infinite-scroll-list';
import Image from 'next/image';
import { X, Plus, RotateCw, ChevronDown } from 'lucide-react';
import { useManageSetProducts } from './useManageSetProducts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { ProductWithPosition } from '@/types/db';

interface ManageSetProductsProps {
    setId: string;
    initialAssociatedProducts?: ProductWithPosition[];
}

const ManageSetProducts: React.FC<ManageSetProductsProps> = ({ setId, initialAssociatedProducts }) => {
    const {
        assignedProducts,
        availableProducts,
        isLoading,
        isLoadingMore,
        hasMoreProducts,
        searchTerm,
        associatedSearchTerm,
        isAddingProduct,
        isRemovingProduct,
        loadMoreProducts,
        setSearchTerm,
        setAssociatedSearchTerm,
        getProductImageUrl,
        addProduct,
        removeProduct
    } = useManageSetProducts(setId, initialAssociatedProducts);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Associated Products ({assignedProducts.length})</h3>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                Search associated products...
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                                <CommandInput 
                                    placeholder="Search associated products..." 
                                    value={associatedSearchTerm}
                                    onValueChange={setAssociatedSearchTerm}
                                />
                                <CommandList className="max-h-[300px]">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center p-4">
                                            <RotateCw className="h-4 w-4 animate-spin" />
                                        </div>
                                    ) : (
                                        <>
                                            <CommandEmpty>No associated products found.</CommandEmpty>
                                            <CommandGroup>
                                                <InfiniteScrollList
                                                    hasMore={false}
                                                    isLoading={false}
                                                    onLoadMore={() => {}}
                                                    className="max-h-[250px]"
                                                >
                                                    {assignedProducts
                                                        .filter(product => 
                                                            product.name?.toLowerCase().includes(associatedSearchTerm.toLowerCase())
                                                        )
                                                        .map((product) => (
                                                        <CommandItem
                                                            key={product.id}
                                                            value={product.name ?? product.id} 
                                                            className="flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex-shrink-0 w-10 h-10 relative bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                                                                    {getProductImageUrl(product) ? (
                                                                        <Image
                                                                            src={getProductImageUrl(product)!}
                                                                            alt={product.name ?? 'Product image'}
                                                                            fill
                                                                            sizes="40px"
                                                                            className="object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-600"></div>
                                                                    )}
                                                                </div>
                                                                <span className="font-medium text-sm truncate" title={product.name ?? ''}>{product.name ?? 'Unnamed Product'}</span>
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeProduct(product.id);
                                                                }}
                                                                disabled={isRemovingProduct}
                                                                aria-label={`Remove ${product.name}`}
                                                            >
                                                                {isRemovingProduct ? (
                                                                    <RotateCw className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <X className="h-4 w-4 text-red-500" />
                                                                )}
                                                            </Button>
                                                        </CommandItem>
                                                    ))}
                                                </InfiniteScrollList>
                                            </CommandGroup>
                                        </>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Add Products</h3>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                Search and add products...
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                                <CommandInput 
                                    placeholder="Search available products..." 
                                    value={searchTerm}
                                    onValueChange={setSearchTerm}
                                />
                                <CommandList className="max-h-[300px]">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center p-4">
                                            <RotateCw className="h-4 w-4 animate-spin" />
                                        </div>
                                    ) : (
                                        <>
                                            <CommandEmpty>No products found.</CommandEmpty>
                                            <CommandGroup>
                                                <InfiniteScrollList
                                                    hasMore={!searchTerm && hasMoreProducts}
                                                    isLoading={isLoadingMore}
                                                    onLoadMore={loadMoreProducts}
                                                    className="max-h-[250px]"
                                                >
                                                    {availableProducts.map((product) => (
                                                        <CommandItem
                                                            key={product.id}
                                                            value={product.name ?? product.id} 
                                                            className="flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex-shrink-0 w-10 h-10 relative bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                                                                    {getProductImageUrl(product) ? (
                                                                        <Image
                                                                            src={getProductImageUrl(product)!}
                                                                            alt={product.name ?? 'Product image'}
                                                                            fill
                                                                            sizes="40px"
                                                                            className="object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-600"></div>
                                                                    )}
                                                                </div>
                                                                <span className="font-medium text-sm truncate" title={product.name ?? ''}>{product.name ?? 'Unnamed Product'}</span>
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    addProduct(product.id);
                                                                }}
                                                                disabled={isAddingProduct || assignedProducts.some(p => p.id === product.id)}
                                                                aria-label={`Add ${product.name}`}
                                                            >
                                                                {isAddingProduct ? (
                                                                    <RotateCw className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Plus className="h-4 w-4 text-green-500" />
                                                                )}
                                                            </Button>
                                                        </CommandItem>
                                                    ))}
                                                </InfiniteScrollList>
                                            </CommandGroup>
                                        </>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
};

export default ManageSetProducts; 