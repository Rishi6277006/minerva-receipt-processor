'use client';

import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/utils/trpc';
import { Upload, FileText, Receipt, AlertCircle, Eye, CheckCircle, Camera, Image } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [receiptText, setReceiptText] = useState('');
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [receiptProcessingResult, setReceiptProcessingResult] = useState<any>(null);
  const [extractedText, setExtractedText] = useState<string>('');

  // Get bank transactions to show after upload
  const { data: bankTransactions, refetch: refetchTransactions } = trpc.bank.getTransactions.useQuery();

  const uploadBankStatement = trpc.bank.uploadStatement.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.transactionsCount} transactions!`);
      setSelectedFile(null);
      setCsvPreview([]);
      setShowPreview(false);
      // Refresh bank transactions
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Error uploading bank statement: ${error.message}`);
    }
  });

  const parseReceipt = trpc.receipt.parseAndAdd.useMutation({
    onSuccess: (data) => {
      toast.success('Receipt processed and added successfully!');
      setReceiptText('');
      setReceiptProcessingResult(data);
      // Don't refresh the page - let the results show
    },
    onError: (error) => {
      toast.error(`Error processing receipt: ${error.message}`);
    }
  });

  const uploadReceiptImage = trpc.receipt.uploadImage.useMutation({
    onSuccess: (data) => {
      toast.success('Receipt image processed and added successfully!');
      setSelectedImage(null);
      setImagePreview('');
      setReceiptProcessingResult(data);
      setExtractedText(data.extractedText || '');
      // Don't refresh the page - let the results show
    },
    onError: (error) => {
      toast.error(`Error processing receipt image: ${error.message}`);
    }
  });

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      console.log('File content preview:', csvData.substring(0, 200));
      console.log('File size:', csvData.length);
      console.log('File name:', selectedFile.name);
      uploadBankStatement.mutate({ csvData }); // Send csvData as string
    };
    reader.readAsText(selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast.error('Please select a CSV file (.csv extension)');
        setSelectedFile(null);
        setCsvPreview([]);
        setShowPreview(false);
        return;
      }
      
      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast.error('File size too large. Please select a file smaller than 1MB');
        setSelectedFile(null);
        setCsvPreview([]);
        setShowPreview(false);
        return;
      }
      
      // Check file content type
      if (file.type && file.type !== 'text/csv' && file.type !== 'text/plain') {
        toast.error('Invalid file type. Please select a plain text CSV file');
        setSelectedFile(null);
        setCsvPreview([]);
        setShowPreview(false);
        return;
      }
    }
    
    setSelectedFile(file);
    
    if (file) {
      // Preview CSV content
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          
          // Only check for definitive Excel file signatures
          // PK\x03\x04 is the ZIP file signature that Excel files use
          if (csv.startsWith('PK\x03\x04') || csv.includes('[Content_Types].xml')) {
            setCsvPreview([]);
            setShowPreview(false);
            toast.error('This appears to be an Excel file (.xlsx). Please save it as a CSV file first.');
            setSelectedFile(null);
            return;
          }
          
          // Check if it's actually CSV content
          const lines = csv.split('\n');
          if (lines.length < 2) {
            setCsvPreview([]);
            setShowPreview(false);
            toast.error('CSV file appears to be empty or invalid.');
            setSelectedFile(null);
            return;
          }
          
          const firstLine = lines[0].trim();
          if (!firstLine.includes(',') || firstLine.split(',').length < 2) {
            setCsvPreview([]);
            setShowPreview(false);
            toast.error('File does not appear to be a valid CSV format.');
            setSelectedFile(null);
            return;
          }
          
          const headers = firstLine.split(',').map(h => h.trim());
          const preview = lines.slice(1, 6).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          }).filter(row => Object.values(row).some(val => val !== ''));
          
          setCsvPreview(preview);
          setShowPreview(true);
        } catch (error) {
          setCsvPreview([]);
          setShowPreview(false);
          toast.error('Error reading CSV file. Please check the file format.');
          setSelectedFile(null);
        }
      };
      
      reader.onerror = () => {
        setCsvPreview([]);
        setShowPreview(false);
        toast.error('Error reading file. Please try again.');
        setSelectedFile(null);
      };
      
      reader.readAsText(file);
    }
  };

  const handleReceiptParse = () => {
    if (!receiptText.trim()) {
      toast.error('Please enter receipt text first');
      return;
    }

    parseReceipt.mutate({ receiptText });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file too large. Maximum size is 10MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !imagePreview) {
      toast.error('Please select an image first');
      return;
    }

    uploadReceiptImage.mutate({
      imageData: imagePreview,
      filename: selectedImage.name
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Upload Data</h1>
            <p className="mt-2 text-gray-600">
              Upload bank statements and process receipts to build your ledger.
            </p>
          </div>

          <Tabs defaultValue="bank" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bank" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bank Statement
              </TabsTrigger>
              <TabsTrigger value="receipt" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Receipt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bank">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Upload Bank Statement (CSV)
                    </CardTitle>
                    <CardDescription>
                      Upload a CSV file containing your bank transactions. The file should have columns for Date, Description, Amount, and Type.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-file">Select CSV File</Label>
                      <Input
                        id="bank-file"
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                      />
                    </div>
                    
                    {selectedFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        Selected: {selectedFile.name}
                      </div>
                    )}

                    <Button 
                      onClick={handleFileUpload}
                      disabled={!selectedFile || uploadBankStatement.isPending}
                      className="w-full"
                    >
                      {uploadBankStatement.isPending ? (
                        'Uploading...'
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Bank Statement
                        </>
                      )}
                    </Button>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Expected CSV Format:</p>
                          <p className="mt-1">Date,Description,Amount,Type</p>
                          <p className="mt-1">Example: 2024-01-15,Grocery Store,45.67,DEBIT</p>
                          <p className="mt-2 font-medium">Important:</p>
                          <p className="mt-1">• Make sure to select a .csv file, not an Excel (.xlsx) file</p>
                          <p className="mt-1">• If you have an Excel file, save it as CSV first</p>
                          <p className="mt-1">• The file should be plain text, not binary</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CSV Preview */}
                {showPreview && csvPreview.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        CSV Preview
                      </CardTitle>
                      <CardDescription>
                        Preview of the first 5 rows from your CSV file
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(csvPreview[0] || {}).map((header) => (
                              <TableHead key={header}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvPreview.map((row, index) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value, cellIndex) => (
                                <TableCell key={cellIndex}>{value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Uploaded Transactions */}
                {bankTransactions && bankTransactions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Uploaded Transactions
                      </CardTitle>
                      <CardDescription>
                        Recently uploaded bank transactions ({bankTransactions.length} total)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bankTransactions.slice(0, 10).map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                {new Date(transaction.transactionDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                              <TableCell>{transaction.type || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {bankTransactions.length > 10 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Showing first 10 of {bankTransactions.length} transactions
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="receipt">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Process Receipt
                    </CardTitle>
                    <CardDescription>
                      Upload a receipt image or paste receipt text to extract transaction details using AI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="text" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Text Input
                        </TabsTrigger>
                        <TabsTrigger value="image" className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Image Upload
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="text" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="receipt-text">Receipt Text</Label>
                          <textarea
                            id="receipt-text"
                            value={receiptText}
                            onChange={(e) => setReceiptText(e.target.value)}
                            placeholder="Paste your receipt text here...&#10;&#10;Example:&#10;WALMART STORE #1234&#10;Date: 01/15/2024&#10;Total: $28.57"
                            className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <Button 
                          onClick={handleReceiptParse}
                          disabled={!receiptText.trim() || parseReceipt.isPending}
                          className="w-full"
                        >
                          {parseReceipt.isPending ? (
                            'Processing...'
                          ) : (
                            <>
                              <Receipt className="mr-2 h-4 w-4" />
                              Process Receipt
                            </>
                          )}
                        </Button>
                      </TabsContent>

                      <TabsContent value="image" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="receipt-image">Receipt Image</Label>
                          <Input 
                            id="receipt-image" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageSelect}
                          />
                        </div>
                        
                        {selectedImage && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Image className="h-4 w-4" />
                            Selected: {selectedImage.name}
                          </div>
                        )}

                        {imagePreview && (
                          <div className="border rounded-lg p-4">
                            <Label className="text-sm font-medium mb-2 block">Image Preview:</Label>
                            <img 
                              src={imagePreview} 
                              alt="Receipt preview" 
                              className="max-w-full h-48 object-contain border rounded"
                            />
                          </div>
                        )}

                        <Button 
                          onClick={handleImageUpload}
                          disabled={!selectedImage || uploadReceiptImage.isPending}
                          className="w-full"
                        >
                          {uploadReceiptImage.isPending ? (
                            'Processing Image...'
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              Process Receipt Image
                            </>
                          )}
                        </Button>
                      </TabsContent>
                    </Tabs>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="text-sm text-green-800">
                          <p className="font-medium">AI Processing:</p>
                          <p className="mt-1">Our AI will extract vendor, amount, date, category, and description from your receipt text or image.</p>
                          <p className="mt-1">Supported image formats: JPG, PNG, WebP, TIFF (max 10MB)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Receipt Processing Results */}
                {receiptProcessingResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Receipt Information
                      </CardTitle>
                      <CardDescription>
                        Successfully extracted from your receipt
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Vendor:</span>
                          <p className="text-gray-900">{receiptProcessingResult.entry?.vendor || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Amount:</span>
                          <p className="text-gray-900">${receiptProcessingResult.entry?.amount?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Date:</span>
                          <p className="text-gray-900">
                            {receiptProcessingResult.entry?.transactionDate 
                              ? new Date(receiptProcessingResult.entry.transactionDate).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Category:</span>
                          <p className="text-gray-900">{receiptProcessingResult.entry?.category || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                          <span className="text-sm font-medium text-gray-600">Description:</span>
                          <p className="text-gray-900">{receiptProcessingResult.entry?.description || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Clear Results Button */}
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReceiptProcessingResult(null);
                            setExtractedText('');
                          }}
                          className="text-gray-600"
                        >
                          Clear Results
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 