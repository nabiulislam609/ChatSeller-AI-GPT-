import React, { useState } from 'react';
import Papa from 'papaparse';
import { X, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.ts';
import { Product } from '../../types/index.ts';

interface ProductCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingProducts: Product[];
}

export const ProductCsvImportModal: React.FC<ProductCsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingProducts,
}) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ row: number; error: string }[]>([]);
  const [importSummary, setImportSummary] = useState<{ success: number; failed: number } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        validateAndPrepareRows(results.data);
      },
      error: (err) => {
        alert('Failed to parse CSV: ' + err.message);
      },
    });
  };

  const loadSampleCsv = () => {
    const sampleData = [
      {
        sku: 'AT-PANJABI-EMERALD-M',
        name: 'Emerald Heritage Semi-Silk Panjabi',
        nameBn: 'এমেরাল্ড হেরিটেজ সিল্ক পাঞ্জাবি',
        category: 'Panjabi',
        price: '2450',
        salePrice: '2190',
        stockQuantity: '15',
        colors: 'Emerald Green',
        sizes: 'M (40), L (42)',
        description: 'Jacquard cotton blend festive panjabi.',
      },
      {
        sku: 'AT-SAREE-MIDNIGHT-SILK',
        name: 'Midnight Black Katan Silk Saree',
        nameBn: 'মিডনাইট ব্ল্যাক কাতান সিল্ক শাড়ি',
        category: 'Saree',
        price: '4200',
        salePrice: '3850',
        stockQuantity: '8',
        colors: 'Midnight Black',
        sizes: 'Free Size',
        description: 'Pure traditional Katan with antique zari border.',
      },
      {
        sku: 'AT-POLO-PIQUE-LUXE', // Existing SKU intentionally to show duplicate detection!
        name: 'Duplicate SKU Item Test',
        category: 'Polo & Casuals',
        price: '990',
        stockQuantity: '10',
        colors: 'Grey',
        sizes: 'L',
        description: 'Test duplicate detection',
      },
    ];
    validateAndPrepareRows(sampleData);
  };

  const validateAndPrepareRows = (rows: any[]) => {
    const errors: { row: number; error: string }[] = [];
    const existingSkus = new Set(existingProducts.map((p) => p.sku.toUpperCase()));
    const seenInFile = new Set<string>();

    const validated = rows.map((r, idx) => {
      const rowNum = idx + 1;
      const sku = (r.sku || r.SKU || '').trim().toUpperCase();
      const name = (r.name || r.Name || r['Product Name'] || '').trim();
      const price = Number(r.price || r.Price || 0);

      let isInvalid = false;
      let reason = '';

      if (!sku) {
        errors.push({ row: rowNum, error: 'Missing SKU' });
        isInvalid = true;
        reason = 'Missing SKU';
      } else if (existingSkus.has(sku)) {
        errors.push({ row: rowNum, error: `SKU "${sku}" already exists in store catalog` });
        isInvalid = true;
        reason = 'Duplicate in catalog';
      } else if (seenInFile.has(sku)) {
        errors.push({ row: rowNum, error: `SKU "${sku}" repeated inside CSV file` });
        isInvalid = true;
        reason = 'Duplicate in file';
      } else {
        seenInFile.add(sku);
      }

      if (!name) {
        errors.push({ row: rowNum, error: 'Missing product name' });
        isInvalid = true;
        reason = reason ? `${reason}, Missing name` : 'Missing name';
      }

      if (price <= 0) {
        errors.push({ row: rowNum, error: 'Price must be greater than 0' });
        isInvalid = true;
        reason = reason ? `${reason}, Invalid price` : 'Invalid price';
      }

      return {
        ...r,
        sku,
        name,
        price,
        salePrice: r.salePrice ? Number(r.salePrice) : undefined,
        stockQuantity: Number(r.stockQuantity || 10),
        category: r.category || 'General',
        isValid: !isInvalid,
        validationReason: reason,
      };
    });

    setParsedRows(validated);
    setValidationErrors(errors);
    setStep('preview');
  };

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setStep('importing');
    try {
      const res = await api.bulkImportProducts(validRows);
      setImportSummary({ success: res.importedCount, failed: res.errors.length });
      onSuccess();
    } catch (err: any) {
      alert('Import failed: ' + err.message);
      setStep('preview');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Import Products (CSV / Spreadsheet)</h3>
              <p className="text-xs text-slate-500">
                Safe bulk upload with column mapping, preview, and duplicate SKU detection.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on step */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-700 transition-colors bg-slate-50/50">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <div className="text-sm font-semibold text-slate-800">Select CSV file from your computer</div>
                <div className="text-xs text-slate-500 mt-1 mb-4">
                  Expected columns: <code className="font-mono text-blue-900">sku, name, category, price, stockQuantity</code>
                </div>
                <label className="inline-flex items-center px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs">
                  <span>Browse CSV File</span>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-950">Don't have a CSV file handy?</div>
                  <div className="text-[11px] text-blue-800">Load our pre-built sample spreadsheet with valid & test rows.</div>
                </div>
                <button
                  type="button"
                  onClick={loadSampleCsv}
                  className="px-3 py-1.5 text-xs font-semibold bg-white text-blue-900 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors shadow-xs"
                >
                  Load Sample CSV
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {/* Validation Summary Bar */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{parsedRows.filter((r) => r.isValid).length} Valid rows to import</span>
                  </div>
                  {validationErrors.length > 0 && (
                    <div className="flex items-center space-x-1.5 text-amber-700 font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{validationErrors.length} Invalid / Duplicate rows skipped</span>
                    </div>
                  )}
                </div>
                <div className="text-slate-500 font-medium">Total Rows: {parsedRows.length}</div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[11px] font-semibold text-slate-700 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-center">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/60 text-slate-500'}>
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <span className="inline-block text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Valid
                            </span>
                          ) : (
                            <span
                              className="inline-block text-[10px] font-medium text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded"
                              title={row.validationReason}
                            >
                              {row.validationReason}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-800">{row.sku}</td>
                        <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-[200px]">{row.name}</td>
                        <td className="py-2 px-3 text-slate-600">{row.category}</td>
                        <td className="py-2 px-3 text-right font-medium">৳{Number(row.price).toLocaleString()}</td>
                        <td className="py-2 px-3 text-center">{row.stockQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-slate-500">
                Note: Invalid rows will be skipped safely without modifying your existing catalog.
              </div>
            </div>
          )}

          {step === 'importing' && !importSummary && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-sm font-semibold text-slate-800">Processing Import...</div>
              <div className="text-xs text-slate-500">Creating catalog items and variants in database</div>
            </div>
          )}

          {importSummary && (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Products Successfully Imported!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Added {importSummary.success} new products to your catalog. {importSummary.failed} duplicate or invalid rows were safely bypassed.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step === 'preview' && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => setStep('upload')}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Back
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedRows.filter((r) => r.isValid).length === 0}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <span>Confirm & Import ({parsedRows.filter((r) => r.isValid).length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
