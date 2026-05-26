'use client';

import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useHomeDesign } from '@/hooks/useHomeDesign/useHomeDesign';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SortableItem } from '@/components/admin/home-design/HomeDesign/SortableItem';
import { StaticItem } from '@/components/admin/home-design/HomeDesign/StaticItem';
import { EditItemModal } from '@/components/admin/home-design/HomeDesign/EditItemModal';
import { Loader2 } from 'lucide-react';

export default function HomeDesign() {
    const {
        dayList,
        nightList,
        staticSections,
        isCreatingComponent,
        newComponentTitle,
        setNewComponentTitle,
        newComponentText,
        setNewComponentText,
        newComponentAffiliation,
        setNewComponentAffiliation,
        handleCreateComponent,
        handleDragEnd,
        openEditModal,
        closeEditModal,
        editingItem,
        isEditModalOpen,
        handleSaveEdit,
        handleDeleteItem,
        isUpdatingLayout,
        isDeletingItem,
        isUpdatingContent,
        renderKey,
        isSectionContentLoading
    } = useHomeDesign('/');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    return (
        <div className="container mx-auto space-y-8">
            <section className="p-6 border rounded-md shadow-sm bg-card">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Create New Component</h2>
                <form onSubmit={handleCreateComponent} className="space-y-4">
                    <Input 
                        id="newComponentTitle" 
                        value={newComponentTitle} 
                        onChange={(e) => setNewComponentTitle(e.target.value)} 
                        placeholder="Enter title for new component" 
                        disabled={isCreatingComponent}
                    />
                    <Textarea 
                        id="newComponentText" 
                        value={newComponentText} 
                        onChange={(e) => setNewComponentText(e.target.value)} 
                        placeholder="Enter text content for new component" 
                        rows={3}
                        disabled={isCreatingComponent}
                    />
                    <Select 
                        value={newComponentAffiliation}
                        onValueChange={(value) => setNewComponentAffiliation(value as 'DAY' | 'NIGHT')}
                        disabled={isCreatingComponent}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAY">Day</SelectItem>
                            <SelectItem value="NIGHT">Night</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={isCreatingComponent || !newComponentTitle || !newComponentText || !newComponentAffiliation}
                            className="min-w-[150px]"
                        >
                            {isCreatingComponent ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Component'}
                        </Button>
                    </div>
                </form>
            </section>
            
            {(isUpdatingLayout || isDeletingItem) && (
                 <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-md shadow-lg z-50 flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>{isUpdatingLayout ? 'Updating layout...' : isDeletingItem ? 'Deleting item...' : 'Processing...'}</span>
                </div>
            )}

            {/* Static Hero Components Section */} 
            {staticSections.filter(s => s.id.includes('hero')).length > 0 && (
                <section className="p-6 border rounded-md shadow-sm bg-card mb-10">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Hero Components</h2>
                    <div className="space-y-3">
                        {staticSections.filter(s => s.id.includes('hero')).map(item => (
                            <StaticItem key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            )}

            {/* Content Sections */}
            <DndContext
                key={renderKey} 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
                <div className="space-y-10">
                    <section className="p-6 border rounded-md shadow-sm bg-card">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Day Section</h2>
                        <SortableContext items={dayList} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3 min-h-[50px]">
                                {isSectionContentLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : dayList.length > 0 ? (
                                    dayList.map(item => (
                                        <SortableItem 
                                            key={item.id} 
                                            item={item} 
                                            onEdit={() => item.item_type !== 'static' && openEditModal(item)} 
                                            onDelete={() => item.item_type !== 'static' && handleDeleteItem(item.id, item.item_type as 'page_component' | 'set')}
                                            isDeleting={isDeletingItem && editingItem?.id === item.id} 
                                        />
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">No Day items yet.</p>
                                )}
                            </div>
                        </SortableContext>
                    </section>

                    <section className="p-6 border rounded-md shadow-sm bg-card">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Night Section</h2>
                        <SortableContext items={nightList} strategy={verticalListSortingStrategy}>
                             <div className="space-y-3 min-h-[50px]">
                                {isSectionContentLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : nightList.length > 0 ? (
                                    nightList.map(item => (
                                        <SortableItem 
                                            key={item.id} 
                                            item={item} 
                                            onEdit={() => item.item_type !== 'static' && openEditModal(item)} 
                                            onDelete={() => item.item_type !== 'static' && handleDeleteItem(item.id, item.item_type as 'page_component' | 'set')}
                                            isDeleting={isDeletingItem && editingItem?.id === item.id}
                                        />
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">No Night items yet.</p>
                                )}
                            </div>
                        </SortableContext>
                    </section>
                </div>
            </DndContext>

            {isEditModalOpen && editingItem && (
                <EditItemModal
                    isOpen={isEditModalOpen}
                    onOpenChange={(open) => {
                        if (!open) closeEditModal();
                    }}
                    itemToEdit={editingItem}
                    onSave={handleSaveEdit}
                    isSaving={isUpdatingContent}
                />
            )}
        </div>
    );
} 