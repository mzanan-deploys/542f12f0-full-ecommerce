import type { ZodSchema } from 'zod';

export const extractDefaultValueFromSchema = (schema: ZodSchema, fieldName: string): any => {
    if (!(schema instanceof Object) || !('shape' in schema)) return undefined;
    const shape = (schema as any).shape;
    const field = shape[fieldName];
    if (!field || !field._def) return undefined;
    return field._def.defaultValue?.() ?? field._def.defaultValue;
};

export const buildFormDefaultValues = <T>(schema: ZodSchema, initialData?: any, isUpdate = false): T => {
    if (isUpdate && initialData) {
        const typeDefault = extractDefaultValueFromSchema(schema, 'type');
        const layoutTypeDefault = extractDefaultValueFromSchema(schema, 'layout_type');
        const isActiveDefault = extractDefaultValueFromSchema(schema, 'is_active') ?? true;

        return {
            ...(initialData as any),
            type: initialData.type ?? typeDefault,
            layout_type: initialData.layout_type ?? layoutTypeDefault,
            is_active: initialData.is_active ?? isActiveDefault,
            images: initialData.images ?? [],
        } as T;
    } else {
        const typeDefault = extractDefaultValueFromSchema(schema, 'type');
        const layoutTypeDefault = extractDefaultValueFromSchema(schema, 'layout_type');
        const isActiveDefault = extractDefaultValueFromSchema(schema, 'is_active') ?? true;
        const nameDefault = extractDefaultValueFromSchema(schema, 'name') ?? '';
        const imagesDefault = extractDefaultValueFromSchema(schema, 'images') ?? [];
        const descriptionDefault = extractDefaultValueFromSchema(schema, 'description') ?? '';

        return {
            name: nameDefault,
            slug: undefined,
            images: imagesDefault,
            type: typeDefault,
            layout_type: layoutTypeDefault,
            is_active: isActiveDefault,
            description: descriptionDefault,
        } as T;
    }
};

export const generateTempId = (): string => {
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const createRenamedFile = (file: File, tempId: string): File => {
    return new File([file], `${tempId}___${file.name}`, { type: file.type });
};

export const extractImageFilesFromFormData = (formData: FormData, fieldName: string = 'images'): File[] => {
    return formData.getAll(fieldName).filter(f => f instanceof File && f.size > 0) as File[];
}; 