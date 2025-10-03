'use client';

import type { Call, Contact } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CallCard } from '@/app/components/call-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from 'react';

interface CallLogProps {
  calls: Call[];
  contacts: Contact[];
  onUpdateNote: (phoneNumber: string, newNote: string) => void;
}

export default function CallLog({ calls, contacts, onUpdateNote }: CallLogProps) {
  const mergedCalls = useMemo(() => {
    return calls
      .map(call => {
        const contact = contacts.find(c => c.phoneNumber === call.phoneNumber);
        return { ...call, contact };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [calls, contacts]);

  const missedCalls = useMemo(() => mergedCalls.filter(call => call.type === 'missed'), [mergedCalls]);

  return (
    <Tabs defaultValue="all" className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-4">
        <TabsList className="grid w-full grid-cols-2 bg-primary/10">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="missed">Missed</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4 pt-2">
            {mergedCalls.map(call => (
              <CallCard key={call.id} call={call} onUpdateNote={onUpdateNote} />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="missed" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4 pt-2">
            {missedCalls.length > 0 ? (
                missedCalls.map(call => (
                    <CallCard key={call.id} call={call} onUpdateNote={onUpdateNote} />
                ))
            ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <p>No missed calls</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
