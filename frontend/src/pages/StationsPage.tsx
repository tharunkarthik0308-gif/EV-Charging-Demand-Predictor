import React, { useEffect, useState } from 'react';
import { getStations, getZones, Station, Zone } from '../api';
import { Zap, HelpCircle, Sun, Battery, RefreshCw, AlertTriangle } from 'lucide-react';

const StationsPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering States
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [stationsData, zonesData] = await Promise.all([
        getStations(),
        getZones()
      ]);
      setStations(stationsData);
      setZones(zonesData);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch stations. Make sure the Java backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStationTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'FAST':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'SLOW':
        return <Battery className="w-4 h-4 text-blue-400" />;
      case 'SOLAR':
        return <Sun className="w-4 h-4 text-brand-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  // Build lookup maps for reliable zone mapping
  const zoneMap = new Map<number, string>();
  const stationToZoneMap = new Map<number, { id: number; name: string }>();

  zones.forEach(z => {
    zoneMap.set(z.id, z.name);
    if (Array.isArray(z.stations)) {
      z.stations.forEach(st => {
        if (st && st.id) {
          stationToZoneMap.set(st.id, { id: z.id, name: z.name });
        }
      });
    }
  });

  const getStationZoneInfo = (station: Station): { id?: number; name: string } => {
    if (station.zoneName) {
      return { id: station.zoneId || station.zone?.id, name: station.zoneName };
    }
    if (station.zoneId && zoneMap.has(station.zoneId)) {
      return { id: station.zoneId, name: zoneMap.get(station.zoneId)! };
    }
    if (stationToZoneMap.has(station.id)) {
      return stationToZoneMap.get(station.id)!;
    }
    if (station.zone?.name) {
      return { id: station.zone.id, name: station.zone.name };
    }
    if (station.zone?.id && zoneMap.has(station.zone.id)) {
      return { id: station.zone.id, name: zoneMap.get(station.zone.id)! };
    }
    return { name: 'Unknown Zone' };
  };

  // Filter Logic
  const filteredStations = stations.filter(s => {
    const zoneInfo = getStationZoneInfo(s);
    const stationZoneId = zoneInfo.id ? zoneInfo.id.toString() : '';
    const matchesZone = zoneFilter === 'ALL' || stationZoneId === zoneFilter;
    const matchesType = typeFilter === 'ALL' || s.stationType === typeFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'OPERATIONAL') matchesStatus = s.operational;
    if (statusFilter === 'OFFLINE') matchesStatus = !s.operational;

    return matchesZone && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-slate-400">Loading stations data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-xl flex flex-col gap-4 max-w-2xl mx-auto my-12">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="font-bold text-lg">System Error</h3>
        </div>
        <p className="text-sm">{error}</p>
        <button onClick={loadData} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg w-fit text-sm transition">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Charging Stations</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse and filter all physical EV charging hardware assets installed across city sectors.
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-4 items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        {/* Zone Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">City Zone:</span>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none transition"
          >
            <option value="ALL">All Zones</option>
            {zones.map(z => (
              <option key={z.id} value={z.id.toString()}>{z.name}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Charger Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none transition"
          >
            <option value="ALL">All Types</option>
            <option value="FAST">Fast Charging</option>
            <option value="SLOW">Slow Charging</option>
            <option value="SOLAR">Solar Charging</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
      </div>

      {/* Stations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase bg-slate-950">
                <th className="py-4 px-6">Station ID</th>
                <th className="py-4 px-6">Location Zone</th>
                <th className="py-4 px-6">Charger Type</th>
                <th className="py-4 px-6 text-right">Charging Rate</th>
                <th className="py-4 px-6 text-right">Ports count</th>
                <th className="py-4 px-6 text-right">Daily Session Cap</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {filteredStations.map(station => (
                <tr key={station.id} className="hover:bg-slate-850/40 transition">
                  <td className="py-3.5 px-6 font-mono text-xs text-slate-400">#ST-{station.id}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-200">{getStationZoneInfo(station).name}</td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2">
                      {getStationTypeIcon(station.stationType)}
                      <span>{station.stationType} Charging</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono font-semibold text-slate-200">{station.baseChargingRate} kW</td>
                  <td className="py-3.5 px-6 text-right font-semibold text-slate-200">{station.numPorts}</td>
                  <td className="py-3.5 px-6 text-right font-semibold text-slate-200">{station.dailySessionCapacity} sessions</td>
                  <td className="py-3.5 px-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      station.operational 
                        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${station.operational ? 'bg-brand-500' : 'bg-red-500'}`} />
                      {station.operational ? 'Operational' : 'Offline'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStations.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <span>No stations match the selected filters.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationsPage;
