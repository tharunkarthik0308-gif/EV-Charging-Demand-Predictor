import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getZone, 
  getStationsByZone, 
  runForecast, 
  getPriorityRanking, 
  Zone, 
  Station, 
  ForecastResult,
  RankedZone 
} from '../api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  ArrowLeft, RefreshCw, AlertTriangle, ShieldCheck, Info 
} from 'lucide-react';

const ZoneDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [zone, setZone] = useState<Zone | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [rankedInfo, setRankedInfo] = useState<RankedZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Slider options
  const [windowSize, setWindowSize] = useState(7);
  const [horizon, setHorizon] = useState(7);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const zoneId = parseInt(id, 10);
      
      const [zoneData, stationsData, forecastData, priorityData] = await Promise.all([
        getZone(zoneId),
        getStationsByZone(zoneId),
        runForecast(zoneId, windowSize, horizon),
        getPriorityRanking()
      ]);

      setZone(zoneData);
      setStations(stationsData);
      setForecast(forecastData);
      
      // Find priority ranking if under-served
      const rz = priorityData.find(p => p.zoneId === zoneId);
      setRankedInfo(rz || null);

    } catch (err: any) {
      console.error(err);
      setError('Failed to load zone details. Verify your backend connection and database state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRecalculate = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-slate-400">Performing regression calculations...</p>
      </div>
    );
  }

  if (error || !zone || !forecast) {
    return (
      <div className="max-w-2xl mx-auto my-12 space-y-4">
        <button onClick={() => navigate('/zones')} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Zones
        </button>
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="font-bold text-lg">Failed to load zone</h3>
          </div>
          <p className="text-sm">{error || 'Zone metadata could not be fetched.'}</p>
          <button onClick={loadData} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg w-fit text-sm transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prep chart data
  // Combine historical demand & forecast demand.
  // Historical data has historical demand. Forecast starts after historical data.
  const chartData: any[] = [];
  const histCount = forecast.historicalDemand.length;
  const showHistLimit = 30; // Limit historical rendering to last 30 days for readability
  const startIdx = Math.max(0, histCount - showHistLimit);

  // Historical data points
  for (let i = startIdx; i < histCount; i++) {
    chartData.push({
      date: forecast.historicalDates[i],
      Demand: forecast.historicalDemand[i],
      type: 'historical'
    });
  }

  // Forecast data points
  for (let i = 0; i < forecast.horizon; i++) {
    chartData.push({
      date: forecast.forecastDates[i],
      SMA: parseFloat(forecast.smaForecast[i].toFixed(1)),
      WMA: parseFloat(forecast.wmaForecast[i].toFixed(1)),
      LinearRegression: parseFloat(forecast.lrForecast[i].toFixed(1)),
      FinalForecast: parseFloat(forecast.finalForecast[i].toFixed(1)),
      type: 'forecast'
    });
  }

  // Calculate capacities
  const totalCapacity = stations.filter(s => s.operational).reduce((acc, curr) => acc + curr.dailySessionCapacity, 0);
  const avgForecastVal = forecast.finalForecast.reduce((acc, c) => acc + c, 0) / forecast.horizon;
  const gapVal = avgForecastVal - totalCapacity;
  const isUnderServed = gapVal > 0;

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <button onClick={() => navigate('/zones')} className="flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Zones
          </button>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            {zone.name}
            <span className={`text-xs px-2.5 py-0.5 rounded font-bold ${
              isUnderServed ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              'bg-brand-500/10 text-brand-400 border border-brand-500/20'
            }`}>
              {isUnderServed ? 'UNDER-SERVED' : 'ADEQUATE'}
            </span>
          </h1>
        </div>
      </div>

      {/* Profile & Stations Info */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Zone Profile</h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-500 block">Population Density</span>
              <span className="text-base font-semibold text-slate-200">{zone.populationDensity.toLocaleString()} people/km²</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Average Daily Traffic</span>
              <span className="text-base font-semibold text-slate-200">{zone.avgDailyTraffic.toLocaleString()} vehicles/day</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Existing Charging Infrastructure</span>
              <span className="text-base font-semibold text-slate-200">{stations.length} total stations ({stations.filter(s => s.operational).length} operational)</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 mt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Stations Detail</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {stations.map(s => (
                <div key={s.id} className="flex justify-between items-center text-xs border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-slate-200 block">{s.stationType} Charging</span>
                    <span className="text-slate-500">{s.numPorts} ports @ {s.baseChargingRate}kW</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.operational ? 'bg-brand-500/10 text-brand-400' : 'bg-red-500/10 text-red-400'}`}>
                    {s.operational ? 'Active' : 'Offline'}
                  </span>
                </div>
              ))}
              {stations.length === 0 && <span className="text-xs text-slate-500 italic">No charging stations registered in this zone.</span>}
            </div>
          </div>
        </div>

        {/* Forecast Sandbox Config */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl lg:col-span-2 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-brand-500" /> Forecast Settings
            </h3>
            <p className="text-xs text-slate-400">Adjust the size of the rolling historical observation window and the prediction timeline length.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              {/* Window Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-300 font-semibold">Historical Window Size</label>
                  <span className="text-sm font-bold text-brand-500">{windowSize} days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="14"
                  value={windowSize}
                  onChange={(e) => setWindowSize(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 block">Number of latest demand records evaluated.</span>
              </div>

              {/* Horizon Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-300 font-semibold">Forecast Horizon</label>
                  <span className="text-sm font-bold text-brand-500">{horizon} days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="14"
                  value={horizon}
                  onChange={(e) => setHorizon(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 block">Number of future days predicted.</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRecalculate}
            className="w-full bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition mt-2 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Recalculate Forecast
          </button>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Demand Forecast Models Aligned</h3>
            <p className="text-xs text-slate-400">Comparing Simple Moving Average, Weighted Moving Average, Least-Squares Linear Regression, and the final average ensemble forecast.</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-0.5 bg-indigo-500" /> Historical
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-0.5 bg-brand-500" /> Forecast Ensemble
            </span>
          </div>
        </div>

        <div className="h-96 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Daily Sessions', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', style: { fontSize: 11 } }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              
              {/* Highlight window split */}
              <ReferenceLine x={forecast.historicalDates[histCount - 1]} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Forecast Split', fill: '#ef4444', position: 'top', fontSize: 10 }} />
              
              {/* Plot lines */}
              <Line type="monotone" name="Historical Demand" dataKey="Demand" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" name="SMA Predict" dataKey="SMA" stroke="#a78bfa" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 5" connectNulls />
              <Line type="monotone" name="WMA Predict" dataKey="WMA" stroke="#34d399" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 5" connectNulls />
              <Line type="monotone" name="LR Predict" dataKey="LinearRegression" stroke="#60a5fa" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 5" connectNulls />
              <Line type="monotone" name="Ensemble Average" dataKey="FinalForecast" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gap Analysis & Recommendation */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Capacity vs Demand Numbers */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Gap Analysis Summary</h3>
          <div className="grid grid-cols-2 gap-6 py-2">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase font-semibold">Avg Predicted Demand</span>
              <span className="text-2xl font-extrabold text-white">{avgForecastVal.toFixed(1)} sessions/day</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase font-semibold">Available Capacity</span>
              <span className="text-2xl font-extrabold text-blue-500">{totalCapacity.toFixed(0)} sessions/day</span>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Resulting Capacity Deficit:</span>
            <span className={`text-lg font-bold ${isUnderServed ? 'text-red-400' : 'text-brand-400'}`}>
              {isUnderServed ? `+${gapVal.toFixed(1)} sessions/day (Deficit)` : `${Math.abs(gapVal).toFixed(1)} sessions/day (Surplus)`}
            </span>
          </div>
        </div>

        {/* Dynamic Recommendations card */}
        <div className={`border p-6 rounded-xl flex flex-col justify-between gap-4 ${
          isUnderServed 
            ? 'bg-red-500/5 border-red-500/20 ring-2 ring-red-500/10' 
            : 'bg-brand-500/5 border-brand-500/20 ring-2 ring-brand-500/10'
        }`}>
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              {isUnderServed ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-400">Expansion Advisory Required</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-brand-500" />
                  <span className="text-brand-400">Infrastructure Capacity Adequate</span>
                </>
              )}
            </div>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              {rankedInfo ? rankedInfo.recommendation : 'No immediate infrastructure expansion recommended. Continue regular maintenance and monitoring of active charger loads.'}
            </p>
          </div>

          {isUnderServed && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs text-slate-400">
              <Info className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>Recommendations are generated dynamically by comparing deficit volume with average charger capacities.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneDetailsPage;
