
// @ts-nocheck
import type { Caller, Call, Lead } from './types';
const API_BASE_URL = 'https://prop.digiheadway.in/api/calls/crm.php';
const API_V3_BASE_URL = 'https://prop.digiheadway.in/api/v3/';

async function apiRequest<T>(baseURL: string, action: string, params: Record<string, any>, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  let url: URL;
  const options: RequestInit = {
    method,
  };

  if (method === 'GET') {
    url = new URL(baseURL);
    url.searchParams.append('action', action);
    for (const key in params) {
      if (params[key] !== undefined) {
        url.searchParams.append(key, String(params[key]));
      }
    }
  } else { // POST
    url = new URL(baseURL);
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
      // Try to parse as JSON to see if there is a structured error.
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
            throw new Error(`API request failed with status ${response.status}: ${errorJson.message}`);
        }
      } catch(e) {
        // Not a JSON error, throw the raw text
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
    }
    const data = await response.json();
    if (data.status === 'error') {
        throw new Error(`API Error: ${data.message || 'Unknown error'}`);
    }

    if (action === 'fetch_callers' && Array.isArray(data.data)) {
        return data.data.map((caller: any) => ({
            id: caller.caller_id,
            phone: caller.caller_phone,
            custom_name: caller.custom_name,
            caller_type: caller.caller_type,
            last_call: caller.last_call,
            last_call_type: caller.last_call_type,
            last_call_duration: parseInt(caller.last_call_duration, 10) || 0,
            note: caller.note,
            excluded: caller.excluded === '1',
            last_sync: caller.last_sync === '1',
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
  return apiRequest(API_BASE_URL, 'fetch_callers', params);
}

export function fetchCalls(params: {
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  phone: string;
}): Promise<Call[]> {
  return apiRequest(API_BASE_URL, 'fetch_calls', params);
}

export function updateCallNote(id: string, note: string): Promise<any> {
  return apiRequest(API_BASE_URL, 'update_call_note', { id, note }, 'POST');
}

export function updateCallerNote(id: string, note: string): Promise<any> {
  return apiRequest(API_BASE_URL, 'update_caller_note', { caller_id: id, note }, 'POST');
}

export function updateExcludedStatus(caller_id: string, excluded: boolean): Promise<any> {
  return apiRequest(API_BASE_URL, 'update_excluded', { caller_id, excluded: excluded ? 1 : 0 }, 'POST');
}

export function markSynced(caller_id: string, current_status: boolean): Promise<any> {
    return apiRequest(API_BASE_URL, 'mark_synced', { caller_id, status: current_status ? 1 : 0 }, 'POST');
}

export function updateCallerInfo(caller_id: string, info: { custom_name?: string; caller_type?: string }): Promise<any> {
    return apiRequest(API_BASE_URL, 'update_caller_info', { caller_id, ...info }, 'POST');
}

export function fetchLeadInfo(lead_id: string): Promise<Lead> {
    return apiRequest(API_V3_BASE_URL, 'get_lead', { id: lead_id });
}
