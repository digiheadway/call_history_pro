
import { CallGroup } from "@/app/components/call-log";

export interface Caller {
  id: string;
  phone: string;
  note: string | null;
  calls: number;
  last_call: string;
  last_call_type: 'incoming' | 'outgoing' | 'missed' | 'rejected';
  last_call_duration: number;
  excluded: boolean;
  lead_id: string | null;
  lead_name: string | null;
  segment: string | null;
  budget: string | null;
}

export interface Call {
  id: string;
  phone: string;
  note: string | null;
  duration: number;
  type: 'incoming' | 'outgoing' | 'missed' | 'rejected';
  recording_url: string | null;
  created_ts: string;
}

export type DateRange = {
  from: Date;
  to: Date;
};

export type GroupedCalls = Record<string, {
    groups: CallGroup[];
    callCount: number;
    callerCount: number;
}>;

    