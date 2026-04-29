export interface Incident {
  id: string;
  serviceId: string;
  serviceName: string;
  type: "degraded" | "outage";
  timestamp: string;
  resolvedAt?: string;
  description?: string;
}

export const INCIDENTS_KEY = "ai-peak-monitor-incidents";

export function loadIncidents(): Incident[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(INCIDENTS_KEY);
    if (!data) return [];
    const incidents = JSON.parse(data) as Incident[];
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return incidents.filter((i) => new Date(i.timestamp).getTime() > sevenDaysAgo);
  } catch {
    return [];
  }
}

export function saveIncidents(incidents: Incident[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
  } catch {}
}

export function addIncident(incident: Incident): void {
  const incidents = loadIncidents();
  incidents.unshift(incident);
  saveIncidents(incidents);
}

export function resolveIncident(id: string): void {
  const incidents = loadIncidents();
  const incident = incidents.find((i) => i.id === id);
  if (incident) {
    incident.resolvedAt = new Date().toISOString();
    saveIncidents(incidents);
  }
}

export function clearOldIncidents(): void {
  const incidents = loadIncidents();
  saveIncidents(incidents); // loadIncidents already filters old ones
}
