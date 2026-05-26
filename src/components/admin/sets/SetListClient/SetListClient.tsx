'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/formatting';
import Image from 'next/image';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { deleteSetAction } from '@/lib/actions/sets';
import { fetchSetsData } from '@/components/admin/sets/useSets';
import { SortableHeader } from '@/components/admin/data-table/SortableTableHead/SortableHeader';
import { Pagination } from '@/components/ui/pagination';
import { TableLoadingRow } from '@/components/admin/data-table/TableLoadingRow/TableLoadingRow';
import { ActionButtons } from '@/components/shared/ActionButtons/ActionButtons';
import type { AdminSetListItem } from '@/types/sets';

type SortKey = 'name' | 'type' | 'is_active' | 'product_count' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function SetListClient({ initialSets }: { initialSets?: AdminSetListItem[] }) {
    const router = useRouter();
    const [sets, setSets] = useState<AdminSetListItem[]>(initialSets || []);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState(!initialSets);
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const queryClient = useQueryClient();

    const refreshData = React.useCallback(async () => {
        try {
            const setsData = await fetchSetsData();
            setSets(setsData);
            queryClient.invalidateQueries({ queryKey: ['sets'] });
        } catch (error) {
            console.error('Error refreshing sets:', error);
            toast.error('Failed to refresh sets');
        }
    }, [queryClient]);

    useEffect(() => {
        if (!initialSets) {
            const loadSets = async () => {
                try {
                    setLoading(true);
                    const setsData = await fetchSetsData();
                    setSets(setsData);
                } catch (error) {
                    console.error('Error loading sets:', error);
                    toast.error('Failed to load sets');
                } finally {
                    setLoading(false);
                }
            };
            loadSets();
        }
    }, [initialSets]);

    const handleDelete = async (setId: string) => {
            try {
            const result = await deleteSetAction(setId);
            if (result.success) {
                await refreshData();
            return { success: true };
            } else {
                toast.error(result.error || 'Failed to delete set');
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            toast.error(err.message || 'An unexpected error occurred');
            return { success: false, error: err.message };
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

    const filteredAndSortedSets = React.useMemo(() => {
        const filtered = sets.filter(set => 
            set.name.toLowerCase().includes(search.toLowerCase())
        );

        const sorted = filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortKey) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'type':
                    aValue = a.type;
                    bValue = b.type;
                    break;
                case 'is_active':
                    aValue = a.is_active ? 1 : 0;
                    bValue = b.is_active ? 1 : 0;
                    break;
                case 'product_count':
                    aValue = a.product_count || 0;
                    bValue = b.product_count || 0;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at ?? 0);
                    bValue = new Date(b.created_at ?? 0);
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
    }, [sets, search, sortKey, sortDirection, currentPage, itemsPerPage]);

    const totalFilteredCount = React.useMemo(() => {
        return sets.filter(set => 
            set.name.toLowerCase().includes(search.toLowerCase())
        ).length;
    }, [sets, search]);

    const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search sets..."
                            disabled
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                    <TableHeader className=''>
                        <TableRow>
                            <TableHead className="font-bold">Image</TableHead>
                            <TableHead className="font-bold">Name</TableHead>
                            <TableHead className="font-bold">Type</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold">Products</TableHead>
                            <TableHead className="font-bold">Created</TableHead>
                            <TableHead className="font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                        <TableBody>
                        <TableLoadingRow colSpan={7} />
                        </TableBody>
                </Table>
            </div>
        </div>
    );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold">Image</TableHead>
                            <SortableHeader 
                                title="Name" 
                                sortKey="name" 
                                currentSort={sortKey} 
                                currentOrder={sortDirection}
                                onSort={handleSort}
                            />
                            <SortableHeader 
                                title="Type" 
                                sortKey="type" 
                                currentSort={sortKey} 
                                currentOrder={sortDirection}
                                onSort={handleSort}
                            />
                            <SortableHeader 
                                title="Status" 
                                sortKey="is_active" 
                                currentSort={sortKey} 
                                currentOrder={sortDirection}
                                onSort={handleSort}
                            />
                            <SortableHeader 
                                title="Products" 
                                sortKey="product_count" 
                                currentSort={sortKey} 
                                currentOrder={sortDirection}
                                onSort={handleSort}
                            />
                            <SortableHeader 
                                title="Created" 
                                sortKey="created_at" 
                                currentSort={sortKey} 
                                currentOrder={sortDirection}
                                onSort={handleSort}
                            />
                                <TableHead className="font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                    <TableBody>
                        {filteredAndSortedSets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">
                                    {search ? 'No sets match your search.' : 'No sets created yet.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAndSortedSets.map((set) => (
                                <TableRow 
                                    key={set.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/admin/sets/${set.id}/edit`)}
                                >
                                    <TableCell>
                                        <div className="w-10 h-10 flex items-center justify-center p-1">
                                        {set.image_url ? (
                                            <Image
                                                src={set.image_url}
                                                alt={set.name}
                                                width={40}
                                                    height={40}
                                                    className="rounded object-cover w-full h-full border"
                                            />
                                        ) : (
                                                <div className="w-full h-full rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                                                    No image
                                            </div>
                                        )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{set.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{set.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={set.is_active ? 'default' : 'outline'}>
                                            {set.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{set.product_count || 0}</TableCell>
                                    <TableCell>{formatDate(set.created_at)}</TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <ActionButtons
                                            itemId={set.id}
                                            itemName={set.name}
                                            entityName="Set"
                                            editHref={`/admin/sets/${set.id}/edit`}
                                            deleteAction={handleDelete}
                                            refreshData={refreshData}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
} 