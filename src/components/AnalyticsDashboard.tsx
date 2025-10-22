import { BarChart, LineChart, PieChart, TrendingUp, Database, AlertTriangle, Activity } from 'lucide-react';

interface AnalyticsDashboardProps {
  analysis: any;
}

export default function AnalyticsDashboard({ analysis }: AnalyticsDashboardProps) {
  const { columns, results } = analysis;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{results.rowCount.toLocaleString()}</span>
          </div>
          <p className="text-blue-100 font-medium">Total Rows</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <BarChart className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{results.columnCount}</span>
          </div>
          <p className="text-emerald-100 font-medium">Total Columns</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{results.numericColumns.length}</span>
          </div>
          <p className="text-amber-100 font-medium">Numeric Columns</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <PieChart className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{results.categoricalColumns.length}</span>
          </div>
          <p className="text-purple-100 font-medium">Categorical Columns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Column Statistics</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {columns.map((col: any, index: number) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{col.name}</h3>
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${col.type === 'numeric' ? 'bg-blue-100 text-blue-700' : ''}
                    ${col.type === 'categorical' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${col.type === 'datetime' ? 'bg-purple-100 text-purple-700' : ''}
                    ${col.type === 'text' ? 'bg-slate-100 text-slate-700' : ''}
                  `}>
                    {col.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-600">
                    <span className="font-medium">Count:</span> {col.stats.count}
                  </div>
                  <div className="text-slate-600">
                    <span className="font-medium">Unique:</span> {col.stats.unique}
                  </div>
                  {col.type === 'numeric' && (
                    <>
                      <div className="text-slate-600">
                        <span className="font-medium">Mean:</span> {col.stats.mean?.toFixed(2)}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Std:</span> {col.stats.std?.toFixed(2)}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Min:</span> {col.stats.min}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Max:</span> {col.stats.max}
                      </div>
                    </>
                  )}
                  {col.stats.nullCount > 0 && (
                    <div className="col-span-2 text-red-600">
                      <span className="font-medium">Missing:</span> {col.stats.nullCount} ({((col.stats.nullCount / results.rowCount) * 100).toFixed(1)}%)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {results.numericColumns.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-slate-700" />
                <h2 className="text-xl font-bold text-slate-900">Numeric Summary</h2>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(results.numericSummary).map(([key, stats]: [string, any], index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-slate-900 mb-2">{key}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-slate-700">Mean: <span className="font-bold">{stats.mean?.toFixed(2)}</span></div>
                      <div className="text-slate-700">Median: <span className="font-bold">{stats.median?.toFixed(2)}</span></div>
                      <div className="text-slate-700">Min: <span className="font-bold">{stats.min}</span></div>
                      <div className="text-slate-700">Max: <span className="font-bold">{stats.max}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.missingDataAnalysis?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-bold text-slate-900">Missing Data Analysis</h2>
              </div>
              <div className="space-y-2">
                {results.missingDataAnalysis.map((item: any, index: number) => (
                  <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{item.column}</span>
                      <span className="text-amber-700 font-bold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {results.categoryDistributions && Object.keys(results.categoryDistributions).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Category Distributions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results.categoryDistributions).map(([key, dist]: [string, any], index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">{key}</h3>
                <div className="space-y-2">
                  {Object.entries(dist)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .slice(0, 5)
                    .map(([value, count]: [string, any], i) => {
                      const total = Object.values(dist).reduce((a: number, b: any) => a + b, 0) as number;
                      const percentage = (count / total) * 100;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 truncate">{value}</span>
                            <span className="font-semibold text-slate-900">{count}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div
                              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.correlations && Object.keys(results.correlations).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Correlation Analysis</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="space-y-2">
              {Object.entries(results.correlations).map(([col1, corrs]: [string, any]) => (
                Object.entries(corrs).map(([col2, corr]: [string, any], index) => {
                  const corrValue = Number(corr);
                  const absCorr = Math.abs(corrValue);
                  const strength = absCorr > 0.7 ? 'Strong' : absCorr > 0.4 ? 'Moderate' : 'Weak';
                  const color = absCorr > 0.7 ? 'text-red-600' : absCorr > 0.4 ? 'text-amber-600' : 'text-slate-600';

                  return (
                    <div key={`${col1}-${col2}-${index}`} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900">{col1}</span>
                        <span className="text-slate-500 mx-2">↔</span>
                        <span className="font-semibold text-slate-900">{col2}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${color}`}>{corrValue.toFixed(3)}</span>
                        <span className="text-xs text-slate-500 px-2 py-1 bg-white rounded">{strength}</span>
                      </div>
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl font-bold text-slate-900">Data Preview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300">
                {results.topRecords[0] && Object.keys(results.topRecords[0]).map((header: string, i: number) => (
                  <th key={i} className="text-left py-3 px-4 font-semibold text-slate-700 bg-slate-50">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.topRecords.map((row: any, i: number) => (
                <tr key={i} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  {Object.values(row).map((value: any, j: number) => (
                    <td key={j} className="py-3 px-4 text-slate-700">
                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
