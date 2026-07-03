import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';

async function getHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'bypass-tunnel-reminder': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Erreur serveur');
  return data as T;
}

// Auth
export const apiLogin = (email: string, password: string) =>
  request<{ token: string; user: any }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (name: string, email: string, password: string, password_confirmation: string) =>
  request<{ message: string }>('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, password_confirmation }),
  });

export const apiClientLogin = (company_name: string) =>
  request<{ token: string; user: any }>('/client-login', {
    method: 'POST',
    body: JSON.stringify({ company_name }),
  });

// Missions
export const apiGetMissions = (user_id: number) =>
  request<any[]>(`/missions?user_id=${user_id}`);

export const apiCreateMission = (payload: {
  user_id: number;
  name: string;
  client_id?: number | null;
  budget?: number | null;
  rate?: number | null;
}) =>
  request<any>('/missions', { method: 'POST', body: JSON.stringify(payload) });

// Clients/Companies
export const apiGetClients = () =>
  request<any[]>(`/users/clients?t=${Date.now()}`);

export const apiCreateCompany = (payload: { user_id: number; name: string }) =>
  request<any>('/companies', { method: 'POST', body: JSON.stringify(payload) });

// CRA
export const apiGetCraWeek = (user_id: number, startDate: string, endDate: string) =>
  request<any[]>(`/cra/week?user_id=${user_id}&startDate=${startDate}&endDate=${endDate}`);

export const apiSaveCra = (payload: {
  startDate: string;
  endDate: string;
  mission_ids: number[];
  entries: { mission_id: number; date: string; time: number }[];
}) =>
  request<any>('/cra/save', { method: 'POST', body: JSON.stringify(payload) });

// Budget
export const apiGetMissionMonthly = (missionId: number) =>
  request<any[]>(`/missions/${missionId}/monthly`);
