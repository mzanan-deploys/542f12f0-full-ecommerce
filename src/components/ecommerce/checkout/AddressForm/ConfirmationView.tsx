import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ConfirmationViewProps } from '@/types/checkout';
import { getData as getCoreCountryData } from 'country-list';
import { State } from 'country-state-city';

const baseCountries = getCoreCountryData().map(country => ({
    value: country.code,
    label: country.name,
}));

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({ data, setCurrentStep }) => {
    const countryName = baseCountries.find(c => c.value === data.country)?.label || data.country;
    let stateName = data.state || 'N/A';
    if (data.country && data.state) {
        const statesOfCountry = State.getStatesOfCountry(data.country);
        const foundState = statesOfCountry.find(s => s.isoCode === data.state || s.name === data.state);
        if (foundState) stateName = foundState.name;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Confirm Your Details</h2>
            <div className="space-y-2 p-4 border rounded-md shadow-sm">
                <p><strong>Full Name:</strong> {data.name}</p>
                <p><strong>Address Line 1:</strong> {data.address1}</p>
                {data.address2 && <p><strong>Address Line 2:</strong> {data.address2}</p>}
                <p><strong>Country:</strong> {countryName}</p>
                <p><strong>City:</strong> {data.city}</p>
                <p><strong>State/Province:</strong> {stateName}</p>
                <p><strong>Postal Code:</strong> {data.postalCode}</p>
                {data.phone && <p><strong>Phone:</strong> {data.phone}</p>}
                <p><strong>Email:</strong> {data.email}</p>
            </div>
            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                    Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}; 