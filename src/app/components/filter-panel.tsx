'use client';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState, type Dispatch, type SetStateAction } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays } from 'date-fns';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import type { DateRange as AppDateRange } from '@/app/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDateRangeChange: (range: AppDateRange | undefined) => void;
  initialRange?: AppDateRange;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function FilterPanel({
  isOpen,
  onClose,
  onDateRangeChange,
  initialRange,
  searchQuery,
  setSearchQuery
}: FilterPanelProps) {
  const [date, setDate] = useState<DateRange | undefined>(initialRange);
  const [preset, setPreset] = useState<string>("7");

  const handlePresetChange = (value: string) => {
    setPreset(value);
    let newRange: AppDateRange | undefined;
    const to = new Date();
    switch(value) {
      case '3':
        newRange = { from: subDays(to, 3), to };
        break;
      case '7':
        newRange = { from: subDays(to, 7), to };
        break;
      case '30':
        newRange = { from: subDays(to, 30), to };
        break;
      case 'custom':
        // Let the calendar handle it
        return;
      default:
        newRange = undefined;
    }
    setDate(newRange);
    onDateRangeChange(newRange);
  }

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if(newDate?.from) {
      const adjustedTo = newDate.to || newDate.from;
      // Set time to end of day
      adjustedTo.setHours(23, 59, 59, 999);
      onDateRangeChange({ from: newDate.from, to: adjustedTo });
    }
    if (preset !== 'custom') {
      setPreset('custom');
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
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
                    <SelectItem value="3">Last 3 days</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
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
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={handleDateChange}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
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
