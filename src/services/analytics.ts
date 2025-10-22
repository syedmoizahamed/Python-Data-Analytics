export interface AnalyticsData {
  totalRevenue: number;
  totalProfit: number;
  totalSales: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; revenue: number; quantity: number }>;
  topCategories: Array<{ category: string; revenue: number; count: number }>;
  regionalPerformance: Array<{ region: string; revenue: number; sales: number }>;
  monthlyTrends: Array<{ month: string; revenue: number; sales: number }>;
  profitMarginByCategory: Array<{ category: string; margin: number }>;
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiUrl = `${supabaseUrl}/functions/v1/python-analytics`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  return response.json();
}
