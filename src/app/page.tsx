'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/app/components/header';
import CallLog, { type CallGroup } from '@/app/components/call-log';
import PermissionDialog from '@/app/components/permission-dialog';
import { getInitialCalls, getInitialContacts, type Call, type Contact } from '@/lib/data';
import { Phone } from 'lucide-react';

export default function Home() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState<Call[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [excludedNumbers, setExcludedNumbers] = useState<string[]>([]);

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

  const handleExcludeNumber = (phoneNumber: string) => {
    setExcludedNumbers((prev) => [...prev, phoneNumber]);
  };

  const callGroups: CallGroup[] = useMemo(() => {
    const grouped = calls.reduce((acc, call) => {
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
  }, [calls, contacts, excludedNumbers]);
  
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
      <Header />
      <CallLog 
        callGroups={callGroups} 
        onUpdateNote={handleUpdateContactNote}
        onExcludeNumber={handleExcludeNumber}
      />
    </div>
  );
}
