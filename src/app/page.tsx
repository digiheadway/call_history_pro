'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, isToday, isYesterday, startOfDay, subDays } from 'date-fns';
import Header from '@/app/components/header';
import CallLog, { type CallGroup } from '@/app/components/call-log';
import PermissionDialog from '@/app/components/permission-dialog';
import { getInitialCalls, getInitialContacts, type Call, type Contact } from '@/lib/data';
import { Phone } from 'lucide-react';

export type DateRange = {
  from: Date;
  to: Date;
};

export default function Home() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState<Call[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [excludedNumbers, setExcludedNumbers] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (permissionsGranted) {
      setCalls(getInitialCalls());
      setContacts(getInitialContacts());
    }
  }, [permissionsGranted]);

  const handleUpdateContactNote = (phoneNumber: string, newNote: string) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.phoneNumber === phoneNumber ? { ...contact, notes: newNote } : contact
      )
    );
  };
  
  const handleUpdateCallNote = (callId: string, newNote: string) => {
    setCalls((prevCalls) =>
      prevCalls.map((call) =>
        call.id === callId ? { ...call, notes: newNote } : call
      )
    );
  };

  const handleExcludeNumber = (phoneNumber: string) => {
    setExcludedNumbers((prev) => [...prev, phoneNumber]);
  };

  const filteredCalls = useMemo(() => {
    if (!dateRange || !dateRange.from) return calls;
    const toDate = dateRange.to || dateRange.from;
    return calls.filter(call => {
      const callDate = call.timestamp;
      return callDate >= startOfDay(dateRange.from) && callDate <= startOfDay(toDate).setHours(23, 59, 59, 999);
    });
  }, [calls, dateRange]);

  const callGroups: CallGroup[] = useMemo(() => {
    const grouped = filteredCalls.reduce((acc, call) => {
      if (excludedNumbers.includes(call.phoneNumber)) {
        return acc;
      }
      if (!acc[call.phoneNumber]) {
        acc[call.phoneNumber] = [];
      }
      acc[call.phoneNumber].push(call);
      return acc;
    }, {} as Record<string, Call[]>);

    return Object.entries(grouped)
      .map(([phoneNumber, callsInGroup]) => {
        const contact = contacts.find(c => c.phoneNumber === phoneNumber);
        callsInGroup.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const lastCall = callsInGroup[0];
        
        return {
          phoneNumber,
          contact,
          calls: callsInGroup,
          lastCall,
          callCount: callsInGroup.length
        };
      })
      .sort((a, b) => b.lastCall.timestamp.getTime() - a.lastCall.timestamp.getTime());
  }, [filteredCalls, contacts, excludedNumbers]);

  const getGroupTitle = useCallback((date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  }, []);
  
  const groupedAndSortedCalls = useMemo(() => {
    return callGroups.reduce((acc, group) => {
      const title = getGroupTitle(group.lastCall.timestamp);
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

  if (!permissionsGranted) {
    return <PermissionDialog onAllow={() => setPermissionsGranted(true)} />;
  }

  return (
    <div className="flex h-full flex-col">
      <Header onDateRangeChange={setDateRange} initialRange={dateRange} />
      <CallLog 
        groupedCalls={groupedAndSortedCalls}
        sortedGroupTitles={sortedGroupTitles}
        onUpdateContactNote={handleUpdateContactNote}
        onUpdateCallNote={handleUpdateCallNote}
        onExcludeNumber={handleExcludeNumber}
        calls={calls}
      />
    </div>
  );
}
