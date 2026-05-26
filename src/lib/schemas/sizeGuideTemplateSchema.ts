import { z } from 'zod';

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject extends Record<string, JsonValue> {}
export interface JsonArray extends Array<JsonValue> {}

const guideDataFormSchema = z.object({
  headers: z.array(z.object({ value: z.string().min(1, 'Header cannot be empty') })).min(1, 'At least one header is required'),
  rows: z.array(z.array(z.string())).min(1, 'At least one row is required'),
});

const guideDataStorageSchema = z.object({
  headers: z.array(z.string().min(1, 'Header cannot be empty')).min(1, 'At least one header is required'),
  rows: z.array(z.array(z.string())).min(1, 'At least one row is required'),
});

export const sizeGuideTemplateFormSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  guide_data: guideDataFormSchema,
});

export const sizeGuideTemplateStorageSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  guide_data: guideDataStorageSchema,
});

export type SizeGuideTemplateFormData = z.infer<typeof sizeGuideTemplateFormSchema>;

export type SizeGuideTemplate = {
  id: string;
  name: string;
  guide_data: unknown;
  created_at: string | Date | null;
  updated_at: string | Date | null;
};
