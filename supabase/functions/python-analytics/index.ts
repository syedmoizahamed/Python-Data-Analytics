import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SalesData {
  id: string;
  product_id: string;
  customer_id: string;
  quantity: number;
  total_amount: number;
  sale_date: string;
  products: {
    name: string;
    category: string;
    price: number;
    cost: number;
  };
  customers: {
    name: string;
    region: string;
  };
}

interface AnalyticsResult {
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all sales data with related products and customers
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        products (*),
        customers (*)
      `);

    if (salesError) throw salesError;

    // Python-style data analysis implementation in TypeScript
    const analytics = performDataAnalysis(salesData as SalesData[]);

    return new Response(
      JSON.stringify(analytics),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function performDataAnalysis(salesData: SalesData[]): AnalyticsResult {
  // Calculate total revenue and profit
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalSales = salesData.length;

  const productStats = new Map<string, { revenue: number; quantity: number; cost: number; price: number }>();
  const categoryStats = new Map<string, { revenue: number; count: number; profit: number }>();
  const regionalStats = new Map<string, { revenue: number; sales: number }>();
  const monthlyStats = new Map<string, { revenue: number; sales: number }>();

  // Process each sale
  salesData.forEach(sale => {
    const revenue = Number(sale.total_amount);
    const profit = (Number(sale.products.price) - Number(sale.products.cost)) * sale.quantity;
    
    totalRevenue += revenue;
    totalProfit += profit;

    // Product statistics
    const productName = sale.products.name;
    if (!productStats.has(productName)) {
      productStats.set(productName, { 
        revenue: 0, 
        quantity: 0, 
        cost: Number(sale.products.cost),
        price: Number(sale.products.price)
      });
    }
    const productStat = productStats.get(productName)!;
    productStat.revenue += revenue;
    productStat.quantity += sale.quantity;

    // Category statistics
    const category = sale.products.category;
    if (!categoryStats.has(category)) {
      categoryStats.set(category, { revenue: 0, count: 0, profit: 0 });
    }
    const categoryStat = categoryStats.get(category)!;
    categoryStat.revenue += revenue;
    categoryStat.count += 1;
    categoryStat.profit += profit;

    // Regional statistics
    const region = sale.customers.region;
    if (!regionalStats.has(region)) {
      regionalStats.set(region, { revenue: 0, sales: 0 });
    }
    const regionalStat = regionalStats.get(region)!;
    regionalStat.revenue += revenue;
    regionalStat.sales += 1;

    // Monthly trends
    const saleDate = new Date(sale.sale_date);
    const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyStats.has(monthKey)) {
      monthlyStats.set(monthKey, { revenue: 0, sales: 0 });
    }
    const monthlyStat = monthlyStats.get(monthKey)!;
    monthlyStat.revenue += revenue;
    monthlyStat.sales += 1;
  });

  // Calculate average order value
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Get top products (sorted by revenue)
  const topProducts = Array.from(productStats.entries())
    .map(([name, stats]) => ({
      name,
      revenue: Math.round(stats.revenue * 100) / 100,
      quantity: stats.quantity,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Get top categories
  const topCategories = Array.from(categoryStats.entries())
    .map(([category, stats]) => ({
      category,
      revenue: Math.round(stats.revenue * 100) / 100,
      count: stats.count,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Regional performance
  const regionalPerformance = Array.from(regionalStats.entries())
    .map(([region, stats]) => ({
      region,
      revenue: Math.round(stats.revenue * 100) / 100,
      sales: stats.sales,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Monthly trends (sorted by month)
  const monthlyTrends = Array.from(monthlyStats.entries())
    .map(([month, stats]) => ({
      month,
      revenue: Math.round(stats.revenue * 100) / 100,
      sales: stats.sales,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Profit margin by category
  const profitMarginByCategory = Array.from(categoryStats.entries())
    .map(([category, stats]) => ({
      category,
      margin: stats.revenue > 0 ? Math.round((stats.profit / stats.revenue) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.margin - a.margin);

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    totalSales,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    topProducts,
    topCategories,
    regionalPerformance,
    monthlyTrends,
    profitMarginByCategory,
  };
}