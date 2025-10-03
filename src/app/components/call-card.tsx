'use client';

import { useState, useEffect } from 'react';
import type { Call, Contact } from '@/lib/data';
import Image from 'next/image';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PhoneMissed,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CallCardProps {
  call: Call & { contact?: Contact };
  onUpdateNote: (phoneNumber: string, newNote: string) => void;
}

const callTypeIcons = {
  incoming: <ArrowDownLeft className="h-4 w-4 text-green-500" />,
  outgoing: <ArrowUpRight className="h-4 w-4 text-blue-500" />,
  missed: <PhoneMissed className="h-4 w-4 text-red-500" />,
};

const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('');
};

export function CallCard({ call, onUpdateNote }: CallCardProps) {
  const [note, setNote] = useState(call.contact?.notes || '');
  const { toast } = useToast();

  useEffect(() => {
    setNote(call.contact?.notes || '');
  }, [call.contact?.notes]);

  const handleSaveNote = () => {
    onUpdateNote(call.phoneNumber, note);
    toast({
      title: 'Note Saved',
      description: `Your note for ${call.contact?.name || call.phoneNumber} has been updated.`,
    });
  };
  
  const callTime = formatDistanceToNow(call.timestamp, { addSuffix: true });
  const fullDate = format(call.timestamp, 'PPpp');
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]]:bg-accent">
             <div className="flex w-full items-center gap-4 text-left">
                <Avatar>
                    {call.contact?.avatar?.imageUrl ? (
                        <AvatarImage src={call.contact.avatar.imageUrl} alt={call.contact.name} data-ai-hint={call.contact.avatar.imageHint} />
                    ) : null}
                    <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(call.contact?.name || '?')}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold text-foreground">{call.contact?.name || call.phoneNumber}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {callTypeIcons[call.type]}
                        <span>{call.contact?.name ? call.phoneNumber : callTime}</span>
                    </div>
                </div>
                <div className="hidden text-right text-sm text-muted-foreground sm:block">
                  <p>{callTime}</p>
                </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-4 pb-4">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-sm font-medium text-foreground">Call Details</p>
                <p className="text-sm text-muted-foreground">
                  {fullDate}
                </p>
              </div>
              <div>
                <label htmlFor={`note-${call.id}`} className="mb-2 block text-sm font-medium text-foreground">
                    Persistent Note for this Number
                </label>
                <Textarea
                  id={`note-${call.id}`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note for this contact..."
                  className="min-h-[80px]"
                />
                <Button onClick={handleSaveNote} className="mt-2 w-full sm:w-auto">
                  Save Note
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
