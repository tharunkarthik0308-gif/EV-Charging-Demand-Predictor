import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getGapAnalysis, 
  getPriorityRanking, 
  getStations, 
  runForecast,
  ZoneGapAnalysis, 
  RankedZone, 
  Station,
  ForecastResult
} from '../api';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  Grid, Zap, AlertTriangle, ShieldCheck, Download, RefreshCw, BarChart2, TrendingUp, CalendarDays
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [gaps, setGaps] = useState<ZoneGapAnalysis[]>([]);
  const [priorityZones, setPriorityZones] = useState<RankedZone[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Trend Chart states
  const [trendZoneId, setTrendZoneId] = useState<number>(1);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [gapsData, priorityData, stationsData] = await Promise.all([
        getGapAnalysis(),
        getPriorityRanking(),
        getStations()
      ]);
      setGaps(gapsData);
      setPriorityZones(priorityData);
      setStations(stationsData);

      // Default to first zone in gaps for trend charts
      if (gapsData.length > 0) {
        const firstZoneId = gapsData[0].zoneId;
        setTrendZoneId(firstZoneId);
        await loadTrendData(firstZoneId);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch dashboard data. Make sure the Java backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendData = async (zoneId: number) => {
    try {
      setTrendLoading(true);
      const res = await runForecast(zoneId, 7, 7);
      setForecastResult(res);
    } catch (err) {
      console.error('Failed to load trend data:', err);
    } finally {
      setTrendLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleZoneChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = parseInt(e.target.value, 10);
    setTrendZoneId(zoneId);
    await loadTrendData(zoneId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-slate-400">Loading system metrics...</p>
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
        <button 
          onClick={loadData}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg w-fit text-sm transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Calculate KPIs
  const totalZones = gaps.length;
  const totalStations = stations.length;
  const totalCapacity = gaps.reduce((acc, curr) => acc + curr.totalCapacity, 0);
  const avgPredictedDemand = gaps.reduce((acc, curr) => acc + curr.avgForecastDemand, 0) / (totalZones || 1);
  const underServedCount = gaps.filter(g => g.status === 'UNDER-SERVED').length;

  // Format data for Chart B: Historical Demand Trend (Latest 30 Days)
  const historicalTrendData = forecastResult ? forecastResult.historicalDemand.slice(-30).map((demand, idx) => {
    const dates = forecastResult.historicalDates.slice(-30);
    return {
      date: dates[idx],
      Sessions: demand
    };
  }) : [];

  // Format data for Chart C: Forecast Overview (Last 15 Days + 7 Day Horizon)
  const forecastOverviewData: any[] = [];
  if (forecastResult) {
    const histDemand = forecastResult.historicalDemand;
    const histDates = forecastResult.historicalDates;
    const count = histDemand.length;
    const sliceCount = 15;
    const startIdx = Math.max(0, count - sliceCount);

    // Add historical part
    for (let i = startIdx; i < count; i++) {
      forecastOverviewData.push({
        date: histDates[i],
        Demand: histDemand[i],
        Forecast: null
      });
    }

    // Connect last historical point to forecast line
    if (count > 0) {
      forecastOverviewData.push({
        date: histDates[count - 1],
        Demand: histDemand[count - 1],
        Forecast: histDemand[count - 1]
      });
    }

    // Add forecast part
    for (let h = 0; h < forecastResult.horizon; h++) {
      forecastOverviewData.push({
        date: forecastResult.forecastDates[h],
        Demand: null,
        Forecast: parseFloat(forecastResult.finalForecast[h].toFixed(1))
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">System Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time status overview of EV infrastructure capacities and predicted demand patterns.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* KPI 1 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-md">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Zones</span>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-bold text-white">{totalZones}</span>
            <div className="bg-slate-800 p-2 rounded-lg text-slate-450">
              <Grid className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-md">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Stations</span>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-bold text-white">{totalStations}</span>
            <div className="bg-slate-800 p-2 rounded-lg text-brand-500">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-md">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Daily Capacity</span>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-bold text-blue-400">{totalCapacity.toFixed(0)}</span>
            <span className="text-slate-550 text-xs font-semibold">sessions/day</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-md">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Forecast Demand</span>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-bold text-brand-400">{avgPredictedDemand.toFixed(1)}</span>
            <span className="text-slate-550 text-xs font-semibold">sessions/day</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between ring-2 ring-amber-500/20 shadow-md">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Under-Served Zones</span>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-bold text-amber-500">{underServedCount}</span>
            <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Lists */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Demand vs Capacity Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl lg:col-span-2 flex flex-col gap-4 shadow-md">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-500" /> Chart A: Demand vs Available Capacity by Zone
          </h3>
          <p className="text-xs text-slate-400">Comparing forecasted average daily session demand with current operational station capacity.</p>
          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gaps}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="zoneName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar name="Predicted Demand" dataKey="avgForecastDemand" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Existing Capacity" dataKey="totalCapacity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Rankings Sidebar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between shadow-md">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Priority Zones
            </h3>
            <p className="text-xs text-slate-400">Top zones identified by the Java PriorityQueue as needing infrastructure expansion.</p>
            <div className="space-y-4 mt-2">
              {priorityZones.slice(0, 4).map((z, idx) => (
                <div key={z.zoneId} className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-slate-850 border border-slate-700 text-slate-300 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">{z.zoneName}</h4>
                      <span className="text-xs text-slate-500">Deficit: +{z.demandGap.toFixed(1)} sessions/day</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    z.priorityLevel === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    z.priorityLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {z.priorityLevel}
                  </span>
                </div>
              ))}
              {priorityZones.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                  <ShieldCheck className="w-8 h-8 text-brand-500" />
                  <span className="text-xs">All zones are adequately served</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/priority')}
            className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2.5 rounded-lg text-sm font-semibold transition mt-4"
          >
            Full Priority Analysis
          </button>
        </div>
      </div>

      {/* Selector for Trend Charts */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-md">
        <span className="text-sm text-slate-300 font-semibold flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-brand-500" /> Adjust Trend Analysis Location:
        </span>
        <select
          value={trendZoneId}
          onChange={handleZoneChange}
          className="bg-slate-950 border border-slate-800 text-sm text-slate-350 rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none transition w-fit"
        >
          {gaps.map(g => (
            <option key={g.zoneId} value={g.zoneId}>{g.zoneName}</option>
          ))}
        </select>
      </div>

      {/* Historical Trend and Forecast Overview Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Chart B: Historical Demand Trend */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-md">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Chart B: Historical Demand Trend
          </h3>
          <p className="text-xs text-slate-400">Time-series daily session counts for the past 30 days showing weekly seasonality patterns.</p>
          <div className="h-72 w-full mt-2">
            {trendLoading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={historicalTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" name="Historical Demand" dataKey="Sessions" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart C: Forecast Overview */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-md">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" /> Chart C: Forecast Overview (Aligned)
          </h3>
          <p className="text-xs text-slate-400">Past 15 days of historical demand connected seamlessly to the 7-day predicted forecast.</p>
          <div className="h-72 w-full mt-2">
            {trendLoading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecastOverviewData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  
                  {forecastResult && forecastResult.historicalDates && (
                    <ReferenceLine 
                      x={forecastResult.historicalDates[forecastResult.historicalDates.length - 1]} 
                      stroke="#ef4444" 
                      strokeDasharray="3 3"
                    />
                  )}
                  
                  <Line type="monotone" name="Historical Demand" dataKey="Demand" stroke="#6366f1" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" name="Ensemble Forecast" dataKey="Forecast" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-md">
        <h3 className="text-lg font-bold text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => navigate('/forecast')}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition"
          >
            <BarChart2 className="w-6 h-6 text-brand-500" />
            <span className="text-sm font-semibold">Run Forecast</span>
          </button>
          <button
            onClick={() => navigate('/zones')}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition"
          >
            <Grid className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-semibold">View Zones</span>
          </button>
          <button
            onClick={() => navigate('/priority')}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition"
          >
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span className="text-sm font-semibold">Priority Analysis</span>
          </button>
          <button
            onClick={() => navigate('/simulation')}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition"
          >
            <Zap className="w-6 h-6 text-emerald-500" />
            <span className="text-sm font-semibold">What-If Sim</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center col-span-2 md:col-span-1 transition"
          >
            <Download className="w-6 h-6 text-slate-400" />
            <span className="text-sm font-semibold">Reports Center</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
