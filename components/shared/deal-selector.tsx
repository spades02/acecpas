"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface DealOption {
    id: string
    client_name: string
}

interface DealSelectorProps {
    deals: DealOption[]
    selectedIds: string[]
    onChange: (ids: string[]) => void
}

export function DealSelector({ deals, selectedIds, onChange }: DealSelectorProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (dealId: string) => {
        if (selectedIds.includes(dealId)) {
            onChange(selectedIds.filter(id => id !== dealId))
        } else {
            onChange([...selectedIds, dealId])
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[300px] justify-between"
                >
                    {selectedIds.length === 0
                        ? "Select deals..."
                        : `${selectedIds.length} deal${selectedIds.length > 1 ? 's' : ''} selected`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search deals..." />
                    <CommandList>
                        <CommandEmpty>No deal found.</CommandEmpty>
                        <CommandGroup>
                            {deals.map((deal) => (
                                <CommandItem
                                    key={deal.id}
                                    value={deal.client_name}
                                    onSelect={() => handleSelect(deal.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedIds.includes(deal.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {deal.client_name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
