'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShippingPriceForm } from './ShippingPriceForm';
import { getCountryShippingPricesAction } from '@/lib/actions/shippingPricesActions';
import { toast } from 'sonner';
import {
    TooltipProvider,
  } from "@/components/ui/tooltip";
import { SortableHeader } from '@/components/admin/data-table/SortableTableHead/SortableHeader';
import { Pagination } from '@/components/ui/pagination';
import { TableLoadingRow } from '@/components/admin/data-table/TableLoadingRow/TableLoadingRow';
import { ActionButtons } from '@/components/shared/ActionButtons/ActionButtons';
import { CountryShippingPrice } from '@/types/shipping';

interface ShippingPricesPageClientProps {
    initialPrices: CountryShippingPrice[];
    defaultPrice: number;
    upsertAction: (formData: FormData) => Promise<any>;
    deleteAction: (id: number) => Promise<any>;
    updateDefaultAction: (price: number) => Promise<any>;
}

type SortKey = 'country_name' | 'shipping_price' | 'min_delivery_days' | 'updated_at';
type SortDirection = 'asc' | 'desc';

export default function ShippingPricesPageClient({
    initialPrices,
    defaultPrice,
    upsertAction,
    deleteAction,
    updateDefaultAction
}: ShippingPricesPageClientProps) {
    const [formKey, setFormKey] = React.useState(Date.now().toString());
    const [editingPrice, setEditingPrice] = React.useState<CountryShippingPrice | undefined>(undefined);
    const [prices, setPrices] = React.useState<CountryShippingPrice[]>(initialPrices);
    const [isLoading, setIsLoading] = React.useState(false);
    const [currentDefaultPrice, setCurrentDefaultPrice] = React.useState(defaultPrice);
    const [isUpdatingDefault, setIsUpdatingDefault] = React.useState(false);
    const [sortKey, setSortKey] = React.useState<SortKey>('country_name');
    const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    const fetchPrices = async () => {
        setIsLoading(true);
        const result = await getCountryShippingPricesAction();
        if (result.success && result.data) {
            setPrices(result.data as unknown as CountryShippingPrice[]);
        } else {
            setPrices([]);
            toast.error(result.error || "Failed to refresh prices.");
        }
        setIsLoading(false);
    };

    const handleActionComplete = () => {
        fetchPrices();
        setEditingPrice(undefined);
        setFormKey(Date.now().toString());
    };

    const handleCancel = () => {
        setEditingPrice(undefined);
        setFormKey(Date.now().toString());
    };

    const handleEdit = (price: CountryShippingPrice) => {
        setEditingPrice(price);
        setFormKey(Date.now().toString());
    };

    const handleDelete = async (id: number) => {
        try {
            const result = await deleteAction(id);
            if(result.success) {
                setPrices(prevPrices => prevPrices.filter(p => p.id !== id));
                toast.success(result.message || 'Shipping price deleted successfully.');
            } else {
                toast.error(result.message || 'Failed to delete shipping price.');
            }
        } catch (err: any) {
            console.error("Error during delete:", err);
            toast.error(err.message || "An unexpected error occurred while deleting.");
        }
    };

    const handleUpdateDefaultPrice = async () => {
        setIsUpdatingDefault(true);
        try {
            const result = await updateDefaultAction(currentDefaultPrice);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (err: any) {
            console.error('Failed to update default price:', err);
            toast.error(err.message || 'An unexpected error occurred.');
        } finally {
            setIsUpdatingDefault(false);
        }
    };

    const handleSort = (key: string) => {
        const sortKeyTyped = key as SortKey;
        if (sortKey === sortKeyTyped) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(sortKeyTyped);
            setSortDirection('asc');
        }
    };

    const sortedPrices = React.useMemo(() => {
        const sorted = [...prices].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortKey) {
                case 'country_name':
                    aValue = a.country_name || a.country_code;
                    bValue = b.country_name || b.country_code;
                    break;
                case 'shipping_price':
                    aValue = parseFloat(a.shipping_price.toString());
                    bValue = parseFloat(b.shipping_price.toString());
                    break;
                case 'min_delivery_days':
                    aValue = a.min_delivery_days || 0;
                    bValue = b.min_delivery_days || 0;
                    break;
                case 'updated_at':
                    aValue = new Date(a.updated_at || 0);
                    bValue = new Date(b.updated_at || 0);
                    break;
                default:
                    return 0;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (sortDirection === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sorted.slice(startIndex, endIndex);
    }, [prices, sortKey, sortDirection, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(prices.length / itemsPerPage);

    return (
        <TooltipProvider>
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Shipping Prices by Country</h1>
                </div>
                <Card>
                    <CardContent className="pt-6 space-y-6">
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle>Default Shipping Price</CardTitle>
                                <CardDescription>This price will be used for countries without a specific shipping price set.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="defaultPrice" className="block text-sm font-medium mb-2">
                                            Default Price (USD)
                                        </label>
                                        <input
                                            id="defaultPrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder='9.99'
                                            value={currentDefaultPrice}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setCurrentDefaultPrice(value === '' ? 0 : parseFloat(value));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleUpdateDefaultPrice();
                                                }
                                            }}
                                        />
                                    </div>
                                    <Button 
                                        onClick={handleUpdateDefaultPrice}
                                        disabled={isUpdatingDefault}
                                        className="mt-8"
                                    >
                                        {isUpdatingDefault ? 'Updating...' : 'Update Default'}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Current default: <strong>${currentDefaultPrice.toFixed(2)}</strong>
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle>{editingPrice ? "Edit" : "Add New"} Country-Specific Price</CardTitle>
                                {editingPrice && <CardDescription>Editing price for {editingPrice.country_name || editingPrice.country_code}</CardDescription>}
                            </CardHeader>
                            <CardContent>
                                <ShippingPriceForm 
                                    currentData={editingPrice} 
                                    formAction={upsertAction} 
                                    formKey={formKey} 
                                    onActionComplete={handleActionComplete}
                                    onCancel={handleCancel}
                                />
                            </CardContent>
                        </Card>
                        
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle>Country-Specific Shipping Prices</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <SortableHeader 
                                                title="Country" 
                                                sortKey="country_name" 
                                                currentSort={sortKey} 
                                                currentOrder={sortDirection}
                                                onSort={handleSort}
                                            />
                                            <SortableHeader 
                                                title="Shipping Price" 
                                                sortKey="shipping_price" 
                                                currentSort={sortKey} 
                                                currentOrder={sortDirection}
                                                onSort={handleSort}
                                            />
                                            <SortableHeader 
                                                title="Delivery Time" 
                                                sortKey="min_delivery_days" 
                                                currentSort={sortKey} 
                                                currentOrder={sortDirection}
                                                onSort={handleSort}
                                            />
                                            <SortableHeader 
                                                title="Last Updated" 
                                                sortKey="updated_at" 
                                                currentSort={sortKey} 
                                                currentOrder={sortDirection}
                                                onSort={handleSort}
                                            />
                                            <TableHead className="font-bold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableLoadingRow colSpan={5} />
                                        ) : sortedPrices.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-10">No country-specific prices defined yet. The default price will be used for all countries.</TableCell></TableRow>
                                        ) : (
                                            sortedPrices.map((price) => {
                                                return (
                                                    <TableRow key={price.id || price.country_code}>
                                                        <TableCell className="font-medium">
                                                            {price.country_name ? `${getFlagEmoji(price.country_code)} ${price.country_name}` : `${getFlagEmoji(price.country_code)} ${price.country_code}`}
                                                        </TableCell>
                                                        <TableCell>${parseFloat(price.shipping_price.toString()).toFixed(2)}</TableCell>
                                                        <TableCell>{price.min_delivery_days ? `${price.min_delivery_days} - ${price.max_delivery_days || 'N/A'} days` : 'N/A'}</TableCell>
                                                        <TableCell>{price.updated_at ? new Date(price.updated_at).toLocaleDateString() : 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <ActionButtons
                                                                itemId={price.id?.toString() || price.country_code}
                                                                itemName={price.country_name || price.country_code}
                                                                entityName="Shipping Price"
                                                                onEdit={() => handleEdit(price)}
                                                                onDelete={() => handleDelete(price.id!)}
                                                                refreshData={fetchPrices}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}

function getFlagEmoji(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
} 