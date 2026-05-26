import React, { useState, useEffect, useCallback } from 'react';
import type { UseFormWatch, UseFormSetValue, FieldValues, Path } from 'react-hook-form';
import slugify from 'slugify';

interface UseAutoSlugProps<T extends FieldValues> {
    watch: UseFormWatch<T>;
    setValue: UseFormSetValue<T>;
    nameFieldName: Path<T>; 
    slugFieldName: Path<T>;
    initialSlug?: string | null;
}

export function useAutoSlug<T extends FieldValues>({
    watch,
    setValue,
    nameFieldName,
    slugFieldName,
    initialSlug
}: UseAutoSlugProps<T>) {
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialSlug);
    const nameValue = watch(nameFieldName);

    useEffect(() => {
        if (!slugManuallyEdited && nameValue && typeof nameValue === 'string') {
            const generatedSlug = slugify(nameValue, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
            setValue(slugFieldName, generatedSlug as any, { shouldValidate: true });
        }
    }, [nameValue, slugManuallyEdited, setValue, slugFieldName]);

    const handleSlugChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSlugManuallyEdited(true); 
        setValue(slugFieldName, event.target.value as any, { shouldValidate: true }); 
    }, [setValue, slugFieldName]);

    return { handleSlugChange };
} 