import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGapAnalysis, ZoneGapAnalysis } from '../api';
import { Search, ChevronRight, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

const ZonesPage: React.FC = () => {
  const navigate = useNavigate();
  const [gaps, setGaps] = useState<ZoneGapAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, Filter, Sort States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNDER-SERVED' | 'ADEQUATE'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'DENSITY' | 'TRAFFIC' | 'GAP'>('NAME');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getGapAnalysis();
      setGaps(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch zones. Make sure the Java backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Sort Logic
  const filteredZones = gaps
    .filter(g => {
      const matchesSearch = g.zoneName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME') return a.zoneName.localeCompare(b.zoneName);
      if (sortBy === 'DENSITY') return b.populationDensity - a.populationDensity;
      if (sortBy === 'TRAFFIC') return b.avgDailyTraffic - a.avgDailyTraffic;
      if (sortBy === 'GAP') return b.demandGap - a.demandGap;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-slate-400">Loading zones metadata...</p>
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
      <div>
        <h1 className="text-3xl font-extrabold text-white">City Zones</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor and analyze EV demand deficits, traffic volumes, and grid capacities across all zones.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search zones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNDER-SERVED">Under-Served</option>
              <option value="ADEQUATE">Adequate</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none transition"
            >
              <option value="NAME">Name</option>
              <option value="DENSITY">Population Density</option>
              <option value="TRAFFIC">Avg Traffic</option>
              <option value="GAP">Demand Deficit</option>
            </select>
          </div>
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                viewMode === 'table' ? 'bg-brand-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                viewMode === 'cards' ? 'bg-brand-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cards View
            </button>
          </div>
        </div>
      </div>

      {/* Zones Table View */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase bg-slate-950">
                  <th className="py-4 px-6">Zone</th>
                  <th className="py-4 px-6 text-right">Population Density</th>
                  <th className="py-4 px-6 text-right">Average Daily Traffic</th>
                  <th className="py-4 px-6 text-right">Stations</th>
                  <th className="py-4 px-6 text-right">Capacity</th>
                  <th className="py-4 px-6 text-right">Predicted Demand</th>
                  <th className="py-4 px-6 text-right">Demand Gap</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                {filteredZones.map(zone => (
                  <tr
                    key={zone.zoneId}
                    onClick={() => navigate(`/zones/${zone.zoneId}`)}
                    className="hover:bg-slate-850/50 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-6 font-semibold text-slate-100 group-hover:text-brand-400 transition flex items-center justify-between">
                      <span>{zone.zoneName}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-slate-300">
                      {zone.populationDensity.toLocaleString()} <span className="text-[10px] text-slate-500">/km²</span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-slate-300">
                      {zone.avgDailyTraffic.toLocaleString()} <span className="text-[10px] text-slate-500">veh/day</span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold text-slate-200">
                      {zone.existingStationsCount} active
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-semibold text-blue-400">
                      {zone.totalCapacity} <span className="text-[10px] font-normal text-slate-500">sessions</span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-semibold text-brand-400">
                      {zone.avgForecastDemand.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">sessions</span>
                    </td>
                    <td className={`py-3.5 px-6 text-right font-mono font-bold ${zone.demandGap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {zone.demandGap > 0 ? `+${zone.demandGap.toFixed(1)}` : zone.demandGap.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        zone.status === 'UNDER-SERVED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      }`}>
                        {zone.status === 'UNDER-SERVED' ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                        {zone.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Zones Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZones.map(zone => (
            <div
              key={zone.zoneId}
              onClick={() => navigate(`/zones/${zone.zoneId}`)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-xl cursor-pointer flex flex-col justify-between gap-6 transition shadow-md hover:shadow-lg group"
            >
              {/* Header info */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-500">ID: {zone.zoneId}</span>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition mt-0.5">{zone.zoneName}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 ${
                  zone.status === 'UNDER-SERVED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                }`}>
                  {zone.status === 'UNDER-SERVED' ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {zone.status}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Traffic Volume</span>
                  <span className="text-sm font-semibold text-slate-200">{zone.avgDailyTraffic.toLocaleString()} vehicles</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Existing Stations</span>
                  <span className="text-sm font-semibold text-slate-200">{zone.existingStationsCount} active</span>
                </div>
                <div className="col-span-2 border-t border-slate-850/80 pt-2 mt-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Capacity vs Avg Demand</span>
                  <div className="flex justify-between items-baseline mt-0.5">
                    <span className="text-sm font-bold text-slate-300">
                      {zone.totalCapacity} <span className="text-[10px] font-normal text-slate-500">sessions</span>
                    </span>
                    <span className="text-xs text-slate-400 font-medium">vs</span>
                    <span className="text-sm font-bold text-brand-400">
                      {zone.avgForecastDemand.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">predicted</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action text */}
              <div className="flex items-center justify-between text-xs text-brand-500 font-semibold border-t border-slate-800 pt-4 mt-auto">
                <span>View Historical & Forecast Charts</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredZones.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl text-center text-slate-500 flex flex-col items-center gap-3">
          <Search className="w-8 h-8 text-slate-600" />
          <span>No zones found matching your current filters.</span>
        </div>
      )}
    </div>
  );
};

export default ZonesPage;
