import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BatteryCharging, BarChart3, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 p-2 rounded-lg text-slate-950">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              EV Charge<span className="text-brand-500">Predict</span>
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 px-4 py-2 rounded-lg font-semibold transition"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-center gap-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-500 w-fit text-sm font-medium">
              ⚡ 2nd-Year B.E. CSE OOPJ Project
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Smart EV Charging <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-emerald-400">
                Demand Predictor
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-lg">
              A data-driven decision support platform designed to forecast electric vehicle charging demand, identify underserved city zones, and recommend strategic grid infrastructure expansion.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-emerald-500 hover:from-brand-600 hover:to-emerald-600 text-slate-950 px-6 py-3 rounded-lg font-bold text-lg transition shadow-lg shadow-brand-500/20"
              >
                Access Dashboard <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold text-lg transition"
              >
                View Mathematical Models
              </button>
            </div>
          </div>

          {/* Visual card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-2xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -z-10" />
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
              📊 Predictive Analysis Flow
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-slate-800 p-2 rounded-lg text-brand-500 mt-1">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">1. Historical Seeding</h4>
                  <p className="text-sm text-slate-400">90-day time-series capturing weekday commute peaks, weekend travels, and seasonal shifts.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-slate-800 p-2 rounded-lg text-blue-500 mt-1">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">2. Multi-Model Forecast</h4>
                  <p className="text-sm text-slate-400">SMA, WMA, and Least-Squares Linear Regression model predictions computed in pure Java.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-slate-800 p-2 rounded-lg text-amber-500 mt-1">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">3. Priority Recommendation</h4>
                  <p className="text-sm text-slate-400">Under-served zones are extracted and ranked via a custom Heap Priority Queue based on capacity gap.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Methodology section */}
        <section id="methodology" className="border-t border-slate-800 pt-16 flex flex-col gap-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white">Mathematical Forecasting Engine</h2>
            <p className="text-slate-400 mt-2">
              The Java backend uses three distinct statistical algorithms to generate forecasts, combined via ensemble averaging.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* SMA */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
              <h3 className="font-bold text-lg text-brand-400">Simple Moving Average (SMA)</h3>
              <p className="text-sm text-slate-400">
                Averages the latest $N$ values in the rolling window. Smooths out high-frequency fluctuations.
              </p>
              <div className="bg-slate-950 p-3 rounded font-mono text-xs text-brand-500 border border-slate-800">
                SMA = ( Σ y_i ) / N
              </div>
            </div>

            {/* WMA */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
              <h3 className="font-bold text-lg text-emerald-400">Weighted Moving Average (WMA)</h3>
              <p className="text-sm text-slate-400">
                Assigns increasing weights $1, 2, \dots, N$ to recent observations, prioritizing latest demand.
              </p>
              <div className="bg-slate-950 p-3 rounded font-mono text-xs text-emerald-500 border border-slate-800">
                WMA = ( Σ (y_i * i) ) / Σ i
              </div>
            </div>

            {/* Linear Regression */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
              <h3 className="font-bold text-lg text-blue-400">Linear Regression (Least Squares)</h3>
              <p className="text-sm text-slate-400">
                Fits a trendline $y = mx + c$ through the rolling window using ordinary least squares regression.
              </p>
              <div className="bg-slate-950 p-3 rounded font-mono text-xs text-blue-500 border border-slate-800">
                m = [nΣxy - ΣxΣy] / [nΣx² - (Σx)²]
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2026 EV Charging Demand Predictor Project. Built for smart infrastructure planning.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
