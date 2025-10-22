import { useState } from 'react';
import { BarChart3, FileUp, Sparkles, CheckCircle2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function App() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const handleUploadSuccess = (id: string, analysisData: any) => {
    setFileId(id);
    setAnalysis(analysisData);
  };

  const handleReset = () => {
    setAnalysis(null);
    setFileId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bTAtOGgydi0yaC0ydjJ6bS0yIDBoLTJ2Mmgydi0yem0yLTJoMnYtMmgtMnYyem0wIDhoLTJ2Mmgydi0yem0yLTJoMnYtMmgtMnYyem0wLTRoMnYtMmgtMnYyem0tMiAwaDJ2LTJoLTJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <BarChart3 className="w-12 h-12 text-blue-400" />
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Python Data Analytics
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Upload your CSV data and get instant insights powered by Python-based analysis algorithms
          </p>
        </div>

        {!analysis ? (
          <div className="space-y-8">
            <FileUpload onUploadSuccess={handleUploadSuccess} />

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                Python-Powered Analysis Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Statistical summary (mean, median, std, min, max)',
                  'Automatic data type detection',
                  'Correlation analysis between numeric columns',
                  'Missing data analysis and visualization',
                  'Category distribution analysis',
                  'Unique value counting and frequency analysis',
                  'Outlier detection using statistical methods',
                  'Data quality assessment',
                  'Sample data preview and exploration',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Fast Processing</h3>
                <p className="text-slate-400 text-sm">
                  Python-based algorithms process your data in seconds, delivering instant insights
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-sm rounded-xl border border-emerald-500/20 p-6">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Smart Analysis</h3>
                <p className="text-slate-400 text-sm">
                  Automatically detects patterns, correlations, and anomalies in your dataset
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <FileUp className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Easy to Use</h3>
                <p className="text-slate-400 text-sm">
                  Simply drag and drop your CSV file to get comprehensive analytics instantly
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Analysis Complete</p>
                  <p className="text-slate-400 text-sm">
                    {analysis.results.rowCount.toLocaleString()} rows, {analysis.results.columnCount} columns analyzed
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FileUp className="w-4 h-4" />
                Upload New File
              </button>
            </div>

            <AnalyticsDashboard analysis={analysis} />
          </div>
        )}
      </div>

      <div className="relative z-10 mt-12 pb-8 text-center text-slate-500 text-sm">
        <p>Powered by Python-based data analysis algorithms</p>
      </div>
    </div>
  );
}

export default App;
