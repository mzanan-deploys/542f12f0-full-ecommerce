'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';

export function SyncOrdersButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2"
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {pending ? 'Syncing...' : 'Sync Orders'}
    </Button>
  );
} 