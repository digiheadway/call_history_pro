
'use client';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfToday, endOfDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import type { LeadFilter, CustomNameFilter, TypeFilter, NoteFilter, SyncFilter } from '@/app/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  initialRange?: DateRange;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  leadFilter: LeadFilter;
  setLeadFilter: (filter: LeadFilter) => void;
  customNameFilter: CustomNameFilter;
  setCustomNameFilter: (filter: CustomNameFilter) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (filter: TypeFilter) => void;
  noteFilter: NoteFilter;
  setNoteFilter: (filter: NoteFilter) => void;
  syncFilter: SyncFilter;
  setSyncFilter: (filter: SyncFilter) => void;
}

export default function FilterPanel({
  isOpen,
  onClose,
  onDateRangeChange,
  initialRange,
  searchQuery,
  setSearchQuery,
  leadFilter,
  setLeadFilter,
  customNameFilter,
  setCustomNameFilter,
  typeFilter,
  setTypeFilter,
  noteFilter,
  setNoteFilter,
  syncFilter,
  setSyncFilter
}: FilterPanelProps) {
  
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const handlePresetChange = (value: string) => {
    const today = startOfToday();
    let newRange: DateRange | undefined;
    
    switch(value) {
      case 'today':
        newRange = { from: today, to: today };
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        newRange = { from: yesterday, to: yesterday };
        break;
      case '3':
        newRange = { from: subDays(today, 2), to: today };
        break;
      case '7':
        newRange = { from: subDays(today, 6), to: today };
        break;
      case '14':
        newRange = { from: subDays(today, 13), to: today };
        break;
      case '30':
        newRange = { from: subDays(today, 29), to: today };
        break;
      case 'custom':
        setIsDatePopoverOpen(true);
        return;
      default:
        newRange = undefined;
    }
    
    if (newRange?.from) {
        onDateRangeChange({ from: startOfDay(newRange.from), to: endOfDay(newRange.to || newRange.from) });
    } else {
        onDateRangeChange(undefined);
    }
  }
  
  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      onDateRangeChange({ from: startOfDay(range.from), to: range.to ? endOfDay(range.to) : endOfDay(range.from) });
    } else {
       onDateRangeChange(undefined);
    }
    // Close popover when a date/range is selected
    if (range?.from && range.to) {
      setIsDatePopoverOpen(false);
    }
     if (range?.from && !range.to) { // For single day selection
      // Keep it open for range, but if it was a single click, you might want to close it.
      // For this implementation, we will assume range selection and keep it open.
    }
  }


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()} className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Filters & Search</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-foreground">Search</h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by name or number..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Separator />
              
              <div>
                <h3 className="mb-2 text-sm font-medium text-foreground">Date Range</h3>
                <div className="flex flex-col gap-2">
                  <Select onValueChange={handlePresetChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="3">Last 3 days</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="14">Last 14 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="custom">Custom Range...</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                      <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !initialRange && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {initialRange?.from ? (
                                initialRange.to ? (
                                <>
                                    {format(initialRange.from, "LLL dd, y")} -{" "}
                                    {format(initialRange.to, "LLL dd, y")}
                                </>
                                ) : (
                                format(initialRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={initialRange?.from}
                            selected={initialRange}
                            onSelect={handleDateSelect}
                            numberOfMonths={1}
                           />
                      </PopoverContent>
                  </Popover>

                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">Lead Status</Label>
                   <Select value={leadFilter} onValueChange={value => setLeadFilter(value as LeadFilter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by lead status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="lead">Leads Only</SelectItem>
                      <SelectItem value="not-lead">Not Leads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Custom Name</Label>
                   <Select value={customNameFilter} onValueChange={value => setCustomNameFilter(value as CustomNameFilter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by custom name" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="set">Name Set</SelectItem>
                      <SelectItem value="not-set">Name Not Set</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                 <div>
                  <Label className="text-sm font-medium text-foreground">Contact Type</Label>
                   <Select value={typeFilter} onValueChange={value => setTypeFilter(value as TypeFilter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by contact type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="set">Type Set</SelectItem>
                      <SelectItem value="not-set">Type Not Set</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Person Note</Label>
                   <Select value={noteFilter} onValueChange={value => setNoteFilter(value as NoteFilter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by note status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="with-note">With Note</SelectItem>
                      <SelectItem value="without-note">Without Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                 <div>
                  <Label className="text-sm font-medium text-foreground">Sync Status</Label>
                   <Select value={syncFilter} onValueChange={value => setSyncFilter(value as SyncFilter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by sync status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="undone">Undone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
          </div>
        </div>
        <div className="border-t p-4">
             <Button onClick={onClose} className="w-full">Done</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

    