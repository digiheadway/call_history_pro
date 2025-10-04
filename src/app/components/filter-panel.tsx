
'use client';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfToday, startOfYesterday, isSameDay, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import type { DateRange as AppDateRange, ContactFilter, SyncFilter, NoteFilter } from '@/app/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDateRangeChange: (range: AppDateRange | undefined) => void;
  initialRange?: AppDateRange;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  contactFilter: ContactFilter;
  setContactFilter: (filter: ContactFilter) => void;
  syncFilter: SyncFilter;
  setSyncFilter: (filter: SyncFilter) => void;
  noteFilter: NoteFilter;
  setNoteFilter: (filter: NoteFilter) => void;
}

const getPresetFromRange = (range?: AppDateRange): string => {
    if (!range || !range.from || !range.to) return 'range';

    const today = startOfToday();
    const from = startOfDay(range.from);
    const to = startOfDay(range.to);

    if (isSameDay(from, today) && isSameDay(to, today)) return 'today';
    if (isSameDay(from, startOfYesterday()) && isSameDay(to, startOfYesterday())) return 'yesterday';
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
  contactFilter,
  setContactFilter,
  syncFilter,
  setSyncFilter,
  noteFilter,
  setNoteFilter,
}: FilterPanelProps) {
  const [date, setDate] = useState<DateRange | undefined>(initialRange);
  const [preset, setPreset] = useState<string>(getPresetFromRange(initialRange));
  const [calendarMode, setCalendarMode] = useState<'range' | 'single'>(preset === 'day' ? 'single' : 'range');
  
  useEffect(() => {
    setDate(initialRange);
    setPreset(getPresetFromRange(initialRange));
  }, [initialRange]);


  const handlePresetChange = (value: string) => {
    setPreset(value);
    const to = new Date();
    to.setHours(23, 59, 59, 999); // Ensure 'to' date includes the full day
    
    let newRange: AppDateRange | undefined;
    
    switch(value) {
      case 'today':
        newRange = { from: startOfToday(), to };
        setCalendarMode('range');
        break;
      case 'yesterday':
        const yesterday = startOfYesterday();
        newRange = { from: yesterday, to: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999) };
        setCalendarMode('range');
        break;
      case '3':
        newRange = { from: subDays(to, 2), to };
        setCalendarMode('range');
        break;
      case '7':
        newRange = { from: subDays(to, 6), to };
        setCalendarMode('range');
        break;
      case '14':
        newRange = { from: subDays(to, 13), to };
        setCalendarMode('range');
        break;
      case '30':
        newRange = { from: subDays(to, 29), to };
        setCalendarMode('range');
        break;
      case 'day':
        setCalendarMode('single');
        // Let the calendar handle setting the date
        return; 
      case 'range':
        setCalendarMode('range');
        // Let the calendar handle setting the date
        return;
      default:
        newRange = undefined;
    }
    setDate(newRange);
    if (newRange) {
        onDateRangeChange(newRange);
    }
  }

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if(newDate?.from) {
      const adjustedTo = newDate.to || newDate.from;
      // Set time to end of day
      adjustedTo.setHours(23, 59, 59, 999);
      onDateRangeChange({ from: newDate.from, to: adjustedTo });
    }
    // Automatically switch preset if a date is picked manually
    if (preset !== 'day' && preset !== 'range') {
        setPreset(calendarMode === 'single' ? 'day' : 'range');
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader>
          <SheetTitle>Filters & Search</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
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

                {(preset === 'day' || preset === 'range') && (
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="date"
                        variant={"outline"}
                        className="justify-start text-left font-normal"
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to && !isSameDay(date.from, date.to) ? (
                            <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                            </>
                            ) : (
                            format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        initialFocus
                        mode={calendarMode}
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleDateChange}
                        numberOfMonths={1}
                        />
                    </PopoverContent>
                    </Popover>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Contact Type</Label>
                 <Select value={contactFilter} onValueChange={value => setContactFilter(value as ContactFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by contact type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="leads">Leads Only</SelectItem>
                    <SelectItem value="custom">Custom Only</SelectItem>
                    <SelectItem value="no-info">No Info Only</SelectItem>
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
                    <SelectItem value="done">Done Only</SelectItem>
                    <SelectItem value="undone">Undone Only</SelectItem>
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
            </div>
        </div>
        <div className="absolute bottom-4 right-4 left-4">
             <Button onClick={onClose} className="w-full">Done</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

    