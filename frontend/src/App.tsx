import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BatteryCharging, Grid, Zap, AlertTriangle, Download, BarChart2, 
  Menu, X, Home 
} from 'lucide-react';

// Import Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ZonesPage from './pages/ZonesPage';
import ZoneDetailsPage from './pages/ZoneDetailsPage';
import StationsPage from './pages/StationsPage';
import ForecastPage from './pages/ForecastPage';
import PriorityPage from './pages/PriorityPage';
import SimulationPage from './pages/SimulationPage';
import ReportsPage from './pages/ReportsPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If we are on the landing page, don't show the dashboard shell
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { name: 'City Zones', path: '/zones', icon: <Grid className="w-4 h-4" /> },
    { name: 'Stations Grid', path: '/stations', icon: <Zap className="w-4 h-4" /> },
    { name: 'Forecast Sandbox', path: '/forecast', icon: <BarChart2 className="w-4 h-4" /> },
    { name: 'Priority Ranking', path: '/priority', icon: <AlertTriangle className="w-4 h-4" /> },
    { name: 'What-If Simulator', path: '/simulation', icon: <Zap className="w-4 h-4" /> },
    { name: 'Reports Center', path: '/reports', icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-slate-900 bg-slate-900/60 backdrop-blur px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <BatteryCharging className="w-6 h-6 text-brand-500" />
          <span className="font-bold text-sm text-white tracking-wider">EV ChargePredict</span>
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex flex-col w-64 bg-slate-900 border-r border-slate-850 p-6 z-40 transition-transform duration-200 ease-in-out shrink-0
      `}>
        {/* Logo */}
        <Link to="/" className="hidden md:flex items-center gap-2 mb-8">
          <div className="bg-brand-500 p-1.5 rounded-lg text-slate-950">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            EV Charge<span className="text-brand-500">Predict</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="space-y-1.5 flex-grow">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive 
                    ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer info */}
        <div className="border-t border-slate-800/80 pt-4 mt-auto text-[10px] text-slate-500 text-center font-mono">
          <span>EV Charging Demand Predictor</span>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/zones" element={<ZonesPage />} />
          <Route path="/zones/:id" element={<ZoneDetailsPage />} />
          <Route path="/stations" element={<StationsPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/priority" element={<PriorityPage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
