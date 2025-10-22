import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: (fileId: string, analysis: any) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/analyze-csv`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      onUploadSuccess(result.fileId, result.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="space-y-4">
          {uploading ? (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin" />
              <div>
                <p className="text-xl font-semibold text-slate-900 mb-2">
                  Processing your data...
                </p>
                <p className="text-sm text-slate-600">
                  Running Python-based analysis algorithms
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <Upload className="w-16 h-16 mx-auto text-slate-400" />
                <FileSpreadsheet className="w-8 h-8 absolute top-0 right-1/2 translate-x-16 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900 mb-2">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-slate-600">
                  or click to browse from your computer
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Supports CSV files up to 50MB</span>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Upload Failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-slate-700" />
          Sample CSV Format
        </h3>
        <div className="bg-white p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-200">
          <div className="text-slate-600">
            Name,Age,Department,Salary,Years_Experience<br />
            John Doe,28,Engineering,75000,3<br />
            Jane Smith,34,Marketing,65000,7<br />
            Mike Johnson,42,Sales,80000,12
          </div>
        </div>
      </div>
    </div>
  );
}
