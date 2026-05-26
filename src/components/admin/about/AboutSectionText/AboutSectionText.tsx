'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { type UseFormRegister, type FieldErrors, type Control } from 'react-hook-form';
import { type AboutFormData } from '@/lib/schemas/aboutSchema';

interface AboutSectionTextProps {
  register: UseFormRegister<AboutFormData>;
  errors: FieldErrors<AboutFormData>;
  isPending: boolean;
  control?: Control<AboutFormData>;
}

export function AboutSectionText({ register, errors, isPending }: AboutSectionTextProps) {
  return (
    <div>
      <Textarea
        id="aboutTextContentForm"
        rows={8}
        {...register('text_content')}
        className="w-full bg-background"
        placeholder="Write the content for the About Us section..."
        disabled={isPending}
      />
      {errors.text_content && (
        <p className="text-sm font-medium text-destructive mt-1">
          {errors.text_content.message?.toString()}
        </p>
      )}
    </div>
  );
} 