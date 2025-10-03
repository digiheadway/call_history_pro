// @ts-nocheck
const API_BASE_URL = 'https://prop.digiheadway.in/api/calls/crm.php';

export interface Caller {
  id: string;
  phone: string;
  note: string | null;
  calls: number;
  last_call: string; // DATETIME string 'YYYY-MM-DD HH:MM:SS'
  last_call_type: 'incoming' | 'outgoing' | 'missed' | 'rejected';
  last_call_duration: number; // in seconds
  excluded: boolean;
}

export interface Call {
  id: string;
  phone: string;
  note: string | null;
  duration: number;
  type: 'incoming' | 'outgoing' | 'missed' | 'rejected';
  recording_url: string | null;
  created_ts: string; // TIMESTAMP string
}

interface FetchParams {
  [key: string]: string | number | boolean | undefined;
}

async function apiRequest<T>(action: string, params: FetchParams, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  const url = new URL(API_BASE_URL);
  
  if (method === 'GET') {
    url.searchParams.append('action', action);
    for (const key in params) {
      if (params[key] !== undefined) {
        url.searchParams.append(key, String(params[key]));
      }
    }
  }

  const options: RequestInit = {
    method,
  };

  if (method === 'POST') {
    const formData = new FormData();
    formData.append('action', action);
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
    return data.data;
  } catch (error) {
    console.error(`API action "${action}" failed:`, error);
    throw error;
  }
}

export function fetchCallers(params: {
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  phone?: string;
  id?: string;
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
  return apiRequest('update_caller_note', { id, note }, 'POST');
}

export function updateExcludedStatus(id: string, excluded: boolean): Promise<any> {
  return apiRequest('update_excluded', { id, excluded: excluded ? 1 : 0 }, 'POST');
}
