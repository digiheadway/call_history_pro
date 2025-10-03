// @ts-nocheck
const API_BASE_URL = 'https://prop.digiheadway.in/api/calls/crm.php';

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

interface FetchParams {
  [key: string]: string | number | boolean | undefined;
}

async function apiRequest<T>(action: string, params: FetchParams, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  const url = new URL(API_BASE_URL);
  const options: RequestInit = {
    method,
  };

  if (method === 'GET') {
    url.searchParams.append('action', action);
    for (const key in params) {
      if (params[key] !== undefined) {
        url.searchParams.append(key, String(params[key]));
      }
    }
  } else { // POST
    url.searchParams.append('action', action);
    const formData = new FormData();
    for (const key in params) {
       if (params[key] !== undefined) {
         formData.append(key, String(params[key]));
       }
    }
    options.body = formData;
  }

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    if (data.status === 'error') {
        throw new Error(`API Error: ${data.message}`);
    }

    if (action === 'fetch_callers' && Array.isArray(data.data)) {
        return data.data.map((caller: any) => ({
            id: caller.caller_id,
            phone: caller.caller_phone,
            last_call: caller.last_call,
            last_call_type: caller.last_call_type,
            last_call_duration: parseInt(caller.last_call_duration, 10),
            note: caller.note,
            excluded: caller.excluded === '1',
            calls: parseInt(caller.calls, 10) || 1,
            lead_id: caller.lead_id,
            lead_name: caller.lead_name,
            segment: caller.segment,
            budget: caller.budget,
        })) as T;
    }
     if (action === 'fetch_calls' && Array.isArray(data.data)) {
        return data.data.map((call: any) => ({
            ...call,
            duration: parseInt(call.duration, 10),
        })) as T;
    }

    return (data.data || data) as T;
  } catch (error) {
    console.error(`API action "${action}" with params ${JSON.stringify(params)} failed:`, error);
    throw error;
  }
}

export function fetchCallers(params: {
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  phone?: string;
  caller_id?: string;
  last_call_type?: 'incoming' | 'outgoing' | 'missed' | 'rejected';
  min_last_call_duration?: number;
  max_last_call_duration?: number;
}): Promise<Caller[]> {
  return apiRequest('fetch_callers', params);
}

export function fetchCalls(params: {
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  phone: string;
}): Promise<Call[]> {
  return apiRequest('fetch_calls', params);
}

export function updateCallNote(id: string, note: string): Promise<any> {
  return apiRequest('update_call_note', { id, note }, 'POST');
}

export function updateCallerNote(caller_id: string, note: string): Promise<any> {
  return apiRequest('update_caller_note', { caller_id, note }, 'POST');
}

export function updateExcludedStatus(caller_id: string, excluded: boolean): Promise<any> {
  return apiRequest('update_excluded', { caller_id, excluded: excluded ? 1 : 0 }, 'POST');
}
