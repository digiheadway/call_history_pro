'use client';
import { Phone, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfDay } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRange as AppDateRange } from '@/app/page';

interface HeaderProps {
    onDateRangeChange: (range: AppDateRange | undefined) => void;
    initialRange?: AppDateRange;
}

export default function Header({ onDateRangeChange, initialRange }: HeaderProps) {
  const [date, setDate] = useState<DateRange | undefined>(initialRange);
  const [preset, setPreset] = useState<string>("7");

  const handlePresetChange = (value: string) => {
    setPreset(value);
    let newRange: AppDateRange | undefined;
    const to = startOfDay(new Date());
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
        onDateRangeChange({from: newDate.from, to: newDate.to || newDate.from});
    }
    if (preset !== 'custom') {
        setPreset('custom');
    }
  }

  return (
    <header className="flex flex-col shrink-0 gap-3 border-b bg-card/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">CallSync Notes</h1>
        </div>
        <div className="flex items-center gap-2">
            <Select value={preset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-[120px]">
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
                    className="flex-1 justify-start text-left font-normal"
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
    </header>
  );
}
