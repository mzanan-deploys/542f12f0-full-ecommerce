import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { 
    SortableListItem,
    SortablePageItem,
    SortableSetItem
} from '@/types/db';
import { 
    useHomeLayoutData, 
    useCreatePageComponentMutation,
    useUpdateHomepageLayoutOrderMutation,
    useDeleteHomepageItemMutation,
    useUpdatePageComponentContentMutation,
    useUpdateSetContentMutation
} from '@/lib/queries/homeDesignQueries';
import { staticSections } from '@/lib/constants/homeDesign';
import { createDragEndHandler } from '@/lib/handlers/homeDesignHandlers';
import { toast } from 'sonner';
import { getSetsByIdsAction } from '@/lib/queries/setQueries.server';
import { getPageComponentsByIdsAction } from '@/lib/queries/homeDesignQueries.server';
import { useQueryClient } from '@tanstack/react-query';
import { homeLayoutQueryKeys } from '@/lib/queries/homeDesignQueries';

export function useHomeDesign(pagePath: string = '/') {
    const { data: layoutData, isLoading: isLayoutLoading, error: layoutError, refetch: refetchLayout } = useHomeLayoutData(pagePath);
    
    const [dayList, setDayList] = useState<SortableListItem[]>([]);
    const [nightList, setNightList] = useState<SortableListItem[]>([]);
    const [isProcessingLayout, setIsProcessingLayout] = useState(false);
    const [renderKey, setRenderKey] = useState(Date.now());
    const [newComponentTitle, setNewComponentTitle] = useState('');
    const [newComponentText, setNewComponentText] = useState('');
    const [editingItem, setEditingItem] = useState<SortableListItem | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newComponentAffiliation, setNewComponentAffiliation] = useState<'DAY' | 'NIGHT' | '' | undefined>('');

    const processLayoutData = useCallback(async (rawLayoutData: any[]) => {
        if (!rawLayoutData || rawLayoutData.length === 0) {
            setDayList([]);
            setNightList([]);
            return;
        }

        const componentIds = rawLayoutData
            .filter((item: any) => item.item_type === 'page_component')
            .map((item: any) => item.item_id);
        const setIds = rawLayoutData
            .filter((item: any) => item.item_type === 'set')
            .map((item: any) => item.item_id);

        const [componentsResult, setsResult] = await Promise.all([
            getPageComponentsByIdsAction(componentIds),
            getSetsByIdsAction(setIds)
        ]);
        
        if (!componentsResult.success || !setsResult.success) {
            console.error('[ERROR] Error fetching related data:', { 
                componentError: componentsResult.error, 
                setError: setsResult.error 
            });
            toast.error('Failed to load all page component data.');
            return;
        }

        const fetchedComponents = componentsResult.data || [];
        const fetchedSets = setsResult.data || [];
        
        const componentMap = new Map(fetchedComponents.map(c => [c.id, c]));
        const setMap = new Map(fetchedSets.map(s => [s.id, s]));

        const tempDayList: SortableListItem[] = [];
        const tempNightList: SortableListItem[] = [];

        rawLayoutData.forEach((layoutItem: any) => {
            if (layoutItem.item_type === 'page_component') {
                const component = componentMap.get(layoutItem.item_id);
                if (component && component.affiliation) {
                    const sortablePageItem: SortablePageItem = {
                        ...component, 
                        item_type: 'page_component', 
                        display_order: layoutItem.display_order 
                    };
                    if (component.affiliation === 'DAY') {
                        tempDayList.push(sortablePageItem);
                    } else if (component.affiliation === 'NIGHT') {
                        tempNightList.push(sortablePageItem);
                    }
                }
            } else if (layoutItem.item_type === 'set') {
                const set = setMap.get(layoutItem.item_id);
                if (set && set.type) {
                    const upperCaseType = set.type.toUpperCase();
                    const sortableSetItem: SortableSetItem = {
                        ...set,
                        item_type: 'set',
                        display_order: layoutItem.display_order,
                        type: set.type 
                    };
                    
                    if (upperCaseType === 'DAY' || upperCaseType === 'WHITE') {
                        tempDayList.push(sortableSetItem);
                    } else if (upperCaseType === 'NIGHT' || upperCaseType === 'BLACK') {
                        tempNightList.push(sortableSetItem);
                    } 
                }
            }
        });

        setDayList(tempDayList);
        setNightList(tempNightList);
        setRenderKey(Date.now());
    }, []);

    useEffect(() => {
        if (layoutData && Array.isArray(layoutData)) {
            setIsProcessingLayout(true);
            processLayoutData(layoutData).finally(() => {
                setIsProcessingLayout(false);
            });
        } else if (!isLayoutLoading) {
             setDayList([]);
             setNightList([]);
        }
    }, [layoutData, isLayoutLoading, processLayoutData]);

    const queryClient = useQueryClient();

    const createPageComponentMutation = useCreatePageComponentMutation();
    const updateLayoutOrderMutation = useUpdateHomepageLayoutOrderMutation();
    const deleteItemMutation = useDeleteHomepageItemMutation();
    const updatePageComponentContentMutation = useUpdatePageComponentContentMutation();
    const updateSetContentMutation = useUpdateSetContentMutation();
    
    const manualUpdateOnSuccess = () => {
        queryClient.invalidateQueries({ queryKey: homeLayoutQueryKeys.layout(pagePath) });
    };

    const handleDragEnd = useCallback(
        createDragEndHandler(
            dayList,
            nightList,
            setDayList,
            setNightList,
            pagePath,
            updateLayoutOrderMutation
        ),
        [dayList, nightList, pagePath, updateLayoutOrderMutation]
    );

    const handleCreateComponent = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newComponentTitle || !newComponentText || !newComponentAffiliation) {
          toast.error('Title, text content, and section affiliation are required.');
          return;
        }
    
        const newComponent = await createPageComponentMutation.mutateAsync({
            title: newComponentTitle,
            text: newComponentText,
            affiliation: newComponentAffiliation,
            pagePath: pagePath,
            type: 'text',
        });

        const newSortableItem: SortablePageItem = {
            ...newComponent,
            item_type: 'page_component',
            display_order: newComponent.display_order || 0,
        };

        const listUpdater = (list: SortableListItem[]) => [...list, newSortableItem];
        if (newComponent.affiliation === 'DAY') {
            setDayList(listUpdater);
        } else {
            setNightList(listUpdater);
        }

        setNewComponentTitle('');
        setNewComponentText('');
        setNewComponentAffiliation('');
        manualUpdateOnSuccess();
      
    };

    const handleDeleteItem = async (itemIdToDelete: string, itemTypeToDelete: 'page_component' | 'set') => {
        await deleteItemMutation.mutateAsync({ 
            itemId: itemIdToDelete, 
            itemType: itemTypeToDelete, 
            pagePath: pagePath 
        });

        const listFilter = (list: SortableListItem[]) => list.filter(item => item.id !== itemIdToDelete);
        setDayList(listFilter);
        setNightList(listFilter);

        if (editingItem && editingItem.id === itemIdToDelete) {
            closeEditModal();
        }
        manualUpdateOnSuccess();
        
    };

    const handleSaveEdit = async (saveData: any) => {
        if (!editingItem) return;
        
        let updatedItem: SortableListItem | undefined;

        if (editingItem.item_type === 'page_component') {
            const returnedData = await updatePageComponentContentMutation.mutateAsync({ 
                id: editingItem.id, 
                content: saveData.content,
                affiliation: saveData.affiliation,
                pagePath
            });
            const finalData = { ...editingItem, ...returnedData, content: saveData.content, affiliation: saveData.affiliation };
            updatedItem = {
                ...finalData,
                item_type: 'page_component',
                display_order: finalData.display_order ?? editingItem.display_order ?? 0
            };
        } else if (editingItem.item_type === 'set') {
            const returnedData = await updateSetContentMutation.mutateAsync({ 
                id: editingItem.id, 
                updates: saveData,
                pagePath
            });
            const finalData = { ...editingItem, ...returnedData, ...saveData };
            updatedItem = {
                ...finalData,
                item_type: 'set',
                display_order: finalData.display_order ?? editingItem.display_order ?? 0
            };
        }

        if (updatedItem) {
            const itemToUpdate = updatedItem as SortableListItem;
            const oldAffiliation = editingItem.item_type === 'page_component' ? editingItem.affiliation : editingItem.type?.toUpperCase();
            const newAffiliation = 'affiliation' in itemToUpdate ? itemToUpdate.affiliation : ('type' in itemToUpdate && itemToUpdate.type ? itemToUpdate.type.toUpperCase() : undefined);

            const wasDay = oldAffiliation === 'DAY' || oldAffiliation === 'WHITE';
            const isDay = newAffiliation === 'DAY' || newAffiliation === 'WHITE';

            if (wasDay !== isDay) {
                if (wasDay) setDayList(prev => prev.filter(item => item.id !== itemToUpdate.id));
                else setNightList(prev => prev.filter(item => item.id !== itemToUpdate.id));

                if (isDay) setDayList(prev => [...prev, itemToUpdate]);
                else setNightList(prev => [...prev, itemToUpdate]);
            } else {
                const listUpdater = (list: SortableListItem[]) => list.map(item => item.id === itemToUpdate.id ? itemToUpdate : item);
                if (isDay) setDayList(listUpdater);
                else setNightList(listUpdater);
            }
        }
        
        closeEditModal();
        manualUpdateOnSuccess();
    };

    const openEditModal = (item: SortableListItem) => {
        setEditingItem(item); 
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingItem(null);
    };

    const calculatedLoading = (isLayoutLoading && dayList.length === 0 && nightList.length === 0) || createPageComponentMutation.isPending || updateLayoutOrderMutation.isPending || deleteItemMutation.isPending || updatePageComponentContentMutation.isPending || updateSetContentMutation.isPending;
    const isSectionContentLoading = isLayoutLoading || isProcessingLayout;
    
    return {
        dayList,
        nightList,
        staticSections,
        loading: calculatedLoading,
        isSectionContentLoading,
        error: layoutError,
        handleCreateComponent,
        newComponentTitle, setNewComponentTitle,
        newComponentText, setNewComponentText,
        newComponentAffiliation, setNewComponentAffiliation,
        handleDragEnd,
        openEditModal,
        closeEditModal,
        editingItem, setEditingItem,
        isEditModalOpen,
        handleSaveEdit,
        handleDeleteItem,
        renderKey,
        isCreatingComponent: createPageComponentMutation.isPending,
        isUpdatingLayout: updateLayoutOrderMutation.isPending,
        isDeletingItem: deleteItemMutation.isPending,
        isUpdatingContent: updatePageComponentContentMutation.isPending || updateSetContentMutation.isPending,
        refetchLayout
    };
} 