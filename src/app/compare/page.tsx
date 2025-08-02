'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  CreditCard
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface LedgerEntry {
  id: string;
  vendor: string;
  amount: number;
  transactionDate: string;
  category: string;
  description: string;
}

interface BankTransaction {
  id: string;
  description: string;
  amount: number;
  transactionDate: string;
  type: string;
}

interface ComparisonData {
  matched: Array<{
    ledger: LedgerEntry;
    bank: BankTransaction;
    confidence: number;
  }>;
  ledgerOnly: LedgerEntry[];
  bankOnly: BankTransaction[];
}

export default function ComparePage() {
  const [comparisonData, setComparisonData] = useState<ComparisonData>({
    matched: [],
    ledgerOnly: [],
    bankOnly: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/compare');
        const result = await response.json();
        
        if (result.result?.data) {
          setComparisonData(result.result.data);
        } else {
          setComparisonData(result);
        }
      } catch (err) {
        console.error('Error fetching comparison data:', err);
        setError('Failed to load comparison data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparisonData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalMatched = comparisonData.matched.length;
  const totalLedgerOnly = comparisonData.ledgerOnly.length;
  const totalBankOnly = comparisonData.bankOnly.length;
  const totalTransactions = totalMatched + totalLedgerOnly + totalBankOnly;
  const matchRate = totalTransactions > 0 ? Math.round((totalMatched / totalTransactions) * 100) : 0;

  const totalMatchedAmount = comparisonData.matched.reduce((sum, item) => sum + item.ledger.amount, 0);
  const totalLedgerAmount = comparisonData.ledgerOnly.reduce((sum, item) => sum + item.amount, 0);
  const totalBankAmount = comparisonData.bankOnly.reduce((sum, item) => sum + item.amount, 0);

  // Chart data preparation
  const pieChartData = [
    { name: 'Matched', value: totalMatched, color: '#10b981', amount: totalMatchedAmount },
    { name: 'Receipts Only', value: totalLedgerOnly, color: '#f59e0b', amount: totalLedgerAmount },
    { name: 'Bank Only', value: totalBankOnly, color: '#3b82f6', amount: totalBankAmount }
  ];

  const categoryData = comparisonData.ledgerOnly.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    category,
    count,
    amount: comparisonData.ledgerOnly
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0)
  }));

  const monthlyData = comparisonData.matched.reduce((acc, item) => {
    const month = new Date(item.ledger.transactionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyData)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([month, count]) => ({ month, count }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Comparison</h1>
        <p className="text-gray-600">Compare your receipts with bank transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Matched</p>
                <p className="text-2xl font-bold text-green-700">{totalMatched}</p>
                <p className="text-xs text-green-600">${totalMatchedAmount.toFixed(2)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Receipts Only</p>
                <p className="text-2xl font-bold text-yellow-700">{totalLedgerOnly}</p>
                <p className="text-xs text-yellow-600">${totalLedgerAmount.toFixed(2)}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Bank Only</p>
                <p className="text-2xl font-bold text-blue-700">{totalBankOnly}</p>
                <p className="text-xs text-blue-600">${totalBankAmount.toFixed(2)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Match Rate</p>
                <p className="text-2xl font-bold text-purple-700">{matchRate}%</p>
                <p className="text-xs text-purple-600">{totalTransactions} total</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Transaction Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [
                    `${name}: ${value} transactions ($${pieChartData.find(d => d.name === name)?.amount?.toFixed(2) || '0.00'})`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Receipt Categories (Unmatched)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'count' ? `${value} receipts` : `$${typeof value === 'number' ? value.toFixed(2) : '0.00'}`,
                    name === 'count' ? 'Count' : 'Amount'
                  ]}
                />
                <Bar dataKey="count" fill="#f59e0b" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      {monthlyChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Matched Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} matches`, 'Matched Transactions']} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Main Comparison Tabs */}
      <Tabs defaultValue="matched" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matched" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Matched ({totalMatched})
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Receipts Only ({totalLedgerOnly})
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Bank Only ({totalBankOnly})
          </TabsTrigger>
        </TabsList>

        {/* Matched Transactions */}
        <TabsContent value="matched" className="space-y-4">
          {comparisonData.matched.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No matched transactions found</p>
                <p className="text-sm text-gray-400">Upload more receipts and bank statements to see matches</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {comparisonData.matched.map((item) => (
                <Card key={item.ledger.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{item.ledger.vendor}</h3>
                          <p className="text-sm text-gray-600">{item.ledger.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {item.confidence}% Match
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Receipt Details */}
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm text-gray-700">Receipt</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Amount:</span>
                            <span className="font-medium">${item.ledger.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Date:</span>
                            <span className="text-sm">{new Date(item.ledger.transactionDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Category:</span>
                            <Badge variant="outline" className="text-xs">{item.ledger.category}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Bank Details */}
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm text-gray-700">Bank Transaction</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Amount:</span>
                            <span className="font-medium">${item.bank.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Date:</span>
                            <span className="text-sm">{new Date(item.bank.transactionDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Type:</span>
                            <Badge variant="outline" className="text-xs">{item.bank.type}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Receipts Only */}
        <TabsContent value="receipts" className="space-y-4">
          {comparisonData.ledgerOnly.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No unmatched receipts found</p>
                <p className="text-sm text-gray-400">All your receipts have matching bank transactions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {comparisonData.ledgerOnly.map((item) => (
                <Card key={item.id} className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.vendor}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(item.transactionDate).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">${item.amount.toFixed(2)}</p>
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">No Bank Match</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Bank Only */}
        <TabsContent value="bank" className="space-y-4">
          {comparisonData.bankOnly.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No unmatched bank transactions found</p>
                <p className="text-sm text-gray-400">All your bank transactions have matching receipts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {comparisonData.bankOnly.map((item) => (
                <Card key={item.id} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.description}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(item.transactionDate).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs">{item.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">${item.amount.toFixed(2)}</p>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">No Receipt Match</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 