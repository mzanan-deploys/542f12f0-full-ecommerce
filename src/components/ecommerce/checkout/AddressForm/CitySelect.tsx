import React, { useState, useEffect } from 'react';
import { useWatch, Control, UseFormSetValue } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { City, type ICity } from 'country-state-city';
import type { AddressFormValues } from '@/types/checkout';

interface CitySelectProps {
  control: Control<AddressFormValues>;
  setValue: UseFormSetValue<AddressFormValues>;
}

export const CitySelect: React.FC<CitySelectProps> = ({ control, setValue }) => {
    const [openCityPopover, setOpenCityPopover] = useState(false);
    const [citiesOfSelectedState, setCitiesOfSelectedState] = useState<Array<{ value: string, label: string, uniqueKey: string }>>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    
    const watchedCountry = useWatch({ control, name: 'country' });
    const watchedState = useWatch({ control, name: 'state' });

    useEffect(() => {
        if (!watchedCountry) {
        setCitiesOfSelectedState([]);
            setValue('city', '');
        setIsLoadingCities(false);
        }
    }, [watchedCountry, setValue]);
        
    useEffect(() => {
        if (watchedCountry) {
            setIsLoadingCities(true);
            let cities: ICity[] = [];
            
            if (watchedState) {
                cities = City.getCitiesOfState(watchedCountry, watchedState);
            } else {
                cities = City.getCitiesOfCountry(watchedCountry) || [];
            }
            
            const uniqueCityNames = Array.from(new Set(cities.map((city: ICity) => city.name)));
            const cityOptions = uniqueCityNames.map((cityName: string, index: number) => ({ 
                value: cityName, 
                label: cityName,
                uniqueKey: `${cityName}-${index}`
            }));
            
            setCitiesOfSelectedState(cityOptions);
            setIsLoadingCities(false);
        }
    }, [watchedState, watchedCountry]);

    const handleCitySelect = (value: string) => {
        setValue('city', value);
        setOpenCityPopover(false);
    };

    return (
        <FormField
            control={control}
            name="city"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>City *</FormLabel>
                    {citiesOfSelectedState.length > 0 ? (
                        <Popover open={openCityPopover} onOpenChange={setOpenCityPopover}>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "justify-between text-sm",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        disabled={isLoadingCities}
                                    >
                                        {isLoadingCities ? "Loading cities..." : (field.value || "Select city")}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                                <Command>
                                    <CommandInput placeholder="Search cities..." className="text-sm" />
                                    <CommandList>
                                        <CommandEmpty className="text-sm">No city found.</CommandEmpty>
                                        <CommandGroup>
                                            {citiesOfSelectedState.map((city) => (
                                                <CommandItem
                                                    value={city.label}
                                                key={city.uniqueKey}
                                                    onSelect={() => handleCitySelect(city.value)}
                                                className="text-sm"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            city.value === field.value ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {city.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <FormControl>
                            <Input 
                                placeholder="Enter your city" 
                                {...field} 
                                value={field.value || ''} 
                                                className="text-sm"
                            />
                        </FormControl>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}; 