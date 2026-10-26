import axios from 'axios';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Zone {
  id: number;
  name: string;
  populationDensity: number;
  avgDailyTraffic: number;
  stations?: Station[];
}

export interface Station {
  id: number;
  zoneId?: number;
  zoneName?: string;
  zone?: { id: number; name: string };
  stationType: 'FAST' | 'SLOW' | 'SOLAR';
  baseChargingRate: number;
  numPorts: number;
  operational: boolean;
  dailySessionCapacity: number;
}

export interface DemandRecord {
  id: number;
  date: string;
  sessionsCount: number;
  peakHour: number;
  averageWaitTimeMinutes: number;
}

export interface ForecastResult {
  zoneId: number;
  zoneName: string;
  windowSize: number;
  horizon: number;
  historicalDemand: number[];
  historicalDates: string[];
  smaForecast: number[];
  wmaForecast: number[];
  lrForecast: number[];
  finalForecast: number[];
  forecastDates: string[];
}

export interface ZoneGapAnalysis {
  zoneId: number;
  zoneName: string;
  populationDensity: number;
  avgDailyTraffic: number;
  existingStationsCount: number;
  totalCapacity: number;
  avgForecastDemand: number;
  demandGap: number;
  status: 'UNDER-SERVED' | 'ADEQUATE';
}

export interface RankedZone {
  rank: number;
  zoneId: number;
  zoneName: string;
  avgForecastDemand: number;
  capacity: number;
  demandGap: number;
  priorityScore: number;
  priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface SimulationResult {
  zoneId: number;
  zoneName: string;
  stationTypeAdded: string;
  countAdded: number;
  avgForecastDemand: number;
  beforeCapacity: number;
  beforeGap: number;
  beforeStatus: string;
  afterCapacity: number;
  afterGap: number;
  afterStatus: string;
}

export const getZones = () => api.get<Zone[]>('/zones').then(res => res.data);
export const getZone = (id: number | string) => api.get<Zone>(`/zones/${id}`).then(res => res.data);
export const getStations = () => api.get<Station[]>('/stations').then(res => res.data);
export const getStationsByZone = (zoneId: number | string) => api.get<Station[]>(`/stations/zone/${zoneId}`).then(res => res.data);
export const getDemand = (zoneId: number | string) => api.get<DemandRecord[]>(`/demand/${zoneId}`).then(res => res.data);
export const runForecast = (zoneId: number, windowSize: number, horizon: number) => 
  api.post<ForecastResult>('/forecast', { zoneId, windowSize, horizon }).then(res => res.data);
export const getGapAnalysis = () => api.get<ZoneGapAnalysis[]>('/analysis/gaps').then(res => res.data);
export const getPriorityRanking = () => api.get<RankedZone[]>('/analysis/priority').then(res => res.data);
export const runSimulation = (zoneId: number, stationType: string, count: number, commit = false) => 
  api.post<SimulationResult>('/simulation', { zoneId, stationType, count, commit }).then(res => res.data);

export default api;
