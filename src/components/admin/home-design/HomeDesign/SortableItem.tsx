import React, { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from "@/lib/utils/cn";
import { PageComponentContent, SortableListItem } from '@/types/db';
import { SectionPlaceholder } from './SectionPlaceholder';
import { isStaticSection, isPageComponent, isSetItem } from '@/lib/utils/homeDesignUtils'; 
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog/DeleteConfirmationDialog';
import Image from 'next/image';

interface SortableItemProps {
    item: SortableListItem;
    onEdit: (item: SortableListItem) => void;
    onDelete: (itemId: string, itemType: 'page_component' | 'set') => void;
    isDeleting?: boolean;
}

export function SortableItem({ item, onEdit, onDelete, isDeleting = false }: SortableItemProps) {
    const isStatic = isStaticSection(item);
    const isSet = isSetItem(item);
    const isComponent = isPageComponent(item);
    const { 
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: item.id,
        disabled: isStatic,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 'auto',
        cursor: isStatic ? 'default' : 'grab',
        touchAction: 'none',
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(item);
    };

    let itemName = '.';
    let itemTypeForDialog: 'page component' | 'set' = 'page component';
    if (isComponent) {
        itemName = (item.content as PageComponentContent)?.title || item.id.substring(0,6);
        itemTypeForDialog = 'page component';
    } else if (isSet) {
        itemName = item.name || item.id.substring(0,6);
        itemTypeForDialog = 'set';
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative border rounded-md mb-2",
                isStatic && "border-gray-300 dark:border-gray-600",
                isComponent && "border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/50 shadow-sm",
                isDragging && "shadow-lg"
            )}
        >
            {!isStatic && !isSet && (
                <div className="absolute top-1 right-1 z-10 flex gap-1">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleEditClick}
                        aria-label="Edit"
                        className="h-6 w-6 p-1 hover:bg-muted/50"
                    >
                        <Pencil className="h-3 w-3" />
                    </Button>
                    <DeleteConfirmationDialog
                        itemName={itemName}
                        itemType={itemTypeForDialog}
                        onConfirm={() => onDelete(item.id, isComponent ? 'page_component' : 'set')}
                        isPending={isDeleting}
                        trigger={
                            <Button 
                                variant="ghost" 
                                size="sm"
                                aria-label="Delete"
                                className="h-6 w-6 p-1 text-red-500 hover:bg-red-500/10"
                                disabled={isDeleting}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        }
                    />
                </div>
            )}

            <div {...attributes} {...listeners} className={cn(isStatic ? "" : "cursor-grab", "p-2")}>
                {isStatic ? (
                <SectionPlaceholder title={item.title} subtitle={item.subtitle} className={cn("border-none opacity-100", item.className)} />
                ) : isSet ? (
                    <div className="text-black dark:text-white text-sm">
                        <strong className='block font-semibold mb-0.5'>{item.name}</strong>
                        {item.description && <p className='text-xs opacity-80 mb-0.5'>{item.description}</p>}
                        <span className="text-xs opacity-70">Order: {item.display_order ?? 'N/A'}</span>
                    </div>
                ) : (
                    <div className="text-black dark:text-white text-sm">
                        { (item.content as PageComponentContent)?.title && <strong className='block font-semibold mb-0.5'>{(item.content as PageComponentContent).title}</strong>}
                        {(item.content as PageComponentContent)?.text && <p className='mt-1 text-xs opacity-80'>{(item.content as PageComponentContent).text}</p>}
                        <span className="text-xs opacity-70">ID: {String(item.id).substring(0, 6)}</span><br/>
                        <span className="text-xs opacity-70">Order: {item.display_order ?? 'N/A'}</span>
                        {typeof (item.content as PageComponentContent)?.imageUrl === 'string' && 
                            <Image src={(item.content as PageComponentContent).imageUrl as string} alt="About image" width={80} height={80} className="mt-1 border rounded" />}
                        </div>
                    )}
                </div>
        </div>
    );
} 