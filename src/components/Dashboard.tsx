import { AnalyticsData } from '../services/analytics';
import { TrendingUp, Package, MapPin, Calendar, Percent } from 'lucide-react';

interface DashboardProps {
  analytics: AnalyticsData;
}

export default function Dashboard({ analytics }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Top Products by Revenue</h2>
          </div>
          <div className="space-y-3">
            {analytics.topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.quantity} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Top Categories</h2>
          </div>
          <div className="space-y-3">
            {analytics.topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{category.category}</p>
                    <p className="text-xs text-slate-500">{category.count} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">${category.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Regional Performance</h2>
          </div>
          <div className="space-y-3">
            {analytics.regionalPerformance.map((region, index) => {
              const maxRevenue = Math.max(...analytics.regionalPerformance.map(r => r.revenue));
              const percentage = (region.revenue / maxRevenue) * 100;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{region.region}</span>
                      <span className="text-xs text-slate-500">({region.sales} sales)</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      ${region.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Profit Margin by Category</h2>
          </div>
          <div className="space-y-3">
            {analytics.profitMarginByCategory.map((item, index) => {
              const maxMargin = Math.max(...analytics.profitMarginByCategory.map(i => i.margin));
              const percentage = maxMargin > 0 ? (item.margin / maxMargin) * 100 : 0;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{item.category}</span>
                    <span className="font-bold text-emerald-600">{item.margin.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl font-bold text-slate-900">Monthly Trends</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Sales</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {analytics.monthlyTrends.slice(-6).map((trend, index) => {
                const avgOrder = trend.sales > 0 ? trend.revenue / trend.sales : 0;
                const isLatest = index === analytics.monthlyTrends.slice(-6).length - 1;

                return (
                  <tr
                    key={index}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      isLatest ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className={`font-medium ${isLatest ? 'text-blue-700' : 'text-slate-900'}`}>
                        {new Date(trend.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      ${trend.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">{trend.sales}</td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      ${avgOrder.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
