import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, RefreshCw, FileText, AlertTriangle } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch text report directly to display in preview box
      const response = await axios.get('http://localhost:8080/api/reports/download?format=txt', {
        responseType: 'text'
      });
      setPreview(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch report preview. Make sure the Java backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  const handleDownload = (format: 'txt' | 'csv') => {
    // Direct browser redirect to download endpoint
    window.open(`http://localhost:8080/api/reports/download?format=${format}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-slate-400">Compiling report analytics...</p>
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
        <button onClick={fetchPreview} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg w-fit text-sm transition">
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
          <h1 className="text-3xl font-extrabold text-white">System Reports</h1>
          <p className="text-slate-400 text-sm mt-1">
            Export calculated demand gaps, priority rankings, and infrastructure recommendations.
          </p>
        </div>
      </div>

      {/* Export triggers card */}
      <div className="grid md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div className="flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" /> Tabular CSV Format
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Export data as a comma-separated values file, ideal for uploading to Microsoft Excel, Google Sheets, or python pandas for downstream analysis.
            </p>
          </div>
          <button
            onClick={() => handleDownload('csv')}
            className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-md w-fit px-6"
          >
            <Download className="w-4 h-4" /> Download CSV Table
          </button>
        </div>

        <div className="flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Formatted Text Audit
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Export a human-readable plain text report featuring aligned tables, priority summaries, and detailed recommendations.
            </p>
          </div>
          <button
            onClick={() => handleDownload('txt')}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 w-fit px-6"
          >
            <Download className="w-4 h-4" /> Download Text Report
          </button>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Document Preview</h3>
          <button
            onClick={fetchPreview}
            className="flex items-center gap-1.5 text-xs text-brand-500 hover:underline font-semibold"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Preview
          </button>
        </div>
        <pre className="bg-slate-950 border border-slate-850 p-6 rounded-xl text-xs font-mono text-slate-350 overflow-x-auto select-all max-h-[500px] leading-relaxed">
          {preview}
        </pre>
      </div>
    </div>
  );
};

export default ReportsPage;
