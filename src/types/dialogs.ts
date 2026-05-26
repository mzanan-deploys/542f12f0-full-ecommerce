
export interface DeleteConfirmationDialogProps {
    productId: string;
    productName: string;
    onConfirm: () => void;
    onClose: () => void;
}

export interface UseDeleteConfirmationDialogProps {
    productId: string;
    productName: string;
    onSuccess?: () => void; 
    onClose?: () => void;  
}

export interface UseDeleteConfirmationDialogReturn {
    isDeleting: boolean;
    handleDeleteConfirm: () => Promise<void>;
}
