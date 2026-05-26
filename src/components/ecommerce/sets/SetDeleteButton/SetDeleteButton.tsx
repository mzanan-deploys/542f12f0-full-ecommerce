'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSetDeleteButton } from './useSetDeleteButton';
import type { SetDeleteButtonProps } from '@/types/sets';
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog/DeleteConfirmationDialog';

export function SetDeleteButton({ setId, setName }: SetDeleteButtonProps) {
  const { isDeleting, handleDelete } = useSetDeleteButton({ setId });

  return (
    <DeleteConfirmationDialog
        itemName={setName}
        itemType="set"
        onConfirm={handleDelete}
        isPending={isDeleting}
        trigger={
            <Button 
                variant="destructive" 
                size="sm" 
                disabled={isDeleting}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </Button>
        }
    />
  );
} 