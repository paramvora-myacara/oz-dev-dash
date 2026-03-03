"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  /** Class for the dropdown panel (list container) */
  contentClassName?: string;
  /** Class for each option row */
  optionClassName?: string;
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Select options...",
  className,
  contentClassName,
  optionClassName,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((s) => s !== value)
      : [...selected, value];
    onSelectionChange(newSelected);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectionChange([]);
  };

  const displayText =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? options.find((opt) => opt.value === selected[0])?.label ?? selected[0]
        : `${selected.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            !selected.length && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayText}</span>
          <div className="flex items-center gap-1 shrink-0">
            {selected.length > 0 && (
              <X
                className="h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearAll(e);
                }}
              />
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 opacity-50 transition-transform",
                open && "rotate-180"
              )}
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[var(--radix-popover-trigger-width)] min-w-[180px] p-0",
          contentClassName
        )}
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandList className="max-h-[280px]">
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggleOption(option.value)}
                    className={cn(
                      "cursor-pointer gap-3",
                      optionClassName
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="h-4 w-4 rounded-sm border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 pointer-events-none"
                    />
                    <span className="flex-1 text-sm font-medium text-slate-700">
                      {option.label}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
