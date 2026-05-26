'use client';

import { useTransition } from 'react';
import { deleteSetAction } from '@/lib/actions/setActions';
import type { UseSetDeleteButtonReturn } from '@/types/sets';

interface HookProps {
    setId: string;
    onDeleted?: () => void;
}

export function useSetDeleteButton({ 
    setId, 
    onDeleted
}: HookProps): UseSetDeleteButtonReturn {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
        const result = await deleteSetAction(setId);
        if (result.success) {
            if (onDeleted) onDeleted();
        }
    });
  };

  return {
    isDeleting: isPending,
    handleDelete,
  };
} 