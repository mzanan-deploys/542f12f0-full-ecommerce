'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getAdminSetsList } from '@/lib/actions/sets/setActions.client';
import type { AdminSetListItem } from '@/types/sets';
import { useDebounce } from '@/hooks/useDebounce';
import type { AdminSetsListResult } from '@/types/sets';

interface UseAdminSetsPageReturn {
    sets: AdminSetListItem[];
    count: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
    page: number;
    limit: number;
    search: string;
    setSearch: (value: string) => void;
}

export function useAdminSetsPage(): UseAdminSetsPageReturn {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [sets, setSets] = useState<AdminSetListItem[]>([]);
    const [count, setCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const page = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);
    const limit = useMemo(() => parseInt(searchParams.get('limit') || '15', 10), [searchParams]);

    const totalPages = useMemo(() => (count > 0 ? Math.ceil(count / limit) : 0), [count, limit]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const offset = (page - 1) * limit;

        const result: AdminSetsListResult = await getAdminSetsList({
            limit,
            offset,
            filters: { name: debouncedSearchTerm || undefined },
        });

        if (!result) {
             console.error("Error loading sets: Action returned undefined.");
             setError('Failed to load sets due to database connection error.');
             setSets([]);
             setCount(0);
        } else if (result.success && result.data) { 
            setSets(result.data.sets);
            setCount(result.data.count ?? 0);
        } else {
            setError(result.error || 'Failed to load sets');
            setSets([]);
            setCount(0);
            console.error("Error loading sets:", result.error);
        }
        setIsLoading(false);
    }, [page, limit, debouncedSearchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (debouncedSearchTerm) {
            current.set('search', debouncedSearchTerm);
        } else {
            current.delete('search');
        }
        current.set('page', '1');
        
        if (current.toString() !== searchParams.toString()) {
             router.push(`${pathname}?${current.toString()}`, { scroll: false });
        }
    }, [debouncedSearchTerm, pathname, router, searchParams]);

    const handleSetSearch = (value: string) => {
        setSearchTerm(value);
    };

    return {
        sets,
        count,
        totalPages,
        isLoading,
        error,
        page,
        limit,
        search: searchTerm,
        setSearch: handleSetSearch,
    };
} 