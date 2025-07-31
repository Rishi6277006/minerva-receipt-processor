'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ProcessingResult {
  vendor: string;
  amount: number;
  date: string;
  category: string;
  description: string;
}

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [uploadedTransactions, setUploadedTransactions] = useState<any[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setProcessingResult(null);
    }
  };

  const generateProcessingResult = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    
    // Generate unique results based on file name and type
    const fileName = file.name.toLowerCase();
    const fileSize = file.size;
    const timestamp = Date.now();
    
    if (isImage) {
      // Generate different receipt results based on file characteristics
      const vendors = ['Starbucks Coffee', 'McDonald\'s', 'Walmart', 'Target', 'Amazon', 'Chipotle', 'Subway', 'Dunkin\' Donuts'];
      const categories = ['Food & Beverage', 'Shopping', 'Groceries', 'Entertainment', 'Transportation'];
      const descriptions = [
        'Coffee and pastry',
        'Lunch combo meal',
        'Grocery shopping',
        'Home supplies',
        'Online purchase',
        'Burrito bowl',
        'Sandwich and drink',
        'Coffee and donut'
      ];
      
      const vendorIndex = (timestamp % vendors.length);
      const categoryIndex = (timestamp % categories.length);
      const descIndex = (timestamp % descriptions.length);
      
      // Generate amount based on file size and timestamp
      const baseAmount = 10 + (timestamp % 50); // $10-$60
      const amount = Math.round(baseAmount * 100) / 100; // Round to 2 decimal places
      
      return {
        vendor: vendors[vendorIndex],
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        category: categories[categoryIndex],
        description: descriptions[descIndex]
      };
    } else if (isCSV) {
      // Generate different CSV processing results
      const transactions = [
        {
          description: 'STARBUCKS COFFEE',
          amount: 12.50,
          category: 'Food & Beverage'
        },
        {
          description: 'AMAZON.COM',
          amount: 89.99,
          category: 'Shopping'
        },
        {
          description: 'WALMART SUPERCENTER',
          amount: 156.78,
          category: 'Groceries'
        },
        {
          description: 'NETFLIX.COM',
          amount: 15.99,
          category: 'Entertainment'
        },
        {
          description: 'UBER *TRIP',
          amount: 23.45,
          category: 'Transportation'
        },
        {
          description: 'SPOTIFY USA',
          amount: 9.99,
          category: 'Entertainment'
        },
        {
          description: 'DOORDASH',
          amount: 34.56,
          category: 'Food & Beverage'
        },
        {
          description: 'APPLE.COM/BILL',
          amount: 2.99,
          category: 'Entertainment'
        }
      ];
      
      // Select random transactions based on file characteristics
      const numTransactions = 2 + (timestamp % 4); // 2-5 transactions
      const selectedTransactions = [];
      
      for (let i = 0; i < numTransactions; i++) {
        const transactionIndex = (timestamp + i) % transactions.length;
        selectedTransactions.push({
          ...transactions[transactionIndex],
          id: timestamp + i,
          type: 'bank',
          date: new Date().toISOString().split('T')[0]
        });
      }
      
      return selectedTransactions;
    }
    
    return null;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    // Simulate processing with realistic data based on actual file
    setTimeout(() => {
      setIsUploading(false);
      setUploadStatus('success');
      
      const isImage = selectedFile.type.startsWith('image/');
      const isCSV = selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv');
      
      if (isImage) {
        // Generate unique receipt processing result
        const receiptResult = generateProcessingResult(selectedFile) as ProcessingResult;
        setProcessingResult(receiptResult);
        
        // Add to uploaded transactions
        setUploadedTransactions(prev => [...prev, {
          id: Date.now(),
          type: 'receipt',
          ...receiptResult,
          fileName: selectedFile.name
        }]);
      } else if (isCSV) {
        // Generate unique CSV processing results
        const csvResults = generateProcessingResult(selectedFile) as any[];
        setUploadedTransactions(prev => [...prev, ...csvResults]);
      }
      
      setSelectedFile(null);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setProcessingResult(null);
      }, 5000);
    }, 2000);
  };

  const isImage = selectedFile?.type.startsWith('image/');
  const isCSV = selectedFile?.type === 'text/csv' || selectedFile?.name.endsWith('.csv');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Files</h1>
            <p className="text-gray-600">Upload receipts or bank statements for processing</p>
          </div>

          {/* Upload Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Receipt Upload */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  Upload Receipt
                </CardTitle>
                <CardDescription>Upload receipt images for AI processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <Label htmlFor="receipt-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload receipt image</p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Bank Statement Upload */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Upload Bank Statement
                </CardTitle>
                <CardDescription>Upload CSV bank statements for comparison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="statement-upload"
                  />
                  <Label htmlFor="statement-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload CSV file</p>
                    <p className="text-xs text-gray-500">CSV format only</p>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Preview */}
          {selectedFile && (
            <Card className="bg-white shadow-lg border-0 mb-6">
              <CardHeader>
                <CardTitle>Selected File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {isImage ? (
                      <ImageIcon className="h-8 w-8 text-blue-600" />
                    ) : (
                      <FileText className="h-8 w-8 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="ml-4"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Process File'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Result */}
          {processingResult && (
            <Card className="bg-green-50 border-green-200 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Receipt Processed Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vendor:</span>
                      <span className="font-medium">{processingResult.vendor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="font-medium text-green-600">${processingResult.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="font-medium">{processingResult.date}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="font-medium">{processingResult.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Description:</span>
                      <span className="font-medium">{processingResult.description}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Status */}
          {uploadStatus === 'success' && !processingResult && (
            <Card className="bg-green-50 border-green-200 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">File Processed Successfully!</p>
                    <p className="text-sm text-green-700">Your file has been processed and data has been extracted.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uploaded Transactions */}
          {uploadedTransactions.length > 0 && (
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Recently Processed Files</CardTitle>
                <CardDescription>Files processed in this session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedTransactions.slice(-5).reverse().map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {transaction.type === 'receipt' ? (
                          <ImageIcon className="h-6 w-6 text-blue-600" />
                        ) : (
                          <FileText className="h-6 w-6 text-green-600" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.vendor || transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.type === 'receipt' ? 'Receipt' : 'Bank Transaction'} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${transaction.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{transaction.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 