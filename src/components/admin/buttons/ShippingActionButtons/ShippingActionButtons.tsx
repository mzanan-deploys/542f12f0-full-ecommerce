'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Check, CheckCircle2, Loader2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { StatusConfirmationDialog } from '@/components/shared/StatusConfirmationDialog/StatusConfirmationDialog';
import type { ActionResponse } from '@/types/actions';

interface ShippingActionButtonsProps {
  orderId: string;
  currentShippingStatus: 'pending' | 'in_transit' | 'delivered';
  currentPage: number;
  action: (formData: FormData) => Promise<ActionResponse>;
}

export function ShippingActionButtons({
  orderId,
  currentShippingStatus,
  currentPage,
  action,
}: ShippingActionButtonsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const executeAction = useCallback(
    async (newStatus: 'in_transit' | 'delivered') => {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.set('orderId', orderId);
      formData.set('currentStatus', currentShippingStatus);
      formData.set('currentPage', currentPage.toString());
      formData.set('newStatus', newStatus);

      try {
        const result = await action(formData);

        if (result.success) {
          toast.success(result.message || 'Status updated successfully!');
          router.refresh();
        } else {
          toast.error(result.error || 'An error occurred');
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Error in shipping action:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [orderId, currentShippingStatus, currentPage, action, router],
  );

  const handleMarkInTransit = useCallback(async () => {
    await executeAction('in_transit');
  }, [executeAction]);

  const handleMarkDelivered = useCallback(async () => {
    await executeAction('delivered');
  }, [executeAction]);

  return (
    <div className="space-x-2">
      {currentShippingStatus === 'pending' && (
        <StatusConfirmationDialog
          title="Mark Order In Transit"
          description="This will mark the order as in transit and send a notification email to the customer. This action cannot be undone."
          confirmText="Mark In Transit"
          onConfirm={handleMarkInTransit}
          isPending={isSubmitting}
          trigger={
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              className="w-36"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending email...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Mark In Transit
                </>
              )}
            </Button>
          }
        />
      )}
      
      {currentShippingStatus === 'in_transit' && (
        <StatusConfirmationDialog
          title="Mark Order Delivered"
          description="This will mark the order as delivered and send a confirmation email to the customer. This action cannot be undone."
          confirmText="Mark Delivered"
          onConfirm={handleMarkDelivered}
          isPending={isSubmitting}
          trigger={
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              className="w-36"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending email...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Delivered
                </>
              )}
            </Button>
          }
        />
      )}
      
      {currentShippingStatus === 'delivered' && (
        <div className="w-36 h-9 px-3 py-2 bg-green-400/50 text-black dark:text-white font-medium rounded-md border flex items-center text-sm">
          <Check className="mr-2 h-4 w-4 text-black dark:text-white" />
          Completed
        </div>
      )}
    </div>
  );
}

export default ShippingActionButtons; 