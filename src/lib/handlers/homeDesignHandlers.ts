import React from 'react';
import { SortableListItem } from '@/types/db';
import { toast } from 'sonner';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export interface LayoutUpdateItemArgs {
  item_id: string;
  item_type: 'page_component' | 'set';
  display_order: number;
  page_path: string;
}

export function createDragEndHandler(
  dayList: SortableListItem[],
  nightList: SortableListItem[],
  setDayList: React.Dispatch<React.SetStateAction<SortableListItem[]>>,
  setNightList: React.Dispatch<React.SetStateAction<SortableListItem[]>>,
  pagePath: string,
  updateLayoutOrderMutation: any
) {
  return (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    
    let listChanged = false;
    let updatedListState: SortableListItem[] | undefined = undefined;
    let listType: 'day' | 'night' | undefined;
    
    if (dayList.some(p => p.id === activeId)) {
      listType = 'day';
      setDayList(items => {
        const oldIndex = items.findIndex(item => item.id === activeId);
        const newIndex = items.findIndex(item => item.id === overId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return items;
        listChanged = true;
        updatedListState = arrayMove(items, oldIndex, newIndex);
        return updatedListState;
      });
    } else if (nightList.some(s => s.id === activeId)) {
      listType = 'night';
      setNightList(items => {
        const oldIndex = items.findIndex(item => item.id === activeId);
        const newIndex = items.findIndex(item => item.id === overId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return items;
        listChanged = true;
        updatedListState = arrayMove(items, oldIndex, newIndex);
        return updatedListState;
      });
    }
    
    if(listChanged && updatedListState) {
      const currentDayList = (listType === 'day' && updatedListState) ? updatedListState : dayList;
      const currentNightList = (listType === 'night' && updatedListState) ? updatedListState : nightList;

      const finalLayoutUpdates: LayoutUpdateItemArgs[] = [
        ...currentDayList.map((item, index) => ({ 
          item_id: item.id,
          item_type: item.item_type as 'page_component' | 'set',
          display_order: index, 
          page_path: pagePath 
        })),
        ...currentNightList.map((item, index) => ({ 
          item_id: item.id,
          item_type: item.item_type as 'page_component' | 'set',
          display_order: currentDayList.length + index, 
          page_path: pagePath 
        })),
      ];

      updateLayoutOrderMutation.mutate(finalLayoutUpdates);
    }
  };
}

export function createComponentHandler(
  newComponentTitle: string,
  newComponentText: string,
  newComponentAffiliation: 'DAY' | 'NIGHT' | '' | undefined,
  pagePath: string,
  createPageComponentMutation: any,
  setNewComponentTitle: (value: string) => void,
  setNewComponentText: (value: string) => void,
  setNewComponentAffiliation: (value: 'DAY' | 'NIGHT' | '' | undefined) => void
) {
  return async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newComponentTitle || !newComponentText || !newComponentAffiliation) {
      toast.error('Title, text content, and section affiliation are required.');
      return;
    }

    await createPageComponentMutation.mutateAsync({
      title: newComponentTitle,
      text: newComponentText,
      affiliation: newComponentAffiliation,
      pagePath: pagePath,
      type: 'text',
    });
    setNewComponentTitle('');
    setNewComponentText('');
    setNewComponentAffiliation('');
  };
}

export function createDeleteItemHandler(
  editingItem: SortableListItem | null,
  pagePath: string,
  deleteItemMutation: any,
  setIsEditModalOpen: (value: boolean) => void,
  setEditingItem: (value: SortableListItem | null) => void
) {
  return async (itemIdToDelete: string, itemTypeToDelete: 'page_component' | 'set') => {
    if (!itemIdToDelete || !itemTypeToDelete) {
      toast.error('Item ID or type is missing for deletion.');
      return;
    }

    await deleteItemMutation.mutateAsync({ 
      itemId: itemIdToDelete, 
      itemType: itemTypeToDelete, 
      pagePath: pagePath 
    });
    
    if (editingItem && editingItem.id === itemIdToDelete) {
      setIsEditModalOpen(false);
      setEditingItem(null);
    }
  };
}

export function createSaveEditHandler(
  editingItem: SortableListItem | null,
  updatePageComponentContentMutation: any,
  updateSetContentMutation: any,
  setIsEditModalOpen: (value: boolean) => void,
  setEditingItem: (value: SortableListItem | null) => void,
  pagePath: string
) {
  return async (saveData: any) => {
    if (!editingItem || !saveData) return;

    try {
      if (editingItem.item_type === 'page_component') {
        await updatePageComponentContentMutation.mutateAsync({ 
          id: editingItem.id, 
          content: saveData.content,
          affiliation: saveData.affiliation,
          pagePath: pagePath
        });
      } else if (editingItem.item_type === 'set') {
        await updateSetContentMutation.mutateAsync({ 
          id: editingItem.id, 
          updates: saveData,
          pagePath: pagePath
        });
      }
      
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };
} 