import React, { useState, useEffect } from 'react';
import { useWatch, Control, UseFormSetValue } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { State } from 'country-state-city';
import type { AddressFormValues } from '@/types/checkout';

interface StateSelectProps {
  control: Control<AddressFormValues>;
  setValue: UseFormSetValue<AddressFormValues>;
}

export const StateSelect: React.FC<StateSelectProps> = ({ control, setValue }) => {
    const [openStatePopover, setOpenStatePopover] = useState(false);
    const [statesOfSelectedCountry, setStatesOfSelectedCountry] = useState<Array<{ value: string, label: string, uniqueKey: string }>>([]);
    
    const watchedCountry = useWatch({ control, name: 'country' });
    const watchedState = useWatch({ control, name: 'state' });

    useEffect(() => {
        if (watchedCountry) {
            const states = State.getStatesOfCountry(watchedCountry);
            const stateOptions = states.map((state, index) => ({ 
                value: state.isoCode, 
                label: state.name,
                uniqueKey: `${state.isoCode}-${index}` 
            }));
            setStatesOfSelectedCountry(stateOptions);
            if (stateOptions.length === 0) {
                setValue('state', '');
            }
        } else {
            setStatesOfSelectedCountry([]);
        }
    }, [watchedCountry, setValue]);

    const handleStateSelect = (value: string) => {
        setValue('state', value);
        setOpenStatePopover(false);
    };

    const selectedStateLabel = statesOfSelectedCountry.find(s => s.value === watchedState)?.label || 'Select state/province';

    if (statesOfSelectedCountry.length === 0) {
        return null;
    }

    return (
        <FormField
            control={control}
            name="state"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>State/Province *</FormLabel>
                    <Popover open={openStatePopover} onOpenChange={setOpenStatePopover}>
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
                                    {selectedStateLabel}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                            <Command>
                                <CommandInput placeholder="Search states..." className="text-sm" />
                                <CommandList>
                                    <CommandEmpty className="text-sm">No state found.</CommandEmpty>
                                    <CommandGroup>
                                        {statesOfSelectedCountry.map((state) => (
                                            <CommandItem
                                                value={state.label}
                                                key={state.uniqueKey}
                                                onSelect={() => handleStateSelect(state.value)}
                                                className="text-sm"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        state.value === field.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {state.label}
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
}; 