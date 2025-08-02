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
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setProcessingResult(null);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage('');
    
    try {
      const isImage = selectedFile.type.startsWith('image/');
      const isCSV = selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv');
      
      if (isImage) {
        // Compress and convert image to base64 for API
        const base64 = await compressImage(selectedFile);
        
        // Call our API route for image processing with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minute timeout
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: base64,
            filename: selectedFile.name
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        console.log('Image upload response status:', response.status);
        console.log('Image upload request body:', JSON.stringify({
          imageData: base64.substring(0, 50) + '...', // Log first 50 chars
          filename: selectedFile.name
        }));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Image upload error response:', errorText);
          throw new Error(`Failed to process image: ${errorText}`);
        }

        const result = await response.json();
        console.log('Image upload result:', result);
        
        if (result.error) {
          throw new Error(result.error.message || 'Processing failed');
        }

        // Use the actual processed data from backend
        const processedData = result.result?.data || result.data;
        
        if (processedData && processedData.success) {
          const receiptData = processedData.entry || processedData.parsedReceipt || processedData;
          const receiptResult: ProcessingResult = {
            vendor: receiptData.vendor || 'Unknown Vendor',
            amount: receiptData.amount || 0,
            date: receiptData.transactionDate || new Date().toISOString().split('T')[0],
            category: receiptData.category || 'Uncategorized',
            description: receiptData.description || 'Receipt processing'
          };
          
          setProcessingResult(receiptResult);
          
          // Add to uploaded transactions
          setUploadedTransactions(prev => [...prev, {
            id: Date.now(),
            type: 'receipt',
            ...receiptResult,
            fileName: selectedFile.name
          }]);
          
          setUploadStatus('success');
        } else {
          throw new Error('No data received from processing');
        }
        
      } else if (isCSV) {
        // Read CSV file content
        const csvContent = await fileToText(selectedFile);
        console.log('Frontend CSV content:', csvContent);
        console.log('CSV content length:', csvContent.length);
        
        // Call our actual CSV processing API route
        const response = await fetch('/api/upload-csv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            csvData: csvContent
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to process CSV: ${errorText}`);
        }

        const result = await response.json();
        console.log('Upload response:', result);
        
        if (result.error) {
          throw new Error(result.error.message || 'Processing failed');
        }

        // Use the actual processed data from backend
        const processedTransactions = result.result?.data?.transactions || result.data?.transactions || result.transactions || [];
        
        if (processedTransactions.length > 0) {
          setUploadedTransactions(prev => [...prev, ...processedTransactions.map((tx: any) => ({
            id: Date.now() + Math.random(),
            type: 'bank',
            description: tx.description,
            amount: tx.amount,
            date: tx.transactionDate,
            category: tx.category || 'Bank Transaction'
          }))]);
          
          setUploadStatus('success');
        } else {
          throw new Error('No transactions found in CSV');
        }
      }
      
      setSelectedFile(null);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setProcessingResult(null);
      }, 5000);
      
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setErrorMessage('Upload timed out. Please try again with a smaller image or check your connection.');
        } else if (error.message.includes('FUNCTION_INVOCATION_TIMEOUT')) {
          setErrorMessage('Processing timed out. The image may be too large or complex. Please try with a smaller, clearer image.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Upload failed. Please try again.');
      }
      
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 600px width/height for faster processing)
        const maxSize = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress with higher compression for smaller payload
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5); // 50% quality for smaller size
        const base64 = compressedDataUrl.split(',')[1];
        resolve(base64);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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

          {/* Error Message */}
          {errorMessage && (
            <Card className="bg-red-50 border-red-200 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Processing Failed</p>
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
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