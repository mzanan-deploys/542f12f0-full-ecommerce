'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountrySelector } from '@/components/ui/country-select';
import { toast } from 'sonner';

interface CountryShippingPrice {
  id?: number;
  country_code: string;
  country_name: string | null;
  shipping_price: number;
  min_delivery_days?: number | null;
  max_delivery_days?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface ShippingPriceFormProps {
    currentData?: CountryShippingPrice;
    formAction: (formData: FormData) => Promise<{success: boolean, message: string}>;
    formKey: string; 
    onActionComplete: () => void; 
    onCancel: () => void;
}

export function ShippingPriceForm({ currentData, formAction, formKey, onActionComplete, onCancel }: ShippingPriceFormProps) {
    const [selectedCountry, setSelectedCountry] = React.useState<{ code: string; name: string } | undefined>();
    const [shippingPrice, setShippingPrice] = React.useState<string>('');
    const [minDeliveryDays, setMinDeliveryDays] = React.useState<string>('');
    const [maxDeliveryDays, setMaxDeliveryDays] = React.useState<string>('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (currentData) {
            setSelectedCountry({ code: currentData.country_code, name: currentData.country_name || '' });
            setShippingPrice(currentData.shipping_price.toString());
            setMinDeliveryDays(currentData.min_delivery_days?.toString() || '');
            setMaxDeliveryDays(currentData.max_delivery_days?.toString() || '');
        } else {
            setSelectedCountry(undefined);
            setShippingPrice('');
            setMinDeliveryDays('');
            setMaxDeliveryDays('');
        }
    }, [currentData, formKey]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        if (!selectedCountry?.code) {
            toast.error("Please select a country.");
            setIsSubmitting(false);
            return;
        }
        if (!shippingPrice || parseFloat(shippingPrice) <= 0) {
            toast.error("Please enter a valid shipping price greater than zero.");
            setIsSubmitting(false);
            return;
        }

        const minDays = parseInt(minDeliveryDays) || 0;
        const maxDays = parseInt(maxDeliveryDays) || 0;
        
        if (minDays < 0 || maxDays < 0) {
            toast.error("Delivery days must be positive numbers.");
            setIsSubmitting(false);
            return;
        }
        
        if (minDays > 0 && maxDays > 0 && minDays > maxDays) {
            toast.error("Minimum delivery days cannot be greater than maximum delivery days.");
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData(event.currentTarget);
        formData.set('country_code', selectedCountry.code);
        if (selectedCountry.name) formData.set('country_name', selectedCountry.name);
        else formData.delete('country_name');
        
        formData.set('min_delivery_days', minDeliveryDays || '0');
        formData.set('max_delivery_days', maxDeliveryDays || '0');
        
        if(currentData?.id) formData.set('id', currentData.id.toString());
        else formData.delete('id');

        const result = await formAction(formData);
        
        if (result.success) {
            toast.success(result.message);
            onActionComplete(); 
        } else {
            toast.error(result.message || "An unexpected error occurred.");
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} key={formKey} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <label htmlFor="country_selector" className="block text-sm font-medium mb-1">Country</label>
                    <CountrySelector 
                        value={selectedCountry?.code}
                        onChange={(country) => setSelectedCountry(country)}
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <label htmlFor="shipping_price" className="block text-sm font-medium mb-1">Shipping Price</label>
                    <Input 
                        type="number" 
                        name="shipping_price"
                        id="shipping_price" 
                        placeholder="9.99" 
                        step="0.01" 
                        required 
                        value={shippingPrice}
                        onChange={(e) => setShippingPrice(e.target.value)}
                        disabled={isSubmitting}
                        className="mt-1 block w-full"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="min_delivery_days" className="block text-sm font-medium mb-1">Min. Delivery Days</label>
                    <Input 
                        type="number" 
                        name="min_delivery_days"
                        id="min_delivery_days" 
                        placeholder="3" 
                        min="0"
                        value={minDeliveryDays}
                        onChange={(e) => setMinDeliveryDays(e.target.value)}
                        disabled={isSubmitting}
                        className="mt-1 block w-full"
                    />
                </div>
                <div>
                    <label htmlFor="max_delivery_days" className="block text-sm font-medium mb-1">Max. Delivery Days</label>
                    <Input 
                        type="number" 
                        name="max_delivery_days"
                        id="max_delivery_days" 
                        placeholder="5" 
                        min="0"
                        value={maxDeliveryDays}
                        onChange={(e) => setMaxDeliveryDays(e.target.value)}
                        disabled={isSubmitting}
                        className="mt-1 block w-full"
                    />
                </div>
            </div>
            
            <div className="flex justify-end space-x-2">
                 <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button> 
                <Button type="submit" disabled={isSubmitting || !selectedCountry || !shippingPrice}>
                    {isSubmitting ? (currentData ? "Saving..." : "Adding...") : (currentData ? "Save Changes" : "Add Price")}
                </Button>
            </div>
        </form>
    );
} 