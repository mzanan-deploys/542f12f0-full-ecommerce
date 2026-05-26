'use client'

import * as React from 'react';
import { type ActionResponse } from "@/types/actions";
import { ActionButtons } from '@/components/shared/ActionButtons/ActionButtons';

interface DataTableActionsProps {
    itemId: string;
    entityName: string;
    editItemLinkPattern?: string;
    deleteItemAction?: (id: string) => Promise<ActionResponse>; 
    refreshData?: () => void; 
}

export function DataTableActions({
    itemId,
    entityName,
    editItemLinkPattern,
    deleteItemAction,
    refreshData,
}: DataTableActionsProps) {
    const editHref = editItemLinkPattern ? editItemLinkPattern.replace('[id]', itemId) : undefined;

    return (
        <ActionButtons
            itemId={itemId}
            entityName={entityName}
            editHref={editHref}
            deleteAction={deleteItemAction}
            refreshData={refreshData}
        />
    );
} 