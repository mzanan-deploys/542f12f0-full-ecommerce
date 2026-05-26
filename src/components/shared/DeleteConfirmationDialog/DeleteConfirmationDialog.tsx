'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmationDialogProps {
  trigger: React.ReactNode;
  itemName: string;
  itemType?: string;
  onConfirm: () => Promise<void> | void;
  isPending?: boolean;
}

export function DeleteConfirmationDialog({
  trigger,
  itemName,
  itemType = 'item', 
  onConfirm,
  isPending = false,
}: DeleteConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await onConfirm(); 
      setIsOpen(false);
    } catch (error) {
      console.error('Error during confirmation:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the {itemType} "<strong>{itemName}</strong>".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Confirm Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 