'use client';

import { useState, useEffect } from 'react';
import type { Call } from '@/lib/data';
import type { CallGroup } from './call-log';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PhoneMissed,
  XCircle,
  PhoneOff,
  MoreVertical,
} from 'lucide-react';
import {
  Card,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CallGroupCardProps {
  group: CallGroup;
  onUpdateContactNote: (phoneNumber: string, newNote: string) => void;
  onUpdateCallNote: (callId: string, newNote: string) => void;
  onExcludeNumber: (phoneNumber: string) => void;
}

const callTypeIcons: Record<Call['type'], React.ReactNode> = {
  incoming: <ArrowDownLeft className="h-4 w-4 text-green-500" />,
  outgoing: <ArrowUpRight className="h-4 w-4 text-blue-500" />,
  missed: <PhoneMissed className="h-4 w-4 text-red-500" />,
  rejected: <PhoneOff className="h-4 w-4 text-destructive" />,
};

function formatDuration(seconds: number) {
    if (seconds === 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h > 0 ? `${h}h` : '', m > 0 ? `${m}m` : '', s > 0 ? `${s}s` : '']
        .filter(Boolean)
        .join(' ');
}

function CallDetail({ call, onUpdateCallNote }: { call: Call, onUpdateCallNote: (callId: string, newNote: string) => void }) {
  const [note, setNote] = useState(call.notes || '');

  useEffect(() => {
    setNote(call.notes || '');
  }, [call.notes]);

  const handleSaveNote = () => {
    onUpdateCallNote(call.id, note);
  };
  
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={call.id} className="border-0">
        <AccordionTrigger className="flex w-full items-center justify-between text-xs p-2 hover:no-underline hover:bg-accent/50 rounded-md">
            <div className="flex items-center gap-2">
                {callTypeIcons[call.type]}
                <span className="capitalize">{call.type}</span>
            </div>
            <div className='flex items-center gap-2'>
                <span className="text-muted-foreground">{format(call.timestamp, 'MMM d, h:mm a')}</span>
                <Badge variant="outline" className="hidden sm:inline-flex">{formatDuration(call.duration)}</Badge>
            </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pt-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this specific call..."
              className="min-h-[60px] text-xs"
            />
            <Button onClick={handleSaveNote} size="sm" className="w-full">
              Save Call Note
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}


export function CallGroupCard({ group, onUpdateContactNote, onUpdateCallNote, onExcludeNumber }: CallGroupCardProps) {
  const [contactNote, setContactNote] = useState(group.contact?.notes || '');
  const { toast } = useToast();

  useEffect(() => {
    setContactNote(group.contact?.notes || '');
  }, [group.contact?.notes]);

  const handleSaveContactNote = () => {
    onUpdateContactNote(group.phoneNumber, contactNote);
    toast({
      title: 'Note Saved',
      description: `Your note for ${group.contact?.name || group.phoneNumber} has been updated.`,
    });
  };

  const handleExclude = () => {
    onExcludeNumber(group.phoneNumber);
    toast({
      title: 'Contact Excluded',
      description: `${group.contact?.name || group.phoneNumber} has been removed from the list.`,
    });
  }

  const lastCallTime = formatDistanceToNow(group.lastCall.timestamp, { addSuffix: true });

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]]:bg-accent">
             <div className="flex w-full items-center gap-4 text-left">
                <div className="flex-1">
                    <p className="font-semibold text-foreground">{group.contact?.name || group.phoneNumber}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {callTypeIcons[group.lastCall.type]}
                        <span>{lastCallTime}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{group.callCount} {group.callCount > 1 ? 'calls' : 'call'}</Badge>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={handleExclude}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Exclude
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-4 pb-4">
               <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Call History</h4>
                <div className="max-h-60 overflow-y-auto space-y-1 rounded-lg border bg-background/50 p-1">
                  {group.calls.map(call => (
                    <CallDetail key={call.id} call={call} onUpdateCallNote={onUpdateCallNote} />
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor={`note-${group.phoneNumber}`} className="mb-2 block text-sm font-medium text-foreground">
                    Persistent Note for Contact
                </label>
                <Textarea
                  id={`note-${group.phoneNumber}`}
                  value={contactNote}
                  onChange={(e) => setContactNote(e.target.value)}
                  placeholder="Add a persistent note for this contact..."
                  className="min-h-[80px]"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                    <Button onClick={handleSaveContactNote} className="flex-grow">
                      Save Contact Note
                    </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
