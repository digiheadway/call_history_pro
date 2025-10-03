'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/header';
import CallLog from '@/app/components/call-log';
import PermissionDialog from '@/app/components/permission-dialog';
import { getInitialCalls, getInitialContacts, type Call, type Contact } from '@/lib/data';
import { Phone } from 'lucide-react';

export default function Home() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState<Call[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

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
      <CallLog calls={calls} contacts={contacts} onUpdateNote={handleUpdateContactNote} />
    </div>
  );
}
