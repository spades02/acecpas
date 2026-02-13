"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export interface ViewState {
    basis: 'accrual' | 'cash'
    display: 'reported' | 'adjusted' | 'both'
    rounding: 'actual' | 'thousands' | 'millions'
    periodType: 'monthly' | 'quarterly' | 'annual'
}

interface ViewControlsProps {
    viewState: ViewState
    onChange: (newState: ViewState) => void
    showBasis?: boolean
    showDisplay?: boolean
    showRounding?: boolean
    showPeriod?: boolean
}

export const DEFAULT_VIEW_STATE: ViewState = {
    basis: 'accrual',
    display: 'reported',
    rounding: 'actual',
    periodType: 'monthly',
}

export function ViewControls({
    viewState,
    onChange,
    showBasis = true,
    showDisplay = true,
    showRounding = true,
    showPeriod = true,
}: ViewControlsProps) {
    const update = (partial: Partial<ViewState>) => {
        onChange({ ...viewState, ...partial })
    }

    return (
        <div className="flex items-center gap-3 flex-wrap bg-white border rounded-lg px-4 py-2.5 shadow-sm">
            {/* Accounting Basis */}
            {showBasis && (
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Basis</span>
                    <ToggleGroup
                        type="single"
                        value={viewState.basis}
                        onValueChange={(v) => v && update({ basis: v as ViewState['basis'] })}
                        size="sm"
                        className="bg-muted rounded-md"
                    >
                        <ToggleGroupItem
                            value="accrual"
                            className="text-xs px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md"
                        >
                            Accrual
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="cash"
                            className="text-xs px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md"
                        >
                            Cash
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            )}

            {showBasis && <Separator orientation="vertical" className="h-6" />}

            {/* Display Mode */}
            {showDisplay && (
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Display</span>
                    <ToggleGroup
                        type="single"
                        value={viewState.display}
                        onValueChange={(v) => v && update({ display: v as ViewState['display'] })}
                        size="sm"
                        className="bg-muted rounded-md"
                    >
                        <ToggleGroupItem
                            value="reported"
                            className="text-xs px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md"
                        >
                            Reported
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="adjusted"
                            className="text-xs px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md"
                        >
                            Adjusted
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="both"
                            className="text-xs px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md"
                        >
                            Both
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            )}

            {showDisplay && <Separator orientation="vertical" className="h-6" />}

            {/* Period Granularity */}
            {showPeriod && (
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Period</span>
                    <Select value={viewState.periodType} onValueChange={(v) => update({ periodType: v as ViewState['periodType'] })}>
                        <SelectTrigger className="h-8 w-[110px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                            <SelectItem value="quarterly" className="text-xs">Quarterly</SelectItem>
                            <SelectItem value="annual" className="text-xs">Annual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {showPeriod && showRounding && <Separator orientation="vertical" className="h-6" />}

            {/* Rounding */}
            {showRounding && (
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Units</span>
                    <Select value={viewState.rounding} onValueChange={(v) => update({ rounding: v as ViewState['rounding'] })}>
                        <SelectTrigger className="h-8 w-[100px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="actual" className="text-xs">Actual</SelectItem>
                            <SelectItem value="thousands" className="text-xs">Thousands</SelectItem>
                            <SelectItem value="millions" className="text-xs">Millions</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}
