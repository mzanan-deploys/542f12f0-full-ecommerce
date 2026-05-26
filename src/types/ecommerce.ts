import React from 'react';
import { UseFormReturn } from 'react-hook-form';

export interface UseSetFormReturn extends UseFormReturn<any> {
    state: any;
    isPending: boolean;
    displayImages: any[];
    imageIds: string[];
    deleteImageIds: string[];
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    sensors: any;
    maxImages: number;
    handleDragEnd: (event: any) => void;
    onSubmit: (data: any) => void;
    handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleMarkDelete: (id: string) => void;
    handleRemoveStaged: (id: string) => void;
    handleSlugChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ScrollAnimationConfig {
    gradientAngle: number;
    contentOpacityScrollRange: [number, number, number];
}

export interface UseHomeProps { 
    initialSets: any[] | null;
    containerDimensions?: { width: number; height: number };
    splitScreenRef: React.RefObject<HTMLElement | null>;
}

export interface UseCheckoutProps {
    initialOrderData?: any;
}

export interface UseCartProps {
    initialCartItems?: any[];
}

 