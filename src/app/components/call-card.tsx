
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Call, Caller } from '@/lib/types';
import { fetchCalls } from '@/lib/api';
import type { CallGroup } from './call-log';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PhoneMissed,
  XCircle,
  PhoneOff,
  MoreVertical,
  Clock,
  Play,
  Pause,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CallGroupCardProps {
  group: CallGroup;
  onUpdateContactNote: (callerId: string, newNote: string) => void;
  onUpdateCallNote: (callId: string, newNote: string) => void;
  onExcludeNumber: (callerId: string) => void;
  setCallsByPhone: React.Dispatch<React.SetStateAction<Record<string, Call[]>>>;
  isExpanded: boolean;
  onToggleExpand: () => void;
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
  return [h > 0 ? `${h}h` : '', m > 0 ? `${m}m` : '', s > 0 ? `${s}s` : ''].filter(Boolean).join(' ');
}

function CallDetail({ call, onUpdateCallNote }: { call: Call; onUpdateCallNote: (callId: string, newNote: string) => void }) {
  const [note, setNote] = useState(call.note || '');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setNote(call.note || '');
  }, [call.note]);

  useEffect(() => {
    let recordingUrl = call.recording_url;
    if (recordingUrl) {
      // Extract the actual audio file from the `af` query parameter
      try {
        const url = new URL(recordingUrl);
        const audioFile = url.searchParams.get('af');
        if (audioFile) {
          recordingUrl = audioFile;
        }
      } catch (e) {
        // Not a valid URL, use it as is
      }
      
      const audio = new Audio(recordingUrl);
      audioRef.current = audio;
      const onEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', onEnded);
      
      return () => {
          audio.pause();
          audio.removeEventListener('ended', onEnded);
      };
    }
  }, [call.recording_url]);

  const handleSaveNote = () => {
    onUpdateCallNote(call.id, note);
  };

  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={call.id} className="border-0">
        <AccordionTrigger className="flex w-full items-center justify-between text-xs p-2 hover:no-underline hover:bg-accent/50 rounded-md">
          <div className="flex items-center gap-2">
            {callTypeIcons[call.type]}
            <span className="capitalize">{call.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{format(new Date(call.created_ts), 'MMM d, h:mm a')}</span>
            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(call.duration)}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pt-2">
            <div className="sm:hidden pb-2">
              <Badge variant="outline" className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(call.duration)}
              </Badge>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this specific call..."
              className="min-h-[60px] text-xs"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveNote} size="sm" className="w-full">
                Save Call Note
              </Button>
              {call.recording_url && (
                <Button onClick={handleTogglePlay} variant="outline" size="sm" className="w-full">
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play Recording'}
                </Button>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function CallGroupCard({ group, onUpdateContactNote, onUpdateCallNote, onExcludeNumber, setCallsByPhone, isExpanded, onToggleExpand }: CallGroupCardProps) {
  const { caller, calls } = group;
  const [contactNote, setContactNote] = useState(caller.note || '');
  const [isLoadingCalls, setIsLoadingCalls] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setContactNote(caller.note || '');
  }, [caller.note]);

  const handleAccordionToggle = async (open: boolean) => {
    onToggleExpand();
    if (open && calls.length === 0) {
      setIsLoadingCalls(true);
      try {
        const fetchedCalls = await fetchCalls({ phone: caller.phone });
        setCallsByPhone(prev => ({ ...prev, [caller.phone]: fetchedCalls }));
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch call history.' });
      } finally {
        setIsLoadingCalls(false);
      }
    }
  };

  const handleSaveContactNote = () => {
    onUpdateContactNote(caller.id, contactNote);
  };

  const handleExclude = () => {
    onExcludeNumber(caller.id);
  };
  
  const getCallerDisplay = () => {
    if (caller.lead_name) {
      const budget = caller.budget ? ` - ${caller.budget}` : '';
      return `${caller.lead_id || ''}. ${caller.lead_name}${budget}`;
    }
    return caller.phone;
  };


  const lastCallTime = formatDistanceToNow(new Date(caller.last_call), { addSuffix: true });
  const notePreview = caller.note ? caller.note.split(' ').slice(0, 7).join(' ') + (caller.note.split(' ').length > 7 ? '...' : '') : '';

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Accordion type="single" collapsible value={isExpanded ? caller.id : ''} onValueChange={(value) => handleAccordionToggle(!!value)}>
        <AccordionItem value={caller.id} className="border-b-0">
          <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]]:bg-accent">
            <div className="flex w-full items-start gap-4 text-left">
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-foreground">{getCallerDisplay()}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {callTypeIcons[caller.last_call_type]}
                  <span>{lastCallTime}</span>
                  {(caller.last_call_type !== 'missed' && caller.last_call_type !== 'rejected') && (
                    <>
                      <span className="text-xs">•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(caller.last_call_duration)}</span>
                      </div>
                    </>
                  )}
                </div>
                {notePreview && <p className="text-xs text-muted-foreground pt-1">{notePreview}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{caller.calls} {caller.calls > 1 ? 'calls' : 'call'}</Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-4 pb-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Call History</h4>
                <div className="max-h-60 overflow-y-auto space-y-1 rounded-lg border bg-background/50 p-1">
                  {isLoadingCalls ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : calls.length > 0 ? (
                    calls.map((call) => <CallDetail key={call.id} call={call} onUpdateCallNote={onUpdateCallNote} />)
                  ) : (
                     <p className="p-4 text-center text-sm text-muted-foreground">No call history found.</p>
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor={`note-${caller.phone}`} className="block text-sm font-medium text-foreground">
                    Persistent Note for {caller.phone}
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExclude} className="text-destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Exclude
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Textarea
                  id={`note-${caller.phone}`}
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

    