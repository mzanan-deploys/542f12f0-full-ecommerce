import { z } from 'zod';
import { State, City } from 'country-state-city';

export const addressSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: "Invalid email address." }),
    country: z.string().length(2, { message: 'Please select a country.' }),
    address1: z.string().min(5, { message: 'Address Line 1 must be at least 5 characters.' }),
    address2: z.string().optional(),
    city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
    state: z.string().optional(),
    postalCode: z.string()
                 .min(3, { message: 'Postal code must be at least 3 characters.' })
                 .max(10, { message: 'Postal code cannot exceed 10 characters.' }),
    phone: z.string().optional(),
    phoneCountryCode: z.string().optional(),
}).superRefine((data, ctx) => {
    if (!data.country || data.country.length !== 2) {
        return;
    }

    const countryCode = data.country;

    const statesOfCountry = State.getStatesOfCountry(countryCode);
    if (statesOfCountry && statesOfCountry.length > 0) {
        const validStateValues = statesOfCountry.map(s => s.isoCode || s.name);
        if (!data.state || data.state.trim().length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'State / Province is required for the selected country.',
                path: ['state'],
            });
        } else if (!validStateValues.includes(data.state)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid State / Province selected for the country.',
                path: ['state'],
            });
        }
    } else {
        if (data.state && data.state.trim().length > 0 && data.state.trim().length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'State / Province must be at least 2 characters if provided.',
                path: ['state'],
            });
        }
    }

    let citiesForValidation: string[] = [];
    const selectedStateData = data.state && statesOfCountry?.length > 0 
        ? statesOfCountry.find(s => s.isoCode === data.state || s.name === data.state)
        : undefined;

    if (selectedStateData && selectedStateData.isoCode) {
        citiesForValidation = City.getCitiesOfState(countryCode, selectedStateData.isoCode).map(c => c.name);
    }
    if (citiesForValidation.length === 0 && countryCode) {
        citiesForValidation = City.getCitiesOfCountry(countryCode)?.map(c => c.name) || [];
    }

    if (data.city && data.city.trim().length > 0 && citiesForValidation.length > 50) {
        const cityExists = citiesForValidation.some(cityName => 
            cityName.toLowerCase().trim() === data.city.trim().toLowerCase()
        );
        if (!cityExists) {
            const partialMatch = citiesForValidation.some(cityName => 
                cityName.toLowerCase().includes(data.city.trim().toLowerCase()) ||
                data.city.trim().toLowerCase().includes(cityName.toLowerCase())
            );
            if (!partialMatch) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: selectedStateData 
                        ? 'City not found in the selected state/province.' 
                        : 'City not found in the selected country.',
                    path: ['city'],
                });
            }
        }
    }
});
