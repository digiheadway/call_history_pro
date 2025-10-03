'use client';

import type { Call, Contact } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CallGroupCard } from '@/app/components/call-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from 'react';

export interface CallGroup {
  phoneNumber: string;
  contact?: Contact;
  calls: Call[];
  lastCall: Call;
  callCount: number;
}

interface CallLogProps {
  callGroups: CallGroup[];
  onUpdateContactNote: (phoneNumber: string, newNote: string) => void;
  onUpdateCallNote: (callId: string, newNote: string) => void;
  onExcludeNumber: (phoneNumber: string) => void;
}

export default function CallLog({ callGroups, onUpdateContactNote, onUpdateCallNote, onExcludeNumber }: CallLogProps) {
  
  const missedGroups = useMemo(() => callGroups.filter(group => 
    group.calls.some(call => call.type === 'missed')
  ), [callGroups]);

  const rejectedGroups = useMemo(() => callGroups.filter(group => 
    group.calls.some(call => call.type === 'rejected')
  ), [callGroups]);

  const NoCallsMessage = ({ tab }: { tab: string }) => (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      <p>No {tab} calls</p>
    </div>
  );

  return (
    <Tabs defaultValue="all" className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-4">
        <TabsList className="grid w-full grid-cols-3 bg-primary/10">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="missed">Missed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4 pt-2">
            {callGroups.length > 0 ? (
              callGroups.map(group => (
                <CallGroupCard key={group.phoneNumber} group={group} onUpdateContactNote={onUpdateContactNote} onUpdateCallNote={onUpdateCallNote} onExcludeNumber={onExcludeNumber} />
              ))
            ) : <NoCallsMessage tab="all" />}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="missed" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4 pt-2">
            {missedGroups.length > 0 ? (
                missedGroups.map(group => (
                    <CallGroupCard key={group.phoneNumber} group={group} onUpdateContactNote={onUpdateContactNote} onUpdateCallNote={onUpdateCallNote} onExcludeNumber={onExcludeNumber} />
                ))
            ) : <NoCallsMessage tab="missed" />}
          </div>
        </ScrollArea>
      </TabsContent>
       <TabsContent value="rejected" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4 pt-2">
            {rejectedGroups.length > 0 ? (
                rejectedGroups.map(group => (
                    <CallGroupCard key={group.phoneNumber} group={group} onUpdateContactNote={onUpdateContactNote} onUpdateCallNote={onUpdateCallNote} onExcludeNumber={onExcludeNumber} />
                ))
            ) : <NoCallsMessage tab="rejected" />}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
