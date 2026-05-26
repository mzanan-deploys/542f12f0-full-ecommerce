'use client'

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { AddressFormValues } from '@/types/checkout';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { ArrowRight } from "lucide-react"
import { useAddressForm } from './useAddressForm';
import { ConfirmationView } from './ConfirmationView';
import { PaymentView } from './PaymentView';
import { CountrySelect } from './CountrySelect';
import { StateSelect } from './StateSelect';
import { CitySelect } from './CitySelect';
import { PhoneCodeSelect } from './PhoneCodeSelect';

interface AddressFormProps {
    cardElementOptions: any;
    paymentError: string | null;
    validationWarning?: string | null;
    isProcessingPayment: boolean;
    onProcessPayment: (data: AddressFormValues) => Promise<void>;
    isPlaceOrderDisabled: boolean;
    isWaitingForShipping?: boolean;
}

export function AddressForm({
    cardElementOptions,
    paymentError,
    validationWarning,
    isProcessingPayment,
    onProcessPayment,
    isPlaceOrderDisabled,
    isWaitingForShipping
}: AddressFormProps) {
    const { control, setValue, trigger, getValues } = useFormContext<AddressFormValues>();
    
    const {
        currentStep,
        setCurrentStep,
        formDataForConfirmation,
        handleNextToConfirmation,
        handlePaymentSubmission
    } = useAddressForm({ 
        trigger, 
        getValues, 
        onProcessPayment 
    });

    if (currentStep === 2 && formDataForConfirmation) {
        return <ConfirmationView data={formDataForConfirmation} setCurrentStep={setCurrentStep} />;
    }

    if (currentStep === 3) {
        return (
            <PaymentView
                setCurrentStep={setCurrentStep}
                cardElementOptions={cardElementOptions}
                paymentError={paymentError}
                validationWarning={validationWarning}
                isProcessingPayment={isProcessingPayment}
                onProcessPayment={formDataForConfirmation ? () => handlePaymentSubmission(formDataForConfirmation) : () => {}}
                isPlaceOrderDisabled={isPlaceOrderDisabled}
                isWaitingForShipping={isWaitingForShipping}
            />
        );
    }

    return (
        <div className="w-full space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
            
            <div className="grid grid-cols-1 gap-4">
                <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your full name" {...field} value={field.value || ''} className="text-sm" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="address1"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address Line 1 *</FormLabel>
                            <FormControl>
                                <Input placeholder="Street address" {...field} value={field.value || ''} className="text-sm" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="address2"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address Line 2 (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Apartment, suite, etc." {...field} value={field.value || ''} className="text-sm" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <CountrySelect control={control} setValue={setValue} />
                <CitySelect control={control} setValue={setValue} />
                <StateSelect control={control} setValue={setValue} />

                <FormField
                    control={control}
                    name="postalCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Postal Code *</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter postal code" {...field} value={field.value || ''} className="text-sm" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-3 gap-2">
                    <PhoneCodeSelect control={control} setValue={setValue} />
                    <FormField
                        control={control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Phone Number (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter phone number" {...field} value={field.value || ''} className="text-sm" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                                <Input 
                                    type="email" 
                                    placeholder="Enter your email address" 
                                    {...field} 
                                    value={field.value || ''} 
                                    className="text-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-end mt-6">
                <Button onClick={handleNextToConfirmation}>
                    Continue to Confirmation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
