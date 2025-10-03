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

interface CallGroupCardProps {
  group: CallGroup;
  onUpdateNote: (phoneNumber: string, newNote: string) => void;
  onExcludeNumber: (phoneNumber: string) => void;
}

const callTypeIcons: Record<Call['type'], React.ReactNode> = {
  incoming: <ArrowDownLeft className="h-4 w-4 text-green-500" />,
  outgoing: <ArrowUpRight className="h-4 w-4 text-blue-500" />,
  missed: <PhoneMissed className="h-4 w-4 text-red-500" />,
  rejected: <PhoneOff className="h-4 w-4 text-destructive" />,
};

export function CallGroupCard({ group, onUpdateNote, onExcludeNumber }: CallGroupCardProps) {
  const [note, setNote] = useState(group.contact?.notes || '');
  const { toast } = useToast();

  useEffect(() => {
    setNote(group.contact?.notes || '');
  }, [group.contact?.notes]);

  const handleSaveNote = () => {
    onUpdateNote(group.phoneNumber, note);
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
                <div className="text-right">
                  <Badge variant="secondary">{group.callCount} {group.callCount > 1 ? 'calls' : 'call'}</Badge>
                </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-4 pb-4">
               <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Call History</h4>
                <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg border bg-background/50 p-2">
                  {group.calls.map(call => (
                    <div key={call.id} className="flex items-center justify-between text-xs">
                       <div className="flex items-center gap-2">
                        {callTypeIcons[call.type]}
                        <span className="capitalize">{call.type}</span>
                       </div>
                       <span className="text-muted-foreground">{format(call.timestamp, 'MMM d, h:mm a')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor={`note-${group.phoneNumber}`} className="mb-2 block text-sm font-medium text-foreground">
                    Persistent Note
                </label>
                <Textarea
                  id={`note-${group.phoneNumber}`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note for this contact..."
                  className="min-h-[80px]"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                    <Button onClick={handleSaveNote} className="flex-grow">
                      Save Note
                    </Button>
                    <Button onClick={handleExclude} variant="outline" className="flex-grow">
                      <XCircle className="mr-2 h-4 w-4" />
                      Exclude
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
