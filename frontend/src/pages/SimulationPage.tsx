import React, { useEffect, useState } from 'react';
import { getZones, runSimulation, Zone, SimulationResult } from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Play, Sparkles, RefreshCw, AlertTriangle, ShieldCheck, Database } from 'lucide-react';

const SimulationPage: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('');
  const [stationType, setStationType] = useState<string>('FAST');
  const [count, setCount] = useState<number>(1);

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [commitLoading, setCommitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadZones = () => {
    getZones()
      .then(data => {
        setZones(data);
        if (data.length > 0) {
          setSelectedZoneId(data[0].id);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch zones. Verify backend status.');
      });
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleSimulate = async (e: React.FormEvent, commit = false) => {
    if (e) e.preventDefault();
    if (!selectedZoneId) return;

    try {
      if (commit) {
        setCommitLoading(true);
        setSuccessMsg('');
      } else {
        setLoading(true);
      }
      setError('');

      const res = await runSimulation(selectedZoneId, stationType, count, commit);
      setResult(res);

      if (commit) {
        setSuccessMsg(`Successfully committed ${count} ${stationType} Charging Station(s) to the database!`);
        // Refresh zones dropdown in case capacity has updated
        loadZones();
      }
    } catch (err: any) {
      console.error(err);
      setError('Simulation execution failed.');
    } finally {
      setLoading(false);
      setCommitLoading(false);
    }
  };

  // Chart data formatting
  const chartData = result ? [
    {
      name: 'Before Sim',
      Capacity: result.beforeCapacity,
      Demand: parseFloat(result.avgForecastDemand.toFixed(1))
    },
    {
      name: 'After Sim',
      Capacity: result.afterCapacity,
      Demand: parseFloat(result.avgForecastDemand.toFixed(1))
    }
  ] : [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">What-If Infrastructure Simulator</h1>
        <p className="text-slate-400 text-sm mt-1">
          Model capacity expansion scenarios dynamically. Test the grid impact of adding charger ports before allocating capital.
        </p>
      </div>

      {/* Simulator settings */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <form onSubmit={(e) => handleSimulate(e, false)} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Zone selection */}
          <div className="space-y-2">
            <label className="text-xs text-slate-350 font-semibold uppercase">Target Zone</label>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value ? parseInt(e.target.value, 10) : '')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-brand-500"
              required
            >
              <option value="">-- Choose Zone --</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Station Type */}
          <div className="space-y-2">
            <label className="text-xs text-slate-350 font-semibold uppercase">Station Type to Add</label>
            <select
              value={stationType}
              onChange={(e) => setStationType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-brand-500"
            >
              <option value="FAST">Fast Charging Station (+24 cap/day)</option>
              <option value="SLOW">Slow Charging Station (+8 cap/day)</option>
              <option value="SOLAR">Solar Charging Station (+12 cap/day)</option>
            </select>
          </div>

          {/* Count */}
          <div className="space-y-2">
            <label className="text-xs text-slate-350 font-semibold uppercase">Quantity to Install</label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-brand-500"
            >
              <option value={1}>1 Station</option>
              <option value={2}>2 Stations</option>
              <option value={3}>3 Stations</option>
              <option value={4}>4 Stations</option>
              <option value={5}>5 Stations</option>
            </select>
          </div>

          {/* Run button */}
          <button
            type="submit"
            disabled={loading || commitLoading || !selectedZoneId}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Simulation
          </button>
        </form>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-brand-500/10 border border-brand-500/20 text-brand-300 p-4 rounded-xl flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <span className="text-xs">{successMsg}</span>
        </div>
      )}

      {/* Output Comparison View */}
      {result ? (
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
          {/* Before vs After Cards */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Simulation Analytics</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Before Card */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Before Simulation</span>
                <div>
                  <span className="text-xs text-slate-400">Total Capacity</span>
                  <div className="text-xl font-bold text-slate-200 mt-1">{result.beforeCapacity} sessions/day</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Demand Deficit</span>
                  <div className="text-xl font-bold text-red-400 mt-1">
                    {result.beforeGap > 0 ? `+${result.beforeGap.toFixed(1)}` : result.beforeGap.toFixed(1)}
                  </div>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                  result.beforeStatus === 'UNDER-SERVED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                }`}>
                  {result.beforeStatus}
                </span>
              </div>

              {/* After Card */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 ring-2 ring-brand-500/30">
                <span className="text-[10px] text-brand-500 font-semibold uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Simulated Result
                </span>
                <div>
                  <span className="text-xs text-slate-400">Simulated Capacity</span>
                  <div className="text-xl font-bold text-brand-400 mt-1">{result.afterCapacity} sessions/day</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">New Deficit</span>
                  <div className={`text-xl font-bold mt-1 ${result.afterGap > 0 ? 'text-red-400' : 'text-brand-400'}`}>
                    {result.afterGap > 0 ? `+${result.afterGap.toFixed(1)}` : result.afterGap.toFixed(1)}
                  </div>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                  result.afterStatus === 'UNDER-SERVED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                }`}>
                  {result.afterStatus}
                </span>
              </div>
            </div>

            {/* Commit to Database Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-brand-500" /> Apply Scenario Permanently
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  If this simulation satisfies your planning constraints, you can permanently write these simulated charging assets to the MySQL database.
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => handleSimulate(e, true)}
                disabled={commitLoading || loading}
                className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-2"
              >
                {commitLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-brand-400" />}
                Apply & Save to Database
              </button>
            </div>
          </div>

          {/* Visual comparison bar chart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white">Capacity Increase Comparison</h3>
            <div className="h-80 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar name="Charging Capacity" dataKey="Capacity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar name="Avg Predicted Demand" dataKey="Demand" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-16 rounded-xl text-center text-slate-500 flex flex-col items-center gap-3">
          <Sparkles className="w-12 h-12 text-slate-700" />
          <h3 className="font-bold text-lg text-slate-400">Simulator Standby</h3>
          <span className="text-sm max-w-sm">Select installation parameters above to run the capacity gap model comparison.</span>
        </div>
      )}
    </div>
  );
};

export default SimulationPage;
