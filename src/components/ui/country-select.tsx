'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
interface Country {
    code: string;
    name: string;
}

let countriesDataCache: Country[] | null = null;

function getCountriesData(): Country[] {
    if (!countriesDataCache) {
        const { getData } = require('country-list');
        countriesDataCache = getData().map((country: any) => ({
    code: country.code,
    name: country.name,
}));
    }
    return countriesDataCache as Country[];
}

function getFlagEmoji(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

interface CountrySelectorProps {
    value?: string;
    onChange: (country: Country | undefined) => void;
    disabled?: boolean;
}

export function CountrySelector({ value, onChange, disabled }: CountrySelectorProps) {
    const [open, setOpen] = React.useState(false);
    const countriesData = React.useMemo(() => getCountriesData(), []);
    const selectedCountry = countriesData.find(country => country.code === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10 font-normal"
                >
                    {selectedCountry
                        ? <><span className="mr-2">{getFlagEmoji(selectedCountry.code)}</span>{selectedCountry.name}</>
                        : <span className="text-muted-foreground">Select country...</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                            {countriesData.map((country) => (
                                <CommandItem
                                    key={country.code}
                                    value={country.name}
                                    onSelect={() => {
                                        onChange(country.code === value ? undefined : country);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === country.code ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="mr-2">{getFlagEmoji(country.code)}</span>
                                    {country.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
} 