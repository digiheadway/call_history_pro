
'use client';

import type { Caller, Call, GroupedCalls } from '@/lib/types';
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
  groupedCalls: GroupedCalls;
  sortedGroupTitles: string[];
  onUpdateContactNote: (callerId: string, newNote: string) => void;
  onUpdateCallNote: (callId: string, newNote: string) => void;
  onExcludeNumber: (callerId: string) => void;
  allCallers: Caller[];
  setCallsByPhone: React.Dispatch<React.SetStateAction<Record<string, Call[]>>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expandedAccordions: string[];
  toggleAccordion: (id: string) => void;
  currentlyPlaying: string | null;
  setCurrentlyPlaying: (id: string | null) => void;
}

const CallGroupList = ({
  groups,
  sortedGroupTitles,
  onUpdateContactNote,
  onUpdateCallNote,
  onExcludeNumber,
  setCallsByPhone,
  tab,
  scrollAreaRef,
  expandedAccordions,
  toggleAccordion,
  currentlyPlaying,
  setCurrentlyPlaying
}: {
  groups: GroupedCalls;
  sortedGroupTitles: string[];
  onUpdateContactNote: (callerId: string, newNote: string) => void;
  onUpdateCallNote: (callId: string, newNote: string) => void;
  onExcludeNumber: (callerId: string) => void;
  setCallsByPhone: React.Dispatch<React.SetStateAction<Record<string, Call[]>>>;
  tab: string;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  expandedAccordions: string[];
  toggleAccordion: (id: string) => void;
  currentlyPlaying: string | null;
  setCurrentlyPlaying: (id: string | null) => void;
}) => {
  const hasCalls = sortedGroupTitles.some(title => groups[title] && groups[title].groups.length > 0);

  return (
    <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
      <div className="space-y-4 p-4 pt-2">
        {hasCalls ? (
          sortedGroupTitles.map(title => {
            const groupInfo = groups[title];
            if (!groupInfo || groupInfo.groups.length === 0) return null;
            
            const titleText = title.startsWith('Today') || title.startsWith('Yesterday') 
              ? title.split(' (')[0]
              : title;
            const stats = `(${groupInfo.callCount}/${groupInfo.callerCount})`;

            return (
              <div key={title}>
                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <h3 className="whitespace-nowrap text-xs font-medium text-muted-foreground">{titleText} <span className="font-normal">{stats}</span></h3>
                  <Separator className="flex-1" />
                </div>
                <div className="mt-2 space-y-2">
                  {groupInfo.groups.map(group => (
                    <CallGroupCard
                      key={group.caller.id}
                      group={group}
                      onUpdateContactNote={onUpdateContactNote}
                      onUpdateCallNote={onUpdateCallNote}
                      onExcludeNumber={onExcludeNumber}
                      setCallsByPhone={setCallsByPhone}
                      isExpanded={expandedAccordions.includes(group.caller.id)}
                      onToggleExpand={() => toggleAccordion(group.caller.id)}
                      currentlyPlaying={currentlyPlaying}
                      setCurrentlyPlaying={setCurrentlyPlaying}
                    />
                  ))}
                </div>
              </div>
            )
          })
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
    setActiveTab,
    expandedAccordions,
    toggleAccordion,
    currentlyPlaying,
    setCurrentlyPlaying
}: CallLogProps) {
  
  const scrollRef = usePersistentScroll('callLogScroll');

  const allGroups = useMemo(() => sortedGroupTitles.flatMap(title => groupedCalls[title]?.groups || []), [groupedCalls, sortedGroupTitles]);

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

  const maybePendingGroups = useMemo(() => {
    // Last call duration is below 7 seconds.
    return allGroups.filter(group => group.caller.last_call_duration < 7);
  }, [allGroups]);
  
  const filterGroupsByTitle = (groups: CallGroup[]) => {
    const titleMap: Record<string, CallGroup[]> = {};
    for (const title of sortedGroupTitles) {
        const titleGroups = groupedCalls[title]?.groups || [];
        for (const group of groups) {
            if (titleGroups.some(g => g.caller.id === group.caller.id)) {
                if (!titleMap[title]) {
                    titleMap[title] = [];
                }
                titleMap[title].push(group);
            }
        }
    }

    const result: GroupedCalls = {};
    for(const title in titleMap) {
        const subGroups = titleMap[title];
        result[title] = {
            groups: subGroups,
            callCount: subGroups.reduce((acc, g) => acc + g.caller.calls_in_range, 0),
            callerCount: subGroups.length
        }
    }
    return result;
  };

  const getSortedTitlesForGroups = (groups: CallGroup[]) => {
      const titles = new Set(groups.map(g => sortedGroupTitles.find(title => groupedCalls[title]?.groups.includes(g))).filter(Boolean) as string[]);
      return sortedGroupTitles.filter(t => titles.has(t));
  };
  
  const connectedGroups = useMemo(() => {
    const excludedGroupIds = new Set([
      ...missedGroups.map(g => g.caller.id),
      ...rejectedGroups.map(g => g.caller.id),
      ...neverAttendedGroups.map(g => g.caller.id),
      ...maybePendingGroups.map(g => g.caller.id)
    ]);
    return allGroups.filter(g => !excludedGroupIds.has(g.caller.id));
  }, [allGroups, missedGroups, rejectedGroups, neverAttendedGroups, maybePendingGroups]);

  const groupedConnected = useMemo(() => filterGroupsByTitle(connectedGroups), [connectedGroups, sortedGroupTitles, groupedCalls]);
  const sortedConnectedTitles = useMemo(() => getSortedTitlesForGroups(connectedGroups), [connectedGroups, sortedGroupTitles, groupedCalls]);

  const groupedMissed = useMemo(() => filterGroupsByTitle(missedGroups), [missedGroups, sortedGroupTitles, groupedCalls]);
  const sortedMissedTitles = useMemo(() => getSortedTitlesForGroups(missedGroups), [missedGroups, sortedGroupTitles, groupedCalls]);

  const groupedRejected = useMemo(() => filterGroupsByTitle(rejectedGroups), [rejectedGroups, sortedGroupTitles, groupedCalls]);
  const sortedRejectedTitles = useMemo(() => getSortedTitlesForGroups(rejectedGroups), [rejectedGroups, sortedGroupTitles, groupedCalls]);
  
  const groupedNeverAttended = useMemo(() => filterGroupsByTitle(neverAttendedGroups), [neverAttendedGroups, sortedGroupTitles, groupedCalls]);
  const sortedNeverAttendedTitles = useMemo(() => getSortedTitlesForGroups(neverAttendedGroups), [neverAttendedGroups, sortedGroupTitles, groupedCalls]);

  const groupedMaybePending = useMemo(() => filterGroupsByTitle(maybePendingGroups), [maybePendingGroups, sortedGroupTitles, groupedCalls]);
  const sortedMaybePendingTitles = useMemo(() => getSortedTitlesForGroups(maybePendingGroups), [maybePendingGroups, sortedGroupTitles, groupedCalls]);


  const listProps = { onUpdateContactNote, onUpdateCallNote, onExcludeNumber, setCallsByPhone, scrollAreaRef: scrollRef, expandedAccordions, toggleAccordion, currentlyPlaying, setCurrentlyPlaying };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
      <div className="overflow-x-auto px-4 pt-4">
        <div className="inline-block">
          <TabsList className="bg-primary/10">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="connected">Connected</TabsTrigger>
            <TabsTrigger value="missed">Missed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="never-attended">Never Attended</TabsTrigger>
            <TabsTrigger value="maybe-pending">May be Pending</TabsTrigger>
          </TabsList>
        </div>
      </div>
      <TabsContent value="all" className="flex-1 overflow-hidden">
        <CallGroupList 
            groups={groupedCalls} 
            sortedGroupTitles={sortedGroupTitles} 
            tab="All"
            {...listProps}
        />
      </TabsContent>
       <TabsContent value="connected" className="flex-1 overflow-hidden">
         <CallGroupList 
            groups={groupedConnected} 
            sortedGroupTitles={sortedConnectedTitles}
            tab="Connected"
            {...listProps}
        />
      </TabsContent>
      <TabsContent value="missed" className="flex-1 overflow-hidden">
         <CallGroupList 
            groups={groupedMissed} 
            sortedGroupTitles={sortedMissedTitles}
            tab="Missed"
            {...listProps}
        />
      </TabsContent>
       <TabsContent value="never-attended" className="flex-1 overflow-hidden">
         <CallGroupList 
            groups={groupedNeverAttended} 
            sortedGroupTitles={sortedNeverAttendedTitles}
            tab="Never Attended"
            {...listProps}
        />
      </TabsContent>
       <TabsContent value="rejected" className="flex-1 overflow-hidden">
        <CallGroupList 
            groups={groupedRejected} 
            sortedGroupTitles={sortedRejectedTitles}
            tab="Rejected"
            {...listProps}
        />
      </TabsContent>
       <TabsContent value="maybe-pending" className="flex-1 overflow-hidden">
        <CallGroupList 
            groups={groupedMaybePending} 
            sortedGroupTitles={sortedMaybePendingTitles}
            tab="May be Pending"
            {...listProps}
        />
      </TabsContent>
    </Tabs>
  );
}
