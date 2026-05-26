'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { type ActionResponse } from "@/types/actions";

interface ActionButtonsProps {
    itemId: string;
    itemName?: string;
    entityName: string;
    editHref?: string;
    onEdit?: () => void;
    deleteAction?: (id: string) => Promise<ActionResponse>;
    onDelete?: () => void;
    refreshData?: () => void;
}

export function ActionButtons({
    itemId,
    itemName,
    entityName,
    editHref,
    onEdit,
    deleteAction,
    onDelete,
    refreshData,
}: ActionButtonsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirmation = () => {
        setShowDeleteDialog(true);
    };

    const handleDelete = async () => {
        if (deleteAction) {
            setIsDeleting(true);
            const result = await deleteAction(itemId);
            if (result.success) {
                toast.success(`${entityName} "${itemName || itemId}" deleted successfully.`);
                refreshData?.();
            } else {
                toast.error(result.error || `Failed to delete ${entityName.toLowerCase()}.`);
            }
            setIsDeleting(false);
            setShowDeleteDialog(false);
        } else if (onDelete) {
            onDelete();
            setShowDeleteDialog(false);
        }
    };

    const editButton = editHref ? (
        <Link href={editHref}>
            <Button variant="outline" size="icon" title={`Edit ${entityName}`}>
                <Pencil className="h-4 w-4" />
            </Button>
        </Link>
    ) : onEdit ? (
        <Button variant="outline" size="icon" onClick={onEdit} title={`Edit ${entityName}`}>
            <Pencil className="h-4 w-4" />
        </Button>
    ) : null;

    const deleteButton = (deleteAction || onDelete) ? (
        <Button 
            variant="destructive" 
            size="icon" 
            onClick={handleDeleteConfirmation} 
            title={`Delete ${entityName}`}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    ) : null;

    return (
        <>
            <div className="text-right space-x-2 pr-1 flex items-start">
                {editButton}
                {deleteButton}
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the {entityName.toLowerCase()} {itemName && <strong>"{itemName}"</strong>}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete} 
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 