'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { 
  submittingText?: string;
}

export function SubmitButton({ 
    children, 
    submittingText = "Saving...", 
    className,
    ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button 
        type="submit" 
        disabled={pending} 
        className={cn(className)} 
        {...props} 
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          {submittingText}
        </>
      ) : (
        children 
      )}
    </Button>
  );
} 