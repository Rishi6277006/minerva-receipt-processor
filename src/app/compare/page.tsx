'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, DollarSign, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

export default function ComparePage() {
  // Mock data
  const mockData = {
    summary: {
      totalTransactions: 24,
      matchedCount: 18,
      unmatchedCount: 6,
      matchRate: 75,
      totalAmount: 2847.50
    },
    matched: [
      { id: '1', vendor: 'Starbucks Coffee', amount: 12.50, date: '2024-01-15', type: 'ledger' },
      { id: '2', vendor: 'Amazon.com', amount: 89.99, date: '2024-01-16', type: 'ledger' },
      { id: '3', vendor: 'Walmart', amount: 156.78, date: '2024-01-18', type: 'ledger' },
      { id: '4', vendor: 'Netflix', amount: 15.99, date: '2024-01-19', type: 'ledger' },
    ],
    ledgerOnly: [
      { id: '5', vendor: 'Shell Gas Station', amount: 45.67, date: '2024-01-17', description: 'Gas fill-up' },
      { id: '6', vendor: 'Home Depot', amount: 234.56, date: '2024-01-20', description: 'Garden supplies' },
    ],
    bankOnly: [
      { id: '7', vendor: 'SALARY DEPOSIT', amount: 2500.00, date: '2024-01-25', type: 'CREDIT' },
      { id: '8', vendor: 'SPOTIFY USA', amount: 9.99, date: '2024-01-22', type: 'DEBIT' },
      { id: '9', vendor: 'UBER *TRIP', amount: 23.45, date: '2024-01-21', type: 'DEBIT' },
    ]
  };

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
              <div className="text-2xl font-bold text-gray-900">{mockData.summary.totalTransactions}</div>
              <p className="text-xs text-gray-500">Combined total</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Matched</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockData.summary.matchedCount}</div>
              <p className="text-xs text-gray-500">Perfect matches</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Match Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockData.summary.matchRate}%</div>
              <p className="text-xs text-gray-500">Accuracy rate</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${mockData.summary.totalAmount.toLocaleString()}</div>
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
                <TabsTrigger value="matched">Matched ({mockData.matched.length})</TabsTrigger>
                <TabsTrigger value="unmatched">Unmatched ({mockData.ledgerOnly.length + mockData.bankOnly.length})</TabsTrigger>
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
                        {mockData.matched.slice(0, 3).map((item) => (
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
                        {mockData.matched.length > 3 && (
                          <p className="text-sm text-green-600 text-center">
                            +{mockData.matched.length - 3} more matches
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
                        {mockData.ledgerOnly.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{item.vendor}</p>
                              <p className="text-sm text-gray-500">{item.date}</p>
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
                        {mockData.bankOnly.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{item.vendor}</p>
                              <p className="text-sm text-gray-500">{item.date}</p>
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
                    {mockData.matched.map((item) => (
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
                        {mockData.ledgerOnly.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.vendor}</TableCell>
                            <TableCell>${item.amount}</TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.description}</TableCell>
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
                        {mockData.bankOnly.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.vendor}</TableCell>
                            <TableCell className={item.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                              {item.type === 'CREDIT' ? '+' : '-'}${item.amount}
                            </TableCell>
                            <TableCell>{item.date}</TableCell>
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