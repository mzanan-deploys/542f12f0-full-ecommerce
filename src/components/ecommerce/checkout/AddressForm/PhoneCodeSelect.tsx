import React, { useState } from 'react';
import { Control, UseFormSetValue } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Country } from 'country-state-city';
import type { AddressFormValues } from '@/types/checkout';

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const phoneCountryCodes = Country.getAllCountries().map(country => {
    const cleanPhoneCode = String(country.phonecode || '').replace(/^\++/, '');
    return {
        value: `+${cleanPhoneCode}`,
        label: `${getFlagEmoji(country.isoCode)} +${cleanPhoneCode}`,
        countryCode: country.isoCode
    };
})
.filter(c => c.value !== '+null' && c.value.length > 1 && c.value !== '+')
.sort((a, b) => a.label.localeCompare(b.label));

interface PhoneCodeSelectProps {
  control: Control<AddressFormValues>;
  setValue: UseFormSetValue<AddressFormValues>;
}

export const PhoneCodeSelect: React.FC<PhoneCodeSelectProps> = ({ control, setValue }) => {
    const [openPhonePopover, setOpenPhonePopover] = useState(false);
    const [phoneCodeSearchTerm, setPhoneCodeSearchTerm] = useState('');

    const handlePhoneCodeSelect = (value: string) => {
        setValue('phoneCountryCode', value);
        setOpenPhonePopover(false);
    };

    const filteredPhoneCodes = phoneCountryCodes.filter(code => 
        code.label.toLowerCase().includes(phoneCodeSearchTerm.toLowerCase())
    );

    return (
        <FormField
            control={control}
            name="phoneCountryCode"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Code</FormLabel>
                    <Popover open={openPhonePopover} onOpenChange={setOpenPhonePopover}>
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
                                    {field.value ? 
                                        phoneCountryCodes.find(code => code.value === field.value)?.label || field.value 
                                        : "Select code"
                                    }
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                            <Command shouldFilter={false}>
                                <CommandInput 
                                    placeholder="Search country codes..." 
                                    value={phoneCodeSearchTerm}
                                    onValueChange={setPhoneCodeSearchTerm}
                                    className="text-sm"
                                />
                                <CommandList>
                                    <CommandEmpty className="text-sm">No country code found.</CommandEmpty>
                                    <CommandGroup>
                                        {filteredPhoneCodes.slice(0, 10).map((option) => (
                                            <CommandItem
                                                value={option.value}
                                                key={option.value}
                                                onSelect={() => handlePhoneCodeSelect(option.value)}
                                                className="text-sm"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        option.value === field.value
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {option.label}
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