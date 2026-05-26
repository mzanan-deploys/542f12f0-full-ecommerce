import React, { useState } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Country } from 'country-state-city';
import type { AddressFormValues } from '@/types/checkout';

interface CountrySelectProps {
    control: Control<AddressFormValues>;
    setValue: UseFormSetValue<AddressFormValues>;
}

export function CountrySelect({ control, setValue }: CountrySelectProps) {
    const [openCountryPopover, setOpenCountryPopover] = useState(false);
    
    const watchedCountry = useWatch({ control, name: 'country' });
    
    const countries = React.useMemo(() => 
        Country.getAllCountries().map((country, index) => ({
        value: country.isoCode,
        label: country.name,
        uniqueKey: `${country.isoCode}-${index}`
        })), []
    );

    const handleCountrySelect = (value: string) => {
        setValue('country', value);
        setValue('state', '');
        setValue('city', '');
        setOpenCountryPopover(false);
    };

    const selectedCountryLabel = countries.find(c => c.value === watchedCountry)?.label || 'Select country';

    return (
        <FormField
            control={control}
            name="country"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Country *</FormLabel>
                    <Popover open={openCountryPopover} onOpenChange={setOpenCountryPopover}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "justify-between text-sm",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {selectedCountryLabel}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                            <Command>
                                <CommandInput placeholder="Search countries..." className="text-sm" />
                                <CommandList>
                                    <CommandEmpty className="text-sm">No country found.</CommandEmpty>
                                    <CommandGroup>
                                        {countries.map((country) => (
                                            <CommandItem
                                                value={country.label}
                                                key={country.uniqueKey}
                                                onSelect={() => handleCountrySelect(country.value)}
                                                className="text-sm"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        country.value === field.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {country.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
} 