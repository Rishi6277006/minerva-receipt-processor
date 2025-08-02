'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, DollarSign, BarChart3, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface LedgerEntry {
  id: string;
  vendor: string;
  amount: number;
  transactionDate: string;
  category: string | null;
  description: string | null;
}

interface BankTransaction {
  id: string;
  description: string;
  amount: number;
  transactionDate: string;
  type: string | null;
}

export default function ComparePage() {
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [bankData, setBankData] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch ledger data
        const ledgerResponse = await fetch('/api/ledger');
        const ledgerResult = await ledgerResponse.json();
        setLedgerData(ledgerResult.result?.data || []);

        // Fetch bank data
        const bankResponse = await fetch('/api/bank');
        const bankResult = await bankResponse.json();
        setBankData(bankResult.result?.data || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load comparison data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate comparison data
  const calculateComparison = () => {
    const matched: any[] = [];
    const ledgerOnly: LedgerEntry[] = [];
    const bankOnly: BankTransaction[] = [];

    // Simple matching logic (can be enhanced)
    ledgerData.forEach(ledgerEntry => {
      const matchingBank = bankData.find(bankTx => 
        Math.abs(bankTx.amount - ledgerEntry.amount) < 0.01 && // Same amount
        Math.abs(new Date(bankTx.transactionDate).getTime() - new Date(ledgerEntry.transactionDate).getTime()) < 7 * 24 * 60 * 60 * 1000 // Within 7 days
      );

      if (matchingBank) {
        matched.push({
          id: ledgerEntry.id,
          vendor: ledgerEntry.vendor,
          amount: ledgerEntry.amount,
          date: ledgerEntry.transactionDate,
          type: 'ledger',
          bankMatch: matchingBank
        });
      } else {
        ledgerOnly.push(ledgerEntry);
      }
    });

    // Find bank-only transactions
    bankData.forEach(bankTx => {
      const isMatched = matched.some(match => match.bankMatch?.id === bankTx.id);
      if (!isMatched) {
        bankOnly.push(bankTx);
      }
    });

    return { matched, ledgerOnly, bankOnly };
  };

  const { matched, ledgerOnly, bankOnly } = calculateComparison();
  
  const summary = {
    totalTransactions: ledgerData.length + bankData.length,
    matchedCount: matched.length,
    unmatchedCount: ledgerOnly.length + bankOnly.length,
    matchRate: ledgerData.length > 0 ? Math.round((matched.length / ledgerData.length) * 100) : 0,
    totalAmount: ledgerData.reduce((sum, entry) => sum + entry.amount, 0) + 
                 bankData.reduce((sum, tx) => sum + tx.amount, 0)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading comparison data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Comparison</h1>
          <p className="text-gray-600">Compare your receipts with bank statements</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{summary.totalTransactions}</div>
              <p className="text-xs text-gray-500">Combined total</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Matched</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{summary.matchedCount}</div>
              <p className="text-xs text-gray-500">Perfect matches</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Match Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{summary.matchRate}%</div>
              <p className="text-xs text-gray-500">Accuracy rate</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${summary.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-500">Combined value</p>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Tabs */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Transaction Comparison</CardTitle>
            <CardDescription>Detailed breakdown of matched and unmatched transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="matched">Matched ({matched.length})</TabsTrigger>
                <TabsTrigger value="unmatched">Unmatched ({ledgerOnly.length + bankOnly.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Matched Transactions */}
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        Matched Transactions
                      </CardTitle>
                      <CardDescription className="text-green-700">
                        Perfect matches between ledger and bank
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {matched.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{item.vendor}</p>
                              <p className="text-sm text-gray-500">{item.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">${item.amount}</p>
                              <Badge className="bg-green-100 text-green-800 text-xs">Matched</Badge>
                            </div>
                          </div>
                        ))}
                        {matched.length > 3 && (
                          <p className="text-sm text-green-600 text-center">
                            +{matched.length - 3} more matches
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ledger Only */}
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="h-5 w-5" />
                        Ledger Only
                      </CardTitle>
                      <CardDescription className="text-yellow-700">
                        Receipts without bank matches
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {ledgerOnly.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{item.vendor}</p>
                              <p className="text-sm text-gray-500">{item.transactionDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">${item.amount}</p>
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">Ledger Only</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bank Only */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <TrendingDown className="h-5 w-5" />
                        Bank Only
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        Bank transactions without receipts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {bankOnly.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{item.description}</p>
                              <p className="text-sm text-gray-500">{item.transactionDate}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${item.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.type === 'CREDIT' ? '+' : '-'}${item.amount}
                              </p>
                              <Badge className="bg-blue-100 text-blue-800 text-xs">Bank Only</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="matched">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matched.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.vendor}</TableCell>
                        <TableCell>${item.amount}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Matched
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="unmatched">
                <div className="space-y-6">
                  {/* Ledger Only Table */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ledger Only Transactions</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerOnly.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.vendor}</TableCell>
                            <TableCell>${item.amount}</TableCell>
                            <TableCell>{item.transactionDate}</TableCell>
                            <TableCell>{item.description || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Ledger Only
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Bank Only Table */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Only Transactions</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bankOnly.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell className={item.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                              {item.type === 'CREDIT' ? '+' : '-'}${item.amount}
                            </TableCell>
                            <TableCell>{item.transactionDate}</TableCell>
                            <TableCell>
                              <Badge variant={item.type === 'CREDIT' ? 'default' : 'secondary'}>
                                {item.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Bank Only
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 