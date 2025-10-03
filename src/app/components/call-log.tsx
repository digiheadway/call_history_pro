
'use client';

import type { Caller, Call } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CallGroupCard } from '@/app/components/call-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { usePersistentScroll } from '@/hooks/use-persistent-scroll';

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
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CallGroupList = ({
  groups,
  onUpdateContactNote,
  onUpdateCallNote,
  onExcludeNumber,
  sortedGroupTitles,
  setCallsByPhone,
  tab,
  scrollAreaRef
}: {
  groups: Record<string, CallGroup[]>;
  sortedGroupTitles: string[];
  onUpdateContactNote: (callerId: string, newNote: string) => void;
  onUpdateCallNote: (callId: string, newNote: string) => void;
  onExcludeNumber: (callerId: string) => void;
  setCallsByPhone: React.Dispatch<React.SetStateAction<Record<string, Call[]>>>;
  tab: string;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}) => {
  const hasCalls = sortedGroupTitles.some(title => groups[title] && groups[title].length > 0);

  return (
    <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
      <div className="space-y-4 p-4 pt-2">
        {hasCalls ? (
          sortedGroupTitles.map(title => (
            groups[title] && groups[title].length > 0 && (
              <div key={title}>
                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
                  <Separator className="flex-1" />
                </div>
                <div className="mt-2 space-y-2">
                  {groups[title].map(group => (
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
            )
          ))
        ) : <NoCallsMessage tab={tab} />}
      </div>
    </ScrollArea>
  );
};


const NoCallsMessage = ({ tab }: { tab: string }) => (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      <p>No {tab.toLowerCase()} calls in the selected date range</p>
    </div>
);

export default function CallLog({ 
    groupedCalls, 
    sortedGroupTitles, 
    onUpdateContactNote, 
    onUpdateCallNote, 
    onExcludeNumber, 
    allCallers,
    setCallsByPhone,
    activeTab,
    setActiveTab
}: CallLogProps) {
  
  const scrollRef = usePersistentScroll('scrollPos');

  const allGroups = useMemo(() => sortedGroupTitles.flatMap(title => groupedCalls[title] || []), [groupedCalls, sortedGroupTitles]);

  const missedGroups = useMemo(() => {
    // A call was missed, and the user never called that number back.
    return allGroups.filter(group => {
      const wasMissed = group.caller.last_call_type === 'missed';
      const hasOutgoing = allCallers.some(c => c.phone === group.caller.phone && c.last_call_type === 'outgoing');
      return wasMissed && !hasOutgoing;
    });
  }, [allGroups, allCallers]);


  const neverAttendedGroups = useMemo(() => {
    // The user missed a call from a number, and although they may have called back, they never connected
    return allGroups.filter(group => {
      const hasMissed = group.calls.some(c => c.type === 'missed');
      if (!hasMissed) return false;
      
      const hasConnectedCall = group.calls.some(c => (c.type === 'incoming' || c.type === 'outgoing') && c.duration > 0);
      return !hasConnectedCall;
    });
  }, [allGroups]);

  const rejectedGroups = useMemo(() => {
    // The user rejected a call and never attempted to call that number back.
    return allGroups.filter(group => {
       const wasRejected = group.caller.last_call_type === 'rejected';
       const hasOutgoing = allCallers.some(c => c.phone === group.caller.phone && c.last_call_type === 'outgoing');
       return wasRejected && !hasOutgoing;
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-4 overflow-x-auto">
        <TabsList className="bg-primary/10">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="missed">Missed</TabsTrigger>
          <TabsTrigger value="never-attended">Never Attended</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all" className="flex-1 overflow-hidden">
        <CallGroupList 
            groups={groupedCalls} 
            sortedGroupTitles={sortedGroupTitles} 
            onUpdateContactNote={onUpdateContactNote} 
            onUpdateCallNote={onUpdateCallNote} 
            onExcludeNumber={onExcludeNumber}
            setCallsByPhone={setCallsByPhone}
            tab="All"
            scrollAreaRef={scrollRef}
        />
      </TabsContent>
      <TabsContent value="missed" className="flex-1 overflow-hidden">
         <CallGroupList 
            groups={groupedMissed} 
            sortedGroupTitles={sortedMissedTitles}
            onUpdateContactNote={onUpdateContactNote} 
            onUpdateCallNote={onUpdateCallNote} 
            onExcludeNumber={onExcludeNumber}
            setCallsByPhone={setCallsByPhone}
            tab="Missed"
            scrollAreaRef={scrollRef}
        />
      </TabsContent>
       <TabsContent value="never-attended" className="flex-1 overflow-hidden">
         <CallGroupList 
            groups={groupedNeverAttended} 
            sortedGroupTitles={sortedNeverAttendedTitles}
            onUpdateContactNote={onUpdateContactNote} 
            onUpdateCallNote={onUpdateCallNote} 
            onExcludeNumber={onExcludeNumber}
            setCallsByPhone={setCallsByPhone}
            tab="Never Attended"
            scrollAreaRef={scrollRef}
        />
      </TabsContent>
       <TabsContent value="rejected" className="flex-1 overflow-hidden">
        <CallGroupList 
            groups={groupedRejected} 
            sortedGroupTitles={sortedRejectedTitles}
            onUpdateContactNote={onUpdateContactNote} 
            onUpdateCallNote={onUpdateCallNote} 
            onExcludeNumber={onExcludeNumber}
            setCallsByPhone={setCallsByPhone}
            tab="Rejected"
            scrollAreaRef={scrollRef}
        />
      </TabsContent>
    </Tabs>
  );
}
