import React, { useEffect, useState } from 'react';
import { getPriorityRanking, RankedZone } from '../api';
import { AlertTriangle, ShieldCheck, RefreshCw, Info } from 'lucide-react';

const PriorityPage: React.FC = () => {
  const [rankedZones, setRankedZones] = useState<RankedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPriorityRanking();
      setRankedZones(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch priority rankings. Verify the Java backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-slate-400">Sorting zones in Java PriorityQueue...</p>
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
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Priority Expansion Analysis</h1>
          <p className="text-slate-400 text-sm mt-1">
            Prioritize infrastructure expansion dynamically using a Heap Priority Queue.
          </p>
        </div>
      </div>

      {/* Heap Sort Explanation */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-3 text-sm text-slate-400 items-start">
        <Info className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-slate-200">How Priority Queue Sorting Works:</h4>
          <p className="leading-relaxed text-xs">
            The Java backend collects all city zones and runs multi-model forecasts. Only zones with a positive demand deficit (Demand Gap &gt; 0) are enqueued. 
            The comparator sorts the queue descending: Highest deficit &rarr; Lowest positive deficit. A dynamic priority score is computed using the formula:
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[10px] text-brand-500 border border-slate-850 mt-2">
            Priority Score = (Demand Gap * 1.5) + (Population Density * 0.04) + (Traffic * 0.002) - (Existing Stations * 1.0)
          </div>
        </div>
      </div>

      {/* Priority Rankings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase bg-slate-950">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Zone Location</th>
                <th className="py-4 px-6 text-right">Avg Forecast Demand</th>
                <th className="py-4 px-6 text-right">Active Capacity</th>
                <th className="py-4 px-6 text-right">Demand Gap</th>
                <th className="py-4 px-6 text-right">Priority Score</th>
                <th className="py-4 px-6 text-center">Priority Level</th>
                <th className="py-4 px-6">Action Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {rankedZones.map(zone => (
                <tr key={zone.zoneId} className="hover:bg-slate-850/40 transition">
                  <td className="py-4 px-6 text-center font-bold">
                    <span className="inline-flex w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-200 items-center justify-center text-xs">
                      {zone.rank}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-100">{zone.zoneName}</td>
                  <td className="py-4 px-6 text-right font-mono text-slate-350">{zone.avgForecastDemand.toFixed(1)}</td>
                  <td className="py-4 px-6 text-right font-mono text-slate-350">{zone.capacity.toFixed(0)}</td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-red-400">+{zone.demandGap.toFixed(1)}</td>
                  <td className="py-4 px-6 text-right font-mono font-semibold text-slate-200">{zone.priorityScore.toFixed(1)}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      zone.priorityLevel === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      zone.priorityLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {zone.priorityLevel}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300 max-w-xs">{zone.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rankedZones.length === 0 && (
          <div className="text-center py-16 text-slate-500 flex flex-col items-center justify-center gap-3">
            <ShieldCheck className="w-12 h-12 text-brand-500" />
            <h4 className="font-bold text-slate-400 text-lg">All Zones Adequately Served</h4>
            <span className="text-xs max-w-xs">No city sectors currently experience a positive demand-capacity deficit.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriorityPage;
