'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { Upload, FileText, Receipt, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadMutation = trpc.bank.uploadStatement.useMutation({
    onSuccess: () => {
      toast.success('Bank statement uploaded and processed successfully!');
      setCsvFile(null);
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const receiptMutation = trpc.receipt.parseAndAdd.useMutation({
    onSuccess: () => {
      toast.success('Receipt processed and added to ledger!');
      setReceiptFile(null);
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file to upload.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        // Simple CSV parsing - adjust for real-world CSV formats
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const transactions = lines.slice(1).map(line => {
          const [date, description, amountStr, type] = line.split(',');
          return {
            transactionDate: new Date(date).toISOString(),
            description: description.trim(),
            amount: parseFloat(amountStr),
            type: type?.trim(),
          };
        });

        uploadMutation.mutate({
          transactions,
          sourceFile: csvFile.name,
        });
      } catch (error) {
        toast.error('Invalid CSV format. Please check your file.');
        setIsProcessing(false);
      }
    };
    reader.readAsText(csvFile);
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile) {
      toast.error('Please select a receipt file to upload.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        // For now, we'll use the file content as receipt text
        // In a real implementation, you'd extract text from PDF/image
        receiptMutation.mutate({
          receiptText: text,
          receiptUrl: receiptFile.name,
        });
      } catch (error) {
        toast.error('Error processing receipt file.');
        setIsProcessing(false);
      }
    };
    reader.readAsText(receiptFile);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Upload Files</h1>
            <p className="mt-2 text-gray-600">
              Upload bank statements and receipts for processing
            </p>
          </div>

          <Tabs defaultValue="bank" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bank" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Bank Statement</span>
              </TabsTrigger>
              <TabsTrigger value="receipt" className="flex items-center space-x-2">
                <Receipt className="h-4 w-4" />
                <span>Receipt</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bank">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Upload Bank Statement
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV file containing your bank transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="bank-statement">Bank Statement (CSV)</Label>
                    <Input 
                      id="bank-statement" 
                      type="file" 
                      accept=".csv" 
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  
                  {csvFile && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>{csvFile.name} selected</span>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">CSV Format Requirements:</p>
                        <p className="mt-1">Date, Description, Amount, Type (optional)</p>
                        <p className="mt-1">Example: 2024-01-15, Grocery Store, 45.67, DEBIT</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCsvUpload} 
                    disabled={uploadMutation.isLoading || !csvFile || isProcessing}
                    className="w-full"
                  >
                    {uploadMutation.isLoading || isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload and Process
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="receipt">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="mr-2 h-5 w-5" />
                    Upload Receipt
                  </CardTitle>
                  <CardDescription>
                    Upload a receipt file for AI-powered processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="receipt-file">Receipt File</Label>
                    <Input 
                      id="receipt-file" 
                      type="file" 
                      accept=".pdf,.txt,.jpg,.jpeg,.png" 
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  
                  {receiptFile && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>{receiptFile.name} selected</span>
                    </div>
                  )}

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div className="text-sm text-purple-800">
                        <p className="font-medium">AI Processing:</p>
                        <p className="mt-1">Our AI will automatically extract vendor, amount, date, and category from your receipt.</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleReceiptUpload} 
                    disabled={receiptMutation.isLoading || !receiptFile || isProcessing}
                    className="w-full"
                  >
                    {receiptMutation.isLoading || isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Process Receipt
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 