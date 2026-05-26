'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from '@/lib/utils/cn';

export type Option = Record<'value' | 'label', string> & Record<string, string | number | boolean | undefined>;

interface MultipleSelectorProps {
  value?: Option[];
  defaultOptions?: Option[];
  options?: Option[];
  placeholder?: string;
  emptyIndicator?: React.ReactNode;
  onChange?: (options: Option[]) => void;
  onSearch?: (value: string) => Promise<Option[]>;
  triggerSearchOnFocus?: boolean;
  groupBy?: string;
  disabled?: boolean;
  maxSelected?: number;
  hidePlaceholderWhenSelected?: boolean;
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  inputProps?: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>;
}

export function MultipleSelector({
  value,
  onChange,
  placeholder,
  defaultOptions = [],
  options: controlledOptions,
  emptyIndicator,
  groupBy,
  disabled,
  maxSelected,
  hidePlaceholderWhenSelected,
  triggerSearchOnFocus,
  onSearch: RNPsearch,
  commandProps,
  inputProps,
}: MultipleSelectorProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<Option[]>(defaultOptions);
  const [selected, setSelected] = React.useState<Option[]>(value || []);

  React.useEffect(() => {
    setSelected(value || []);
  }, [value]);

  React.useEffect(() => {
    if (controlledOptions) {
      setOptions(controlledOptions);
    }
  }, [controlledOptions]);

  const handleUnselect = React.useCallback(
    (option: Option) => {
      const newSelected = selected.filter((s) => s.value !== option.value);
      setSelected(newSelected);
      onChange?.(newSelected);
    },
    [selected, onChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '' && selected.length > 0) {
            handleUnselect(selected[selected.length - 1]);
          }
        }
        if (e.key === 'Escape') {
          input.blur();
        }
      }
    },
    [selected, handleUnselect]
  );

  const selectables = React.useMemo(() => 
    options.filter(option => 
      !selected.some(s => s.value === option.value) &&
      (maxSelected === undefined || selected.length < maxSelected)
    )
  , [options, selected, maxSelected]);

  const handleSearch = async (value: string) => {
    setInputValue(value);
    if (RNPsearch) {
      setIsLoading(true);
      try {
        const searchResult = await RNPsearch(value);
        setOptions(searchResult || defaultOptions);
      } finally {
        setIsLoading(false);
      }
    } else {
      const filteredOptions = defaultOptions.filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase())
      );
      setOptions(filteredOptions);
    }
  };

  const groupedOptions = React.useMemo(() => {
    if (!groupBy) return {};
    return selectables.reduce((acc, option) => {
      const group = String(option[groupBy] || 'Uncategorized');
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    }, {} as Record<string, Option[]>);
  }, [selectables, groupBy]);


  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn('overflow-visible bg-transparent', commandProps?.className)}
      {...commandProps}
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="rounded hover:bg-secondary/80"
            >
              {option.label}
              <button
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUnselect(option);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleUnselect(option)}
                disabled={disabled}
                aria-label={`Remove ${option.label}`}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={handleSearch}
            onBlur={() => setOpen(false)}
            onFocus={() => {
              setOpen(true);
              if (triggerSearchOnFocus && !inputValue) {
                handleSearch('');
              }
            }}
            placeholder={
              hidePlaceholderWhenSelected && selected.length > 0
                ? ''
                : placeholder
            }
            className={cn(
              'ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
              'h-full px-0 py-0.5 border-0 shadow-none focus:ring-0',
              inputProps?.className
            )}
            disabled={disabled || (maxSelected !== undefined && selected.length >= maxSelected)}
            {...inputProps}
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <CommandList className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
            style={{
                maxHeight: '300px',
                overflowY: 'auto'
            }}
          >
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-2 text-center text-sm">Loading...</div>
              </CommandPrimitive.Loading>
            ) : (
              <>
                {Object.keys(groupedOptions).length > 0 ? (
                  Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                    <CommandGroup key={groupName} heading={groupName}>
                      {groupOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onSelect={() => {
                            setInputValue('');
                            const newSelected = [...selected, option];
                            setSelected(newSelected);
                            onChange?.(newSelected);
                          }}
                          className={cn('cursor-pointer', '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground')}
                        >
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))
                ) : (selectables.length > 0 ? (
                  <CommandGroup>
                    {selectables.map((option) => (
                      <CommandItem
                        key={option.value}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={() => {
                          setInputValue('');
                          const newSelected = [...selected, option];
                          setSelected(newSelected);
                          onChange?.(newSelected);
                        }}
                        className="cursor-pointer"
                      >
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  !isLoading && selectables.length === 0 && selected.length === 0 && (
                    <CommandPrimitive.Empty>{emptyIndicator}</CommandPrimitive.Empty>
                  )
                ))}
              </>
            )}
          </CommandList>
        )}
      </div>
    </Command>
  );
}

export type { Option as MultipleSelectorOption }; 