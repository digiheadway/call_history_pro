
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
  onUpdateCallerInfo: (callerId: string, info: { custom_name?: string; caller_type?: string }) => void;
  onExcludeNumber: (callerId: string) => void;
  onMarkSynced: (callerId: string, currentStatus: boolean) => void;
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
  onUpdateCallerInfo,
  onExcludeNumber,
  onMarkSynced,
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
  onUpdateCallerInfo: (callerId: string, info: { custom_name?: string; caller_type?: string }) => void;
  onExcludeNumber: (callerId: string) => void;
  onMarkSynced: (callerId: string, currentStatus: boolean) => void;
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
                      onUpdateCallerInfo={onUpdateCallerInfo}
                      onExcludeNumber={onExcludeNumber}
                      onMarkSynced={onMarkSynced}
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
    onUpdateCallerInfo,
    onExcludeNumber, 
    onMarkSynced,
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
  
  // Connected: duration >= 5s
  const connectedGroups = useMemo(() => allGroups.filter(g => g.caller.last_call_duration >= 5), [allGroups]);
  const connectedIds = useMemo(() => new Set(connectedGroups.map(g => g.caller.id)), [connectedGroups]);

  // Missed: (last_call_type=missed, duration=0) OR (last_call_type=incoming, 0 < duration < 5)
  const missedGroups = useMemo(() => allGroups.filter(g => 
    (g.caller.last_call_type === 'missed' && g.caller.last_call_duration === 0) ||
    (g.caller.last_call_type === 'incoming' && g.caller.last_call_duration > 0 && g.caller.last_call_duration < 5)
  ), [allGroups]);
  const missedIds = useMemo(() => new Set(missedGroups.map(g => g.caller.id)), [missedGroups]);

  // Rejected: last_call=incoming, type=rejected
  const rejectedGroups = useMemo(() => allGroups.filter(g => g.caller.last_call_type === 'rejected'), [allGroups]);
  const rejectedIds = useMemo(() => new Set(rejectedGroups.map(g => g.caller.id)), [rejectedGroups]);
  
  // Outgoing Failed: last_call=outgoing, duration < 5
  const outgoingFailedGroups = useMemo(() => {
    return allGroups.filter(g => {
      const isOutgoingFailed = g.caller.last_call_type === 'outgoing' && g.caller.last_call_duration < 5;
      return isOutgoingFailed && !connectedIds.has(g.caller.id);
    });
  }, [allGroups, connectedIds]);
  const outgoingFailedIds = useMemo(() => new Set(outgoingFailedGroups.map(g => g.caller.id)), [outgoingFailedGroups]);

  const phoneNumbersWithConnection = useMemo(() => {
    // This looks at all callers ever, not just in the current date range
    return new Set(allCallers.filter(c => c.last_call_duration >= 5).map(c => c.phone));
  }, [allCallers]);
  
  // Never Attended: total calls >= 2, last call is Outgoing Failed, and no connected call EVER for this phone number
  const neverAttendedGroups = useMemo(() => {
    return allGroups.filter(g => {
      if (g.caller.calls < 2) return false;
      if (phoneNumbersWithConnection.has(g.caller.phone)) return false;
      return outgoingFailedIds.has(g.caller.id);
    });
  }, [allGroups, phoneNumbersWithConnection, outgoingFailedIds]);
  const neverAttendedIds = useMemo(() => new Set(neverAttendedGroups.map(g => g.caller.id)), [neverAttendedGroups]);

  // May Be Pending: last_call=incoming, duration 0-4s, and not in other specific categories
  const mayBePendingGroups = useMemo(() => {
    return allGroups.filter(g => {
      const isMayBePending = g.caller.last_call_type === 'incoming' && g.caller.last_call_duration >= 0 && g.caller.last_call_duration < 5;
      return isMayBePending && !missedIds.has(g.caller.id) && !rejectedIds.has(g.caller.id) && !connectedIds.has(g.caller.id) && !neverAttendedIds.has(g.caller.id);
    });
  }, [allGroups, missedIds, rejectedIds, connectedIds, neverAttendedIds]);


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
      const titles = new Set<string>();
      for (const group of groups) {
          const foundTitle = sortedGroupTitles.find(title => 
              groupedCalls[title]?.groups.some(g => g.caller.id === group.caller.id)
          );
          if (foundTitle) {
              titles.add(foundTitle);
          }
      }
      return sortedGroupTitles.filter(t => titles.has(t));
  };
  
  const groupedConnected = useMemo(() => filterGroupsByTitle(connectedGroups), [connectedGroups, sortedGroupTitles, groupedCalls]);
  const sortedConnectedTitles = useMemo(() => getSortedTitlesForGroups(connectedGroups), [connectedGroups, sortedGroupTitles, groupedCalls]);

  const groupedMissed = useMemo(() => filterGroupsByTitle(missedGroups), [missedGroups, sortedGroupTitles, groupedCalls]);
  const sortedMissedTitles = useMemo(() => getSortedTitlesForGroups(missedGroups), [missedGroups, sortedGroupTitles, groupedCalls]);

  const groupedRejected = useMemo(() => filterGroupsByTitle(rejectedGroups), [rejectedGroups, sortedGroupTitles, groupedCalls]);
  const sortedRejectedTitles = useMemo(() => getSortedTitlesForGroups(rejectedGroups), [rejectedGroups, sortedGroupTitles, groupedCalls]);
    
  const groupedOutgoingFailed = useMemo(() => filterGroupsByTitle(outgoingFailedGroups), [outgoingFailedGroups, sortedGroupTitles, groupedCalls]);
  const sortedOutgoingFailedTitles = useMemo(() => getSortedTitlesForGroups(outgoingFailedGroups), [outgoingFailedGroups, sortedGroupTitles, groupedCalls]);
  
  const groupedNeverAttended = useMemo(() => filterGroupsByTitle(neverAttendedGroups), [neverAttendedGroups, sortedGroupTitles, groupedCalls]);
  const sortedNeverAttendedTitles = useMemo(() => getSortedTitlesForGroups(neverAttendedGroups), [neverAttendedGroups, sortedGroupTitles, groupedCalls]);
  
  const groupedMayBePending = useMemo(() => filterGroupsByTitle(mayBePendingGroups), [mayBePendingGroups, sortedGroupTitles, groupedCalls]);
  const sortedMayBePendingTitles = useMemo(() => getSortedTitlesForGroups(mayBePendingGroups), [mayBePendingGroups, sortedGroupTitles, groupedCalls]);


  const listProps = { onUpdateContactNote, onUpdateCallNote, onUpdateCallerInfo, onExcludeNumber, onMarkSynced, setCallsByPhone, scrollAreaRef: scrollRef, expandedAccordions, toggleAccordion, currentlyPlaying, setCurrentlyPlaying };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
      <div className="overflow-x-auto px-4 pt-4">
        <div className="inline-block">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="connected">Connected</TabsTrigger>
            <TabsTrigger value="missed">Missed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="outgoing-failed">Outgoing Failed</TabsTrigger>
            <TabsTrigger value="never-attended">Never Attended</TabsTrigger>
            <TabsTrigger value="may-be-pending">May Be Pending</TabsTrigger>
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
      <TabsContent value="rejected" className="flex-1 overflow-hidden">
        <CallGroupList 
            groups={groupedRejected} 
            sortedGroupTitles={sortedRejectedTitles}
            tab="Rejected"
            {...listProps}
        />
      </TabsContent>
      <TabsContent value="outgoing-failed" className="flex-1 overflow-hidden">
        <CallGroupList 
            groups={groupedOutgoingFailed} 
            sortedGroupTitles={sortedOutgoingFailedTitles}
            tab="Outgoing Failed"
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
      <TabsContent value="may-be-pending" className="flex-1 overflow-hidden">
         <CallGroupList 
            groups={groupedMayBePending}
            sortedGroupTitles={sortedMayBePendingTitles}
            tab="May be Pending"
            {...listProps}
        />
      </TabsContent>
    </Tabs>
  );
}
