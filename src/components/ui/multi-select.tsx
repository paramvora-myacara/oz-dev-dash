"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Select options...",
  className
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((s) => s !== value)
      : [...selected, value]
    onSelectionChange(newSelected)
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectionChange([])
  }

  const displayText = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? options.find((opt) => opt.value === selected[0])?.label || selected[0]
      : `${selected.length} selected`

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between text-left font-normal",
          !selected.length && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayText}</span>
        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <X
              className="h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                clearAll(e)
              }}
            />
          )}
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
        </div>
      </Button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="p-1 max-h-[300px] overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex items-center rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => toggleOption(option.value)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleOption(option.value)}
                    className="mr-2"
                  />
                  <span className="flex-1">{option.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
