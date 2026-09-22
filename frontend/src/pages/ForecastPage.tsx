import React, { useEffect, useState } from 'react';
import { getZones, runForecast, Zone, ForecastResult } from '../api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { BarChart3, RefreshCw, AlertTriangle, Play, HelpCircle } from 'lucide-react';

const ForecastPage: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('');
  const [windowSize, setWindowSize] = useState(7);
  const [horizon, setHorizon] = useState(7);

  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Info details of active models
  const [showModelsInfo, setShowModelsInfo] = useState(false);

  useEffect(() => {
    // Load zones list
    getZones()
      .then(data => {
        setZones(data);
        if (data.length > 0) {
          setSelectedZoneId(data[0].id);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch zones. Verify the backend service.');
      });
  }, []);

  const handleRunForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneId) return;

    try {
      setLoading(true);
      setError('');
      const res = await runForecast(selectedZoneId, windowSize, horizon);
      setForecast(res);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to run forecast calculations. Please check window size constraints.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Setup charts data
  const chartData: any[] = [];
  if (forecast) {
    const count = forecast.historicalDemand.length;
    const showHistLimit = 30;
    const start = Math.max(0, count - showHistLimit);

    for (let i = start; i < count; i++) {
      chartData.push({
        date: forecast.historicalDates[i],
        Demand: forecast.historicalDemand[i],
        type: 'historical'
      });
    }

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
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Forecasting Sandbox</h1>
        <p className="text-slate-400 text-sm mt-1">
          Simulate future daily charging session loads using moving averages and least-squares regression.
        </p>
      </div>

      {/* Main configuration form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <form onSubmit={handleRunForecast} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Select Zone */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Select Zone</label>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value ? parseInt(e.target.value, 10) : '')}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none transition"
              required
            >
              <option value="">-- Choose City Zone --</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Window size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-semibold uppercase tracking-wider">
              <span>Historical Window</span>
              <span className="text-brand-500">{windowSize} days</span>
            </div>
            <input
              type="range"
              min="3"
              max="14"
              value={windowSize}
              onChange={(e) => setWindowSize(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none py-2"
            />
          </div>

          {/* Forecast horizon */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-semibold uppercase tracking-wider">
              <span>Prediction Horizon</span>
              <span className="text-brand-500">{horizon} days</span>
            </div>
            <input
              type="range"
              min="3"
              max="14"
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none py-2"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !selectedZoneId}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-650 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Forecasting
          </button>
        </form>
      </div>

      {/* Error notification */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Results View */}
      {forecast ? (
        <div className="space-y-8 animate-fade-in">
          {/* Summary grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">SMA Prediction (Day 1)</span>
              <h4 className="text-2xl font-extrabold text-purple-400 mt-2">{forecast.smaForecast[0].toFixed(1)} sessions</h4>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">WMA Prediction (Day 1)</span>
              <h4 className="text-2xl font-extrabold text-emerald-400 mt-2">{forecast.wmaForecast[0].toFixed(1)} sessions</h4>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">LR Prediction (Day 1)</span>
              <h4 className="text-2xl font-extrabold text-blue-400 mt-2">{forecast.lrForecast[0].toFixed(1)} sessions</h4>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl ring-2 ring-brand-500/20">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Ensemble Average (Day 1)</span>
              <h4 className="text-2xl font-extrabold text-brand-400 mt-2">{forecast.finalForecast[0].toFixed(1)} sessions</h4>
            </div>
          </div>

          {/* Forecasting plot */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-white">Forecasting Output Trend</h3>
              <button 
                type="button"
                onClick={() => setShowModelsInfo(!showModelsInfo)}
                className="flex items-center gap-1.5 text-xs text-brand-500 hover:underline font-semibold"
              >
                <HelpCircle className="w-4 h-4" /> {showModelsInfo ? 'Hide formulas' : 'Show formulas'}
              </button>
            </div>

            {/* Models Formula Card */}
            {showModelsInfo && (
              <div className="grid md:grid-cols-3 gap-6 bg-slate-950 p-4 rounded-lg border border-slate-850 text-xs text-slate-400">
                <div>
                  <h5 className="font-bold text-purple-400 mb-1">Simple Moving Average</h5>
                  <p>Recursively adds previous predictions to calculate the arithmetic mean over the selected rolling window.</p>
                </div>
                <div>
                  <h5 className="font-bold text-emerald-400 mb-1">Weighted Moving Average</h5>
                  <p>Recursively applies linear weightings (1, 2, ..., N) to recent history to prioritize latest commute demand.</p>
                </div>
                <div>
                  <h5 className="font-bold text-blue-400 mb-1">Least-Squares Regression</h5>
                  <p>Fits a slope (m) and intercept (c) on the latest historical window and projects it linearly along the timeline.</p>
                </div>
              </div>
            )}

            <div className="h-96 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  
                  {/* Highlight window split */}
                  <ReferenceLine x={forecast.historicalDates[forecast.historicalDates.length - 1]} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Forecast Split', fill: '#ef4444', position: 'top', fontSize: 10 }} />
                  
                  <Line type="monotone" name="Historical Demand" dataKey="Demand" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" name="SMA Predict" dataKey="SMA" stroke="#a78bfa" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 5" connectNulls />
                  <Line type="monotone" name="WMA Predict" dataKey="WMA" stroke="#34d399" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 5" connectNulls />
                  <Line type="monotone" name="LR Predict" dataKey="LinearRegression" stroke="#60a5fa" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 5" connectNulls />
                  <Line type="monotone" name="Ensemble Average" dataKey="FinalForecast" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-16 rounded-xl text-center text-slate-500 flex flex-col items-center gap-3">
          <BarChart3 className="w-12 h-12 text-slate-700" />
          <h3 className="font-bold text-lg text-slate-400">Sandbox Ready</h3>
          <span className="text-sm max-w-sm">Choose a zone location above and configure parameters to execute the forecasting simulation.</span>
        </div>
      )}
    </div>
  );
};

export default ForecastPage;
