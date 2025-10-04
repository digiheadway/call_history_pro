
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, isToday, isYesterday, startOfDay, endOfDay, subDays } from 'date-fns';
import Header from '@/app/components/header';
import CallLog, { type CallGroup } from '@/app/components/call-log';
import { Loader2 } from 'lucide-react';
import {
  fetchCallers,
  updateCallerNote,
  updateCallNote,
  updateExcludedStatus,
  markSynced,
  updateCallerInfo,
} from '@/lib/api';
import type { Caller, Call, DateRange, GroupedCalls } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePersistentState } from '@/hooks/use-persistent-state';


export type ContactFilter = 'all' | 'typed' | 'not-typed';
export type SyncFilter = 'all' | 'done' | 'undone';
export type NoteFilter = 'all' | 'with-note' | 'without-note';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [allCallers, setAllCallers] = useState<Caller[]>([]);
  const [callsByPhone, setCallsByPhone] = useState<Record<string, Call[]>>({});

  const [searchQuery, setSearchQuery] = usePersistentState('searchQuery', '');
  const [activeTab, setActiveTab] = usePersistentState('activeTab', 'all');
  const [expandedAccordions, setExpandedAccordions] = usePersistentState<string[]>('expandedAccordions', []);
  
  const [dateRange, setDateRange] = usePersistentState<DateRange | undefined>('dateRange', {
    from: subDays(new Date(), 2),
    to: new Date(),
  }, (value) => value ? { from: new Date(value.from), to: new Date(value.to) } : undefined);

  const [currentlyPlaying, setCurrentlyPlaying] = usePersistentState<string | null>('currentlyPlaying', null);
  const [contactFilter, setContactFilter] = usePersistentState<ContactFilter>('contactFilter', 'all');
  const [syncFilter, setSyncFilter] = usePersistentState<SyncFilter>('syncFilter', 'all');
  const [noteFilter, setNoteFilter] = usePersistentState<NoteFilter>('noteFilter', 'all');


  const { toast } = useToast();

  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => {
      const isAlreadyExpanded = prev.includes(id);
      if (isAlreadyExpanded) {
        return prev.filter(item => item !== id);
      } else {
        const newExpanded = [...prev, id];
        // Keep max 2 accordions open
        if (newExpanded.length > 2) {
          return newExpanded.slice(newExpanded.length - 2);
        }
        return newExpanded;
      }
    });
  };

  const fetchAndSetCallers = useCallback(async (range: DateRange | undefined) => {
    setLoading(true);
    try {
      if (range && range.from) {
        const startDate = format(startOfDay(range.from), 'yyyy-MM-dd');
        const endDate = format(endOfDay(range.to), 'yyyy-MM-dd');
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
          caller.id === callerId ? { ...caller, note: newNote, last_sync: false } : caller
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

  const handleMarkSynced = async (callerId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      await markSynced(callerId, newStatus);
      setAllCallers((prev) => 
        prev.map((caller) =>
            caller.id === callerId ? { ...caller, last_sync: newStatus } : caller
        )
      );
      toast({
        title: 'Contact Status Updated',
        description: `Contact has been marked as ${newStatus ? 'done' : 'not done'}.`,
      });
    } catch(error) {
        console.error('Failed to mark as synced:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not update the contact sync status.',
        });
    }
  };

  const handleUpdateCallerInfo = async (callerId: string, info: { custom_name?: string; caller_type?: string }) => {
    try {
      await updateCallerInfo(callerId, info);
      setAllCallers((prevCallers) =>
        prevCallers.map((caller) =>
          caller.id === callerId ? { ...caller, ...info, last_sync: false } : caller
        )
      );
      toast({
        title: 'Info Updated',
        description: 'The contact information has been saved.',
      });
    } catch (error)
 {
      console.error('Failed to update caller info:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save the contact information.',
      });
    }
  };
  
  const filteredCallers = useMemo(() => {
    let callers = [...allCallers];

    // Search Query Filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      callers = callers.filter(caller => {
        const name = caller.lead_name || caller.custom_name || '';
        const phone = caller.phone || '';
        return name.toLowerCase().includes(lowercasedQuery) || phone.includes(lowercasedQuery);
      });
    }
    
    // Contact Filter
    if (contactFilter === 'typed') {
        callers = callers.filter(caller => caller.caller_type && caller.caller_type.trim() !== '');
    } else if (contactFilter === 'not-typed') {
        callers = callers.filter(caller => !caller.caller_type || caller.caller_type.trim() === '');
    }

    // Sync Filter
    if (syncFilter === 'done') {
        callers = callers.filter(caller => caller.last_sync);
    } else if (syncFilter === 'undone') {
        callers = callers.filter(caller => !caller.last_sync);
    }

    // Note Filter
    if (noteFilter === 'with-note') {
        callers = callers.filter(caller => caller.note && caller.note.trim() !== '');
    } else if (noteFilter === 'without-note') {
        callers = callers.filter(caller => !caller.note || caller.note.trim() === '');
    }
    
    return callers;
  }, [allCallers, searchQuery, contactFilter, syncFilter, noteFilter]);


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
    const groupsByTitle = callGroups.reduce((acc, group) => {
      const title = getGroupTitle(group.lastCallTimestamp);
      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(group);
      return acc;
    }, {} as Record<string, CallGroup[]>);

    const final: GroupedCalls = {};
    for (const title in groupsByTitle) {
        const groups = groupsByTitle[title];
        const callCount = groups.reduce((sum, g) => sum + g.caller.calls_in_range, 0);
        const callerCount = groups.length;
        final[title] = {
            groups: groups,
            callCount,
            callerCount
        };
    }
    return final;

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

  
  return (
    <div className="flex h-full flex-col">
      <Header 
        onDateRangeChange={setDateRange} 
        initialRange={dateRange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        contactFilter={contactFilter}
        setContactFilter={setContactFilter}
        syncFilter={syncFilter}
        setSyncFilter={setSyncFilter}
        noteFilter={noteFilter}
        setNoteFilter={setNoteFilter}
      />
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <CallLog 
            groupedCalls={groupedAndSortedCalls}
            sortedGroupTitles={sortedGroupTitles}
            onUpdateContactNote={handleUpdateContactNote}
            onUpdateCallNote={handleUpdateCallNote}
            onExcludeNumber={handleExcludeNumber}
            onMarkSynced={handleMarkSynced}
            onUpdateCallerInfo={handleUpdateCallerInfo}
            allCallers={allCallers}
            setCallsByPhone={setCallsByPhone}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            expandedAccordions={expandedAccordions}
            toggleAccordion={toggleAccordion}
            currentlyPlaying={currentlyPlaying}
            setCurrentlyPlaying={setCurrentlyPlaying}
        />
      )}
    </div>
  );
}

    