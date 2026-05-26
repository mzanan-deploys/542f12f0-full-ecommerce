import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FormControl, FormDescription } from "@/components/ui/form";
import { CardElement } from '@stripe/react-stripe-js';
import type { PaymentViewProps } from '@/types/checkout';

export const PaymentView: React.FC<PaymentViewProps> = ({ 
    setCurrentStep,
    cardElementOptions,
    paymentError,
    validationWarning,
    isProcessingPayment,
    onProcessPayment,
    isPlaceOrderDisabled,
    isWaitingForShipping
}) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
            
            {validationWarning && (
                <div className="p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Notice:</strong> {validationWarning}
                    </p>
                </div>
            )}
            
            {isWaitingForShipping && (
                <div className="p-3 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <strong>Calculating shipping costs...</strong> Please wait while we determine shipping for your country.
                    </p>
                </div>
            )}
            
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mt-6">
                <p className="text-yellow-800 text-sm font-medium text-center">
                    Payments are in demo mode using Stripe, so no real charges will be made.
                </p>
                <p className="text-yellow-800 text-sm font-medium text-center">
                    Use card number <span className="font-bold">4242 4242 4242 4242</span> with any CVC and a valid expiration date.
                </p>
            </div>

            <div className="p-4 border rounded-md bg-white dark:bg-neutral-800 shadow-sm">
                <FormControl>
                  <CardElement options={cardElementOptions} />
                </FormControl>
            </div>

            <FormDescription className="text-xs text-muted-foreground -mt-4">
              We do not store your credit card details. Payments are securely processed by Stripe.
            </FormDescription>

            {paymentError && (
                <div className="space-y-2">
                    <p className="text-sm text-red-600">{paymentError}</p>
                </div>
            )}

            <div className="flex justify-between items-center mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(2)} disabled={isProcessingPayment}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Confirmation
                </Button>
                <Button 
                    onClick={onProcessPayment} 
                    disabled={isPlaceOrderDisabled || isProcessingPayment}
                    className="w-auto"
                >
                    {isProcessingPayment ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : isWaitingForShipping ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating Shipping...</>
                    ) : (
                        'Place Order & Pay'
                    )}
                </Button>
            </div>
        </div>
    );
}; 