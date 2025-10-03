
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, isToday, isYesterday, subDays, startOfDay } from 'date-fns';
import Header from '@/app/components/header';
import CallLog, { type CallGroup } from '@/app/components/call-log';
import { Phone } from 'lucide-react';
import {
  fetchCallers,
  updateCallerNote,
  updateCallNote,
  updateExcludedStatus,
  type Caller,
  type Call,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export type DateRange = {
  from: Date;
  to: Date;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [allCallers, setAllCallers] = useState<Caller[]>([]);
  const [callsByPhone, setCallsByPhone] = useState<Record<string, Call[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const { toast } = useToast();

  const fetchAndSetCallers = useCallback(async (range: DateRange | undefined) => {
    setLoading(true);
    try {
      if (range && range.from) {
        const startDate = format(range.from, 'yyyy-MM-dd');
        const endDate = format(range.to, 'yyyy-MM-dd');
        const fetchedCallers = await fetchCallers({
          start_date: startDate,
          end_date: endDate,
        });
        setAllCallers(fetchedCallers.filter(c => !c.excluded));
      } else {
        const fetchedCallers = await fetchCallers({});
        setAllCallers(fetchedCallers.filter(c => !c.excluded));
      }
    } catch (error) {
      console.error('Failed to fetch callers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch call data from the server.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    fetchAndSetCallers(dateRange);
  }, [dateRange, fetchAndSetCallers]);

  const handleUpdateContactNote = async (callerId: string, newNote: string) => {
    try {
      await updateCallerNote(callerId, newNote);
      setAllCallers((prevCallers) =>
        prevCallers.map((caller) =>
          caller.id === callerId ? { ...caller, note: newNote } : caller
        )
      );
      toast({
        title: 'Note Saved',
        description: 'The contact note has been updated.',
      });
    } catch (error) {
      console.error('Failed to update caller note:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save the contact note.',
      });
    }
  };

  const handleUpdateCallNote = async (callId: string, newNote: string) => {
     try {
      await updateCallNote(callId, newNote);
      setCallsByPhone(prev => {
        const newCallsByPhone = { ...prev };
        for (const phone in newCallsByPhone) {
          newCallsByPhone[phone] = newCallsByPhone[phone].map(call =>
            call.id === callId ? { ...call, note: newNote } : call
          );
        }
        return newCallsByPhone;
      });
       toast({
        title: 'Call Note Saved',
        description: 'The note for this specific call has been updated.',
      });
    } catch (error) {
      console.error('Failed to update call note:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save the call note.',
      });
    }
  };

  const handleExcludeNumber = async (callerId: string) => {
     try {
      await updateExcludedStatus(callerId, true);
      setAllCallers((prev) => prev.filter((c) => c.id !== callerId));
      toast({
        title: 'Contact Excluded',
        description: `Contact has been removed from the list.`,
      });
    } catch (error) {
       console.error('Failed to exclude number:', error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not exclude the contact.',
      });
    }
  };
  
  const filteredCallers = useMemo(() => {
    if (!searchQuery) {
      return allCallers;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return allCallers.filter(caller => {
      const name = caller.lead_name || '';
      const phone = caller.phone || '';
      return name.toLowerCase().includes(lowercasedQuery) || phone.includes(lowercasedQuery);
    });
  }, [allCallers, searchQuery]);


  const callGroups: CallGroup[] = useMemo(() => {
    return filteredCallers
      .map((caller) => {
        const callsInGroup = callsByPhone[caller.phone] || [];
        
        return {
          caller: caller,
          calls: callsInGroup,
          lastCallTimestamp: new Date(caller.last_call),
        };
      })
      .sort((a, b) => b.lastCallTimestamp.getTime() - a.lastCallTimestamp.getTime());
  }, [filteredCallers, callsByPhone]);

  const getGroupTitle = useCallback((date: Date) => {
    const startOfDate = startOfDay(date);
    if (isToday(startOfDate)) return 'Today';
    if (isYesterday(startOfDate)) return 'Yesterday';
    return format(startOfDate, 'MMMM d, yyyy');
  }, []);
  
  const groupedAndSortedCalls = useMemo(() => {
    return callGroups.reduce((acc, group) => {
      const title = getGroupTitle(group.lastCallTimestamp);
      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(group);
      return acc;
    }, {} as Record<string, CallGroup[]>);
  }, [callGroups, getGroupTitle]);

  const sortedGroupTitles = useMemo(() => {
    return Object.keys(groupedAndSortedCalls).sort((a, b) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [groupedAndSortedCalls]);

  
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background">
        <Phone className="h-16 w-16 animate-pulse text-primary" />
        <h1 className="mt-4 text-2xl font-bold text-primary">CallSync Notes</h1>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header 
        onDateRangeChange={setDateRange} 
        initialRange={dateRange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <CallLog 
        groupedCalls={groupedAndSortedCalls}
        sortedGroupTitles={sortedGroupTitles}
        onUpdateContactNote={handleUpdateContactNote}
        onUpdateCallNote={handleUpdateCallNote}
        onExcludeNumber={handleExcludeNumber}
        allCallers={allCallers}
        setCallsByPhone={setCallsByPhone}
      />
    </div>
  );
}
