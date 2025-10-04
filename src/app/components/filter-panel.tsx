
'use client';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfToday, isSameDay, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import type { LeadFilter, CustomNameFilter, TypeFilter, NoteFilter, SyncFilter } from '@/app/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

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

const getPresetFromRange = (range?: DateRange): string => {
    if (!range || !range.from) return 'range';
    
    const from = startOfDay(range.from);
    const to = range.to ? endOfDay(range.to) : from;
    const today = startOfToday();

    if (isSameDay(from, today) && isSameDay(to, today)) return 'today';
    if (isSameDay(from, subDays(today, 1)) && isSameDay(to, subDays(today, 1))) return 'yesterday';
    if (isSameDay(from, subDays(today, 2)) && isSameDay(to, today)) return '3';
    if (isSameDay(from, subDays(today, 6)) && isSameDay(to, today)) return '7';
    if (isSameDay(from, subDays(today, 13)) && isSameDay(to, today)) return '14';
    if (isSameDay(from, subDays(today, 29)) && isSameDay(to, today)) return '30';
    if (isSameDay(from, to)) return 'day';
    
    return 'range';
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
  const [date, setDate] = useState<DateRange | undefined>(initialRange);
  const [preset, setPreset] = useState<string>('range');
  
  useEffect(() => {
    setDate(initialRange);
    const newPreset = getPresetFromRange(initialRange);
    setPreset(newPreset);
  }, [initialRange]);


  const handlePresetChange = (value: string) => {
    setPreset(value);
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
      case 'day':
      case 'range':
        setDate(undefined);
        onDateRangeChange(undefined);
        return;
      default:
        newRange = undefined;
    }
    
    setDate(newRange);
    if (newRange?.from) {
        onDateRangeChange({ from: startOfDay(newRange.from), to: endOfDay(newRange.to || newRange.from) });
    }
  }

  const handleSingleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? parseISO(e.target.value) : undefined;
    const newRange = newDate ? { from: newDate, to: newDate } : undefined;
    setDate(newRange);
    if(newRange?.from) {
        onDateRangeChange({ from: startOfDay(newRange.from), to: endOfDay(newRange.from) });
    }
  }

  const handleRangeDateChange = (part: 'from' | 'to', value: string) => {
    const newDate = value ? parseISO(value) : undefined;
    let newRange: DateRange | undefined;
    if (part === 'from') {
        newRange = { from: newDate, to: date?.to };
    } else {
        newRange = { from: date?.from, to: newDate };
    }
    setDate(newRange);

    if (newRange.from && newRange.to) {
         onDateRangeChange({ from: startOfDay(newRange.from), to: endOfDay(newRange.to) });
    }
  }

  const formatDateForInput = (date: Date | undefined) => {
    return date ? format(date, 'yyyy-MM-dd') : '';
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
                  <Select value={preset} onValueChange={handlePresetChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="3">Last 3 days</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="14">Last 14 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="day">Select Day</SelectItem>
                      <SelectItem value="range">Select Date Range</SelectItem>
                    </SelectContent>
                  </Select>

                  {preset === 'day' && (
                    <Input
                        type="date"
                        value={formatDateForInput(date?.from)}
                        onChange={handleSingleDateChange}
                    />
                  )}

                  {preset === 'range' && (
                      <div className="flex items-center gap-2">
                          <Input
                              type="date"
                              value={formatDateForInput(date?.from)}
                              onChange={(e) => handleRangeDateChange('from', e.target.value)}
                          />
                          <span>to</span>
                          <Input
                              type="date"
                              value={formatDateForInput(date?.to)}
                              onChange={(e) => handleRangeDateChange('to', e.target.value)}
                          />
                      </div>
                  )}

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

    