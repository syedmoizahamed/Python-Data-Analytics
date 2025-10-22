import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ColumnStats {
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  count: number;
  unique?: number;
  nullCount: number;
  mode?: any;
}

interface ColumnInfo {
  name: string;
  type: string;
  stats: ColumnStats;
  sampleValues: any[];
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

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    const text = await file.text();
    const data = parseCSV(text);

    if (data.length === 0) {
      throw new Error('CSV file is empty');
    }

    const analysis = await performPythonStyleAnalysis(data);

    const { data: uploadedFile, error: insertError } = await supabase
      .from('uploaded_files')
      .insert({
        filename: file.name,
        file_size: file.size,
        file_type: file.type,
        status: 'completed',
        row_count: data.length,
        column_count: analysis.columns.length,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    for (const col of analysis.columns) {
      await supabase.from('dataset_columns').insert({
        file_id: uploadedFile.id,
        column_name: col.name,
        column_type: col.type,
        sample_values: col.sampleValues,
        stats: col.stats,
      });
    }

    await supabase.from('analysis_results').insert({
      file_id: uploadedFile.id,
      analysis_type: 'comprehensive',
      results: analysis.results,
    });

    return new Response(
      JSON.stringify({
        fileId: uploadedFile.id,
        analysis,
      }),
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

function parseCSV(text: string): Record<string, any>[] {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      const numValue = parseFloat(value);
      row[header] = !isNaN(numValue) && value !== '' ? numValue : value;
    });
    
    data.push(row);
  }

  return data;
}

function detectColumnType(values: any[]): string {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return 'text';

  const numericCount = nonNullValues.filter(v => typeof v === 'number').length;
  const numericRatio = numericCount / nonNullValues.length;

  if (numericRatio > 0.8) return 'numeric';

  const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  const dateCount = nonNullValues.filter(v => 
    typeof v === 'string' && datePattern.test(v)
  ).length;
  
  if (dateCount / nonNullValues.length > 0.8) return 'datetime';

  const uniqueRatio = new Set(nonNullValues).size / nonNullValues.length;
  if (uniqueRatio < 0.1) return 'categorical';

  return 'text';
}

function calculateStats(values: any[], type: string): ColumnStats {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  const nullCount = values.length - nonNullValues.length;

  const stats: ColumnStats = {
    count: nonNullValues.length,
    nullCount,
  };

  if (type === 'numeric') {
    const numbers = nonNullValues.filter(v => typeof v === 'number');
    if (numbers.length > 0) {
      const sorted = [...numbers].sort((a, b) => a - b);
      stats.min = sorted[0];
      stats.max = sorted[sorted.length - 1];
      stats.mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      stats.median = sorted[Math.floor(sorted.length / 2)];
      
      const variance = numbers.reduce((acc, val) => 
        acc + Math.pow(val - stats.mean!, 2), 0
      ) / numbers.length;
      stats.std = Math.sqrt(variance);
    }
  }

  stats.unique = new Set(nonNullValues).size;

  const frequency = new Map<any, number>();
  nonNullValues.forEach(v => {
    frequency.set(v, (frequency.get(v) || 0) + 1);
  });
  
  let maxFreq = 0;
  let mode = null;
  frequency.forEach((count, value) => {
    if (count > maxFreq) {
      maxFreq = count;
      mode = value;
    }
  });
  stats.mode = mode;

  return stats;
}

async function performPythonStyleAnalysis(data: Record<string, any>[]) {
  const columns: ColumnInfo[] = [];
  const headers = Object.keys(data[0]);

  for (const header of headers) {
    const values = data.map(row => row[header]);
    const type = detectColumnType(values);
    const stats = calculateStats(values, type);
    const sampleValues = values.slice(0, 5);

    columns.push({
      name: header,
      type,
      stats,
      sampleValues,
    });
  }

  const numericColumns = columns.filter(c => c.type === 'numeric');
  const categoricalColumns = columns.filter(c => c.type === 'categorical');

  const correlations: Record<string, Record<string, number>> = {};
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i].name;
      const col2 = numericColumns[j].name;
      const corr = calculateCorrelation(
        data.map(row => row[col1]).filter(v => typeof v === 'number'),
        data.map(row => row[col2]).filter(v => typeof v === 'number')
      );
      
      if (!correlations[col1]) correlations[col1] = {};
      correlations[col1][col2] = corr;
    }
  }

  const categoryDistributions: Record<string, Record<string, number>> = {};
  for (const col of categoricalColumns) {
    const values = data.map(row => row[col.name]);
    const distribution: Record<string, number> = {};
    
    values.forEach(v => {
      if (v !== null && v !== undefined && v !== '') {
        distribution[v] = (distribution[v] || 0) + 1;
      }
    });
    
    categoryDistributions[col.name] = distribution;
  }

  const topRecords = data.slice(0, 10);
  const bottomRecords = data.slice(-10);

  const numericSummary: Record<string, any> = {};
  numericColumns.forEach(col => {
    numericSummary[col.name] = col.stats;
  });

  const missingDataAnalysis = columns.map(col => ({
    column: col.name,
    missing: col.stats.nullCount,
    percentage: (col.stats.nullCount / data.length * 100).toFixed(2),
  })).filter(item => item.missing > 0);

  return {
    columns,
    results: {
      rowCount: data.length,
      columnCount: columns.length,
      numericColumns: numericColumns.map(c => c.name),
      categoricalColumns: categoricalColumns.map(c => c.name),
      numericSummary,
      correlations,
      categoryDistributions,
      missingDataAnalysis,
      topRecords,
      bottomRecords,
    },
  };
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}