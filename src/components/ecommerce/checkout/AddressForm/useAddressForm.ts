import { useState } from 'react';
import type { AddressFormValues } from '@/types/checkout';
import type { UseFormTrigger, UseFormGetValues } from 'react-hook-form';

interface UseAddressFormProps {
  trigger: UseFormTrigger<AddressFormValues>;
  getValues: UseFormGetValues<AddressFormValues>;
  onProcessPayment: (data: AddressFormValues) => Promise<void>;
}

export function useAddressForm({ trigger, getValues, onProcessPayment }: UseAddressFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formDataForConfirmation, setFormDataForConfirmation] = useState<AddressFormValues | null>(null);

  const handleNextToConfirmation = async () => {
    const isValid = await trigger([
      'name', 'address1', 'country', 'city', 
      'state', 'postalCode', 'email'
    ]);
    
    if (isValid) {
      const formData = getValues() as AddressFormValues;
      setFormDataForConfirmation(formData);
      setCurrentStep(2);
    }
  };

  const handlePaymentSubmission = async (data: AddressFormValues) => {
    await onProcessPayment(data);
  };

  return {
    currentStep,
    setCurrentStep,
    formDataForConfirmation,
    setFormDataForConfirmation,
    handleNextToConfirmation,
    handlePaymentSubmission
  };
} 