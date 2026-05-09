const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

const api = (path: string) => `${BASE}/api${path}`;

export type EventType = "task" | "resource";

export interface AtypicEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  duration_minutes: number;
  type: EventType;
  cognitive_impact: number;
  social_impact: number;
  sensory_impact: number;
  note?: string | null;
  template_id?: string | null;
  created_at?: string;
}

export interface Template {
  id: string;
  name: string;
  icon: string;
  type: EventType;
  cognitive_impact: number;
  social_impact: number;
  sensory_impact: number;
  duration_minutes: number;
}

export interface DayEnergy {
  date: string;
  cognitive: number;
  social: number;
  sensory: number;
  fatigue_score: number;
  overload: boolean;
  events_count: number;
}

export interface Suggestion {
  type: string;
  message: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(api(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = parsed.detail || text;
    } catch {}
    throw new Error(detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const apiClient = {
  getTemplates: () => request<Template[]>("/templates"),
  listEvents: (start?: string, end?: string) => {
    const params = new URLSearchParams();
    if (start) params.set("start_date", start);
    if (end) params.set("end_date", end);
    const qs = params.toString();
    return request<AtypicEvent[]>(`/events${qs ? `?${qs}` : ""}`);
  },
  eventsByDate: (date: string) =>
    request<AtypicEvent[]>(`/events/by-date/${date}`),
  createEvent: (payload: Omit<AtypicEvent, "id" | "created_at">) =>
    request<AtypicEvent>("/events", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  checkEvent: (payload: Omit<AtypicEvent, "id" | "created_at">) =>
    request<{
      blocked: boolean;
      blocked_axes: string[];
      projected: { cognitive: number; social: number; sensory: number };
      raw: { cognitive: number; social: number; sensory: number };
    }>("/events/check", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateEvent: (id: string, payload: Partial<AtypicEvent>) =>
    request<AtypicEvent>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteEvent: (id: string) =>
    request<{ ok: boolean }>(`/events/${id}`, { method: "DELETE" }),
  getDayEnergy: (date: string) => request<DayEnergy>(`/energy/${date}`),
  getRangeEnergy: (start: string, end: string) =>
    request<{ days: DayEnergy[] }>(
      `/energy?start_date=${start}&end_date=${end}`
    ),
  getStats: (start?: string, end?: string) => {
    const params = new URLSearchParams();
    if (start) params.set("start_date", start);
    if (end) params.set("end_date", end);
    const qs = params.toString();
    return request<{
      start_date: string;
      end_date: string;
      days: DayEnergy[];
      averages: {
        cognitive: number;
        social: number;
        sensory: number;
        fatigue_score: number;
      };
      overload_days: number;
      total_events: number;
    }>(`/stats${qs ? `?${qs}` : ""}`);
  },
  getSuggestions: (date: string) =>
    request<{
      date: string;
      energy: DayEnergy;
      suggestions: Suggestion[];
    }>(`/suggestions/${date}`),
};
