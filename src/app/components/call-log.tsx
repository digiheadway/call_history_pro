'use client';

import type { Caller, Call } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CallGroupCard } from '@/app/components/call-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';

export interface CallGroup {
  caller: Caller;
  calls: Call[];
  lastCallTimestamp: Date;
}

interface CallLogProps {
  groupedCalls: Record<string, CallGroup[]>;
  sortedGroupTitles: string[];
  onUpdateContactNote: (callerId: string, newNote: string) => void;
  onUpdateCallNote: (callId: string, newNote: string) => void;
  onExcludeNumber: (callerId: string) => void;
  allCallers: Caller[];
  setCallsByPhone: React.Dispatch<React.SetStateAction<Record<string, Call[]>>>;
}

const CallGroupList = ({
  groups,
  onUpdateContactNote,
  onUpdateCallNote,
  onExcludeNumber,
  sortedGroupTitles,
  setCallsByPhone,
}: {
  groups: Record<string, CallGroup[]>;
  sortedGroupTitles: string[];
  onUpdateContactNote: (callerId: string, newNote: string) => void;
  onUpdateCallNote: (callId: string, newNote: string) => void;
  onExcludeNumber: (callerId: string) => void;
  setCallsByPhone: React.Dispatch<React.SetStateAction<Record<string, Call[]>>>;
}) => (
  <div className="space-y-4 p-4 pt-2">
    {sortedGroupTitles.length > 0 ? (
      sortedGroupTitles.map(title => (
        <div key={title}>
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
            <Separator className="flex-1" />
          </div>
          <div className="mt-2 space-y-2">
            {groups[title]?.map(group => (
              <CallGroupCard
                key={group.caller.id}
                group={group}
                onUpdateContactNote={onUpdateContactNote}
                onUpdateCallNote={onUpdateCallNote}
                onExcludeNumber={onExcludeNumber}
                setCallsByPhone={setCallsByPhone}
              />
            ))}
          </div>
        </div>
      ))
    ) : <NoCallsMessage tab="selected" />}
  </div>
);

const NoCallsMessage = ({ tab }: { tab: string }) => (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      <p>No {tab} calls in the selected date range</p>
    </div>
);

export default function CallLog({ 
    groupedCalls, 
    sortedGroupTitles, 
    onUpdateContactNote, 
    onUpdateCallNote, 
    onExcludeNumber, 
    allCallers,
    setCallsByPhone
}: CallLogProps) {
  
  const allGroups = useMemo(() => sortedGroupTitles.flatMap(title => groupedCalls[title] || []), [groupedCalls, sortedGroupTitles]);

  const missedGroups = useMemo(() => allGroups.filter(group => 
    group.caller.last_call_type === 'missed'
  ), [allGroups]);

  const rejectedGroups = useMemo(() => allGroups.filter(group => 
     group.caller.last_call_type === 'rejected'
  ), [allGroups]);
  
  const neverAttendedGroups = useMemo(() => {
    return allGroups.filter(group => {
      // Logic based on your API structure might be different.
      // Assuming a `calls` field on the caller object. If not, this needs adjustment.
      const hasAnswered = allCallers
        .find(c => c.id === group.caller.id)
        ?.calls > 0; // Simplified logic, assuming `calls` count implies answered calls.
      return !hasAnswered && group.caller.last_call_type === 'missed';
    });
  }, [allGroups, allCallers]);


  const filterGroupsByTitle = (groups: CallGroup[]) => {
    return groups.reduce((acc, group) => {
      const title = sortedGroupTitles.find(title => groupedCalls[title]?.includes(group));
      if (title) {
        if (!acc[title]) {
          acc[title] = [];
        }
        acc[title].push(group);
      }
      return acc;
    }, {} as Record<string, CallGroup[]>);
  };
  
  const getSortedTitlesForGroups = (groups: CallGroup[]) => {
      const titles = new Set(groups.map(g => sortedGroupTitles.find(title => groupedCalls[title]?.includes(g))).filter(Boolean) as string[]);
      return sortedGroupTitles.filter(t => titles.has(t));
  };

  const groupedMissed = useMemo(() => filterGroupsByTitle(missedGroups), [missedGroups, sortedGroupTitles, groupedCalls]);
  const sortedMissedTitles = useMemo(() => getSortedTitlesForGroups(missedGroups), [missedGroups, sortedGroupTitles, groupedCalls]);

  const groupedRejected = useMemo(() => filterGroupsByTitle(rejectedGroups), [rejectedGroups, sortedGroupTitles, groupedCalls]);
  const sortedRejectedTitles = useMemo(() => getSortedTitlesForGroups(rejectedGroups), [rejectedGroups, sortedGroupTitles, groupedCalls]);
  
  const groupedNeverAttended = useMemo(() => filterGroupsByTitle(neverAttendedGroups), [neverAttendedGroups, sortedGroupTitles, groupedCalls]);
  const sortedNeverAttendedTitles = useMemo(() => getSortedTitlesForGroups(neverAttendedGroups), [neverAttendedGroups, sortedGroupTitles, groupedCalls]);


  return (
    <Tabs defaultValue="all" className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-4 overflow-x-auto">
        <TabsList className="bg-primary/10">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="missed">Missed</TabsTrigger>
          <TabsTrigger value="never-attended">Never Attended</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
            <CallGroupList 
                groups={groupedCalls} 
                sortedGroupTitles={sortedGroupTitles} 
                onUpdateContactNote={onUpdateContactNote} 
                onUpdateCallNote={onUpdateCallNote} 
                onExcludeNumber={onExcludeNumber}
                setCallsByPhone={setCallsByPhone}
            />
        </ScrollArea>
      </TabsContent>
      <TabsContent value="missed" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
             <CallGroupList 
                groups={groupedMissed} 
                sortedGroupTitles={sortedMissedTitles}
                onUpdateContactNote={onUpdateContactNote} 
                onUpdateCallNote={onUpdateCallNote} 
                onExcludeNumber={onExcludeNumber}
                setCallsByPhone={setCallsByPhone}
            />
        </ScrollArea>
      </TabsContent>
       <TabsContent value="never-attended" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
             <CallGroupList 
                groups={groupedNeverAttended} 
                sortedGroupTitles={sortedNeverAttendedTitles}
                onUpdateContactNote={onUpdateContactNote} 
                onUpdateCallNote={onUpdateCallNote} 
                onExcludeNumber={onExcludeNumber}
                setCallsByPhone={setCallsByPhone}
            />
        </ScrollArea>
      </TabsContent>
       <TabsContent value="rejected" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
            <CallGroupList 
                groups={groupedRejected} 
                sortedGroupTitles={sortedRejectedTitles}
                onUpdateContactNote={onUpdateContactNote} 
                onUpdateCallNote={onUpdateCallNote} 
                onExcludeNumber={onExcludeNumber}
                setCallsByPhone={setCallsByPhone}
            />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
