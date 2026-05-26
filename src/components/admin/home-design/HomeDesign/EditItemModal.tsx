'use client';

import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter, 
    DialogClose, 
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { SortableListItem, PageComponentContent, PageComponent } from '@/types/db'; 
import type { SetType, SetLayoutType } from '@/lib/schemas/setSchema';

interface EditItemModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    itemToEdit: SortableListItem | null;
    onSave: (updatedData: any) => Promise<void>;
    isSaving: boolean;
}

export function EditItemModal({ 
    isOpen, 
    onOpenChange, 
    itemToEdit, 
    onSave, 
    isSaving 
}: EditItemModalProps) {
    
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (itemToEdit) {
            if (itemToEdit.item_type === 'page_component') {
                const component = itemToEdit as PageComponent;
                const content = component.content as PageComponentContent;
                setFormData({
                    title: content?.title || '',
                    text: content?.text || '',
                    affiliation: component.affiliation || 'DAY'
                });
            } else if (itemToEdit.item_type === 'set') {
                const set = itemToEdit;
                 setFormData({
                    name: set.name || '',
                    description: set.description || '',
                    type: set.type || 'DAY',
                    layout_type: set.layout_type || 'SINGLE_COLUMN',
                 });
            } else {
                setFormData({});
            }
        } else {
             setFormData({});
        }
    }, [itemToEdit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        if (!itemToEdit) return;

        let saveData = {};
        if (itemToEdit.item_type === 'page_component') {
             saveData = {
                 affiliation: formData.affiliation,
                 content: {
                     title: formData.title || undefined,
                     text: formData.text || undefined,
                 }
             };
        } else if (itemToEdit.item_type === 'set') {
             saveData = {
                 name: formData.name,
                 description: formData.description,
                 type: formData.type,
                 layout_type: formData.layout_type,
             };
        }
        if (itemToEdit.item_type === 'page_component' || itemToEdit.item_type === 'set') {
          await onSave(saveData);
        }
    };

    const renderFormComponent = () => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} className="col-span-3" placeholder="Optional title" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="text" className="text-right">Text</Label>
                <Textarea id="text" name="text" value={formData.text || ''} onChange={handleInputChange} className="col-span-3" placeholder="Main text content" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="affiliation" className="text-right">Section</Label>
                 <Select 
                    value={formData.affiliation || 'DAY'} 
                    onValueChange={(value) => handleSelectChange('affiliation', value as 'DAY' | 'NIGHT')}
                 >
                     <SelectTrigger id="affiliation" className="col-span-3 w-full">
                         <SelectValue placeholder="Assign to section" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="DAY">Day</SelectItem>
                         <SelectItem value="NIGHT">Night</SelectItem>
                     </SelectContent>
                 </Select>
            </div>
        </div>
    );

    const renderFormSet = () => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                 <Select
                     value={formData.type || 'DAY'}
                     onValueChange={(value) => handleSelectChange('type', value as SetType)}
                 >
                     <SelectTrigger id="type" className="col-span-3">
                         <SelectValue placeholder="Select type" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="DAY">Day</SelectItem>
                         <SelectItem value="NIGHT">Night</SelectItem>
                     </SelectContent>
                 </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="layout_type" className="text-right">Layout</Label>
                 <Select
                     value={formData.layout_type || 'SINGLE_COLUMN'}
                     onValueChange={(value) => handleSelectChange('layout_type', value as SetLayoutType)}
                 >
                     <SelectTrigger id="layout_type" className="col-span-3">
                         <SelectValue placeholder="Select layout" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="SINGLE_COLUMN">Single Column</SelectItem>
                         <SelectItem value="SPLIT_SMALL_LEFT">Split Small Left</SelectItem>
                         <SelectItem value="SPLIT_SMALL_RIGHT">Split Small Right</SelectItem>
                         <SelectItem value="STAGGERED_THREE">Staggered Three</SelectItem>
                         <SelectItem value="TWO_HORIZONTAL">Two Horizontal</SelectItem>
                     </SelectContent>
                 </Select>
            </div>
        </div>
    );

    const currentItemType = itemToEdit?.item_type;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit {currentItemType?.replace('_', ' ') || 'Item'}</DialogTitle>
                    <DialogDescription>
                        Make changes to the selected item here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                {
                    currentItemType === 'page_component' ? renderFormComponent() :
                    currentItemType === 'set' ? renderFormSet() :
                    <p>Cannot edit this item type.</p>
                }
                <DialogFooter>
                    <DialogClose asChild>
                         <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSaveChanges} disabled={isSaving || !(currentItemType === 'page_component' || currentItemType === 'set')}>
                         {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 