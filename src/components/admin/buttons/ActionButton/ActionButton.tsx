'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
  isDirty?: boolean;
  isValid?: boolean;
  hasRequiredImages?: boolean;
  loadingText?: string;
}

export const ActionButton = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps
>((
  { 
    isLoading = false, 
    isDirty,
    isValid,
    hasRequiredImages = true,
    loadingText = 'Loading...', 
    children,
    ...props 
  },
  ref
) => {
  const isDisabled = props.disabled || isLoading || !isDirty || !isValid || !hasRequiredImages;

  return (
    <Button ref={ref} disabled={isDisabled} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
});

ActionButton.displayName = 'ActionButton'; 