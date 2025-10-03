
// @ts-nocheck
import type { Caller, Call } from './types';
const API_BASE_URL = 'https://prop.digiheadway.in/api/calls/crm.php';

async function apiRequest<T>(action: string, params: Record<string, any>, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  let url: URL;
  const options: RequestInit = {
    method,
  };

  if (method === 'GET') {
    url = new URL(API_BASE_URL);
    url.searchParams.append('action', action);
    for (const key in params) {
      if (params[key] !== undefined) {
        url.searchParams.append(key, String(params[key]));
      }
    }
  } else { // POST
    url = new URL(API_BASE_URL);
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
        throw new Error(`API Error: ${data.message || 'Unknown error'}`);
    }

    if (action === 'fetch_callers' && Array.isArray(data.data)) {
        return data.data.map((caller: any) => ({
            id: caller.caller_id,
            phone: caller.caller_phone,
            last_call: caller.last_call,
            last_call_type: caller.last_call_type,
            last_call_duration: parseInt(caller.last_call_duration, 10) || 0,
            note: caller.caller_note,
            excluded: caller.excluded === '1',
            calls_in_range: parseInt(caller.calls, 10) || 0,
            lead_id: caller.lead_id,
            lead_name: caller.lead_name,
            segment: caller.segment,
            budget: caller.budget,
        })) as T;
    }
     if (action === 'fetch_calls' && Array.isArray(data.data)) {
        return data.data.map((call: any) => ({
            ...call,
            duration: parseInt(call.duration, 10) || 0,
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

export function updateCallerNote(id: string, note: string): Promise<any> {
  return apiRequest('update_caller_note', { caller_id: id, note }, 'POST');
}

export function updateExcludedStatus(caller_id: string, excluded: boolean): Promise<any> {
  return apiRequest('update_excluded', { caller_id, excluded: excluded ? 1 : 0 }, 'POST');
}
