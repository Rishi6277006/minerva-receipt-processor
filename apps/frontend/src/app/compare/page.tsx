'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Receipt,
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  ArrowLeft,
  Clock,
  FileText,
  Download,
  Search,
  Plus,
  Target,
  Zap
} from 'lucide-react';

// Mock comparison data
const mockComparisonData = {
  matched: [
    {
      ledger: {
        id: '1',
        vendor: 'Starbucks Coffee',
        amount: 12.50,
        transactionDate: '2024-01-15',
        category: 'Food & Beverage',
        description: 'Venti Caramel Macchiato and blueberry muffin'
      },
      bank: {
        id: '1',
        description: 'STARBUCKS COFFEE',
        amount: 12.50,
        transactionDate: '2024-01-15',
        type: 'DEBIT'
      }
    },
    {
      ledger: {
        id: '2',
        vendor: 'Amazon.com',
        amount: 89.99,
        transactionDate: '2024-01-16',
        category: 'Shopping',
        description: 'Wireless headphones and phone case'
      },
      bank: {
        id: '2',
        description: 'AMAZON.COM',
        amount: 89.99,
        transactionDate: '2024-01-16',
        type: 'DEBIT'
      }
    },
    {
      ledger: {
        id: '3',
        vendor: 'Shell Gas Station',
        amount: 45.67,
        transactionDate: '2024-01-17',
        category: 'Transportation',
        description: 'Gas fill-up and car wash'
      },
      bank: {
        id: '3',
        description: 'SHELL GAS STATION',
        amount: 45.67,
        transactionDate: '2024-01-17',
        type: 'DEBIT'
      }
    },
    {
      ledger: {
        id: '4',
        vendor: 'Walmart',
        amount: 156.78,
        transactionDate: '2024-01-18',
        category: 'Groceries',
        description: 'Weekly grocery shopping - produce, dairy, household items'
      },
      bank: {
        id: '4',
        description: 'WALMART SUPERCENTER',
        amount: 156.78,
        transactionDate: '2024-01-18',
        type: 'DEBIT'
      }
    }
  ],
  ledgerOnly: [],
  bankOnly: [
    {
      id: '5',
      description: 'SPOTIFY USA',
      amount: 9.99,
      transactionDate: '2024-01-23',
      type: 'DEBIT'
    },
    {
      id: '6',
      description: 'DOORDASH',
      amount: 34.56,
      transactionDate: '2024-01-24',
      type: 'DEBIT'
    },
    {
      id: '7',
      description: 'SALARY DEPOSIT',
      amount: 2500.00,
      transactionDate: '2024-01-25',
      type: 'CREDIT'
    },
    {
      id: '8',
      description: 'APPLE.COM/BILL',
      amount: 2.99,
      transactionDate: '2024-01-26',
      type: 'DEBIT'
    }
  ]
};

export default function ComparePage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);

  const totalMatched = mockComparisonData.matched.length;
  const totalLedgerOnly = mockComparisonData.ledgerOnly.length;
  const totalBankOnly = mockComparisonData.bankOnly.length;
  const totalTransactions = totalMatched + totalLedgerOnly + totalBankOnly;
  const matchRate = totalTransactions > 0 ? ((totalMatched / totalTransactions) * 100).toFixed(1) : '0';

  const totalMatchedAmount = mockComparisonData.matched.reduce((sum, match) => sum + match.ledger.amount, 0);
  const totalBankOnlyAmount = mockComparisonData.bankOnly.reduce((sum, tx) => sum + tx.amount, 0);

  // Quick Actions Handlers
  const handleReviewMatched = () => {
    setSelectedTab('matched');
  };

  const handleInvestigateBankOnly = () => {
    setSelectedTab('unmatched');
  };

  const handleExportReport = () => {
    setShowExportModal(true);
    // Simulate export
    setTimeout(() => {
      setShowExportModal(false);
      alert('Comparison report exported successfully! 📊');
    }, 2000);
  };

  const handleScheduleReconciliation = () => {
    setShowReconciliationModal(true);
    // Simulate scheduling
    setTimeout(() => {
      setShowReconciliationModal(false);
      alert('Reconciliation scheduled for next week! 📅');
    }, 2000);
  };

  const handleAddToLedger = (transaction: any) => {
    alert(`Adding "${transaction.description}" to ledger... 📝`);
  };

  const handleFindInBank = (entry: any) => {
    alert(`Searching for "${entry.vendor}" in bank transactions... 🔍`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Transaction Comparison</h1>
          <p className="text-slate-600">Compare your ledger entries with bank transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Match Rate</CardTitle>
              <Target className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{matchRate}%</div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${matchRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">{totalMatched} of {totalTransactions} matched</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Perfect Matches</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{totalMatched}</div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(totalMatched / totalTransactions) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">${totalMatchedAmount.toFixed(2)} total</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Bank Only</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{totalBankOnly}</div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${(totalBankOnly / totalTransactions) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">${totalBankOnlyAmount.toFixed(2)} total</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Ledger Only</CardTitle>
              <XCircle className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{totalLedgerOnly}</div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${(totalLedgerOnly / totalTransactions) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Missing from bank</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="matched" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Matched ({totalMatched})
            </TabsTrigger>
            <TabsTrigger value="unmatched" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <AlertCircle className="h-4 w-4 mr-2" />
              Unmatched ({totalBankOnly + totalLedgerOnly})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Match Rate Visualization */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    Match Rate Breakdown
                  </CardTitle>
                  <CardDescription>Visual representation of transaction matching</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-slate-800">Perfect Matches</p>
                          <p className="text-sm text-slate-500">{totalMatched} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{totalMatched}</p>
                        <p className="text-xs text-slate-500">${totalMatchedAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-slate-800">Bank Only</p>
                          <p className="text-sm text-slate-500">{totalBankOnly} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">{totalBankOnly}</p>
                        <p className="text-xs text-slate-500">${totalBankOnlyAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    {totalLedgerOnly > 0 && (
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <XCircle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium text-slate-800">Ledger Only</p>
                            <p className="text-sm text-slate-500">{totalLedgerOnly} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{totalLedgerOnly}</p>
                          <p className="text-xs text-slate-500">Missing from bank</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common tasks for managing discrepancies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleReviewMatched}
                    className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Review Matched Transactions
                  </Button>
                  <Button 
                    onClick={handleInvestigateBankOnly}
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Investigate Bank-Only Transactions
                  </Button>
                  <Button 
                    onClick={handleExportReport}
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Comparison Report
                  </Button>
                  <Button 
                    onClick={handleScheduleReconciliation}
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule Reconciliation
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Match Rate Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  Match Rate Visualization
                </CardTitle>
                <CardDescription>Interactive chart showing transaction matching performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8">
                  <div className="relative w-48 h-48">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-200"
                      />
                      {/* Matched transactions */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - totalMatched / totalTransactions)}`}
                        className="text-green-500 transition-all duration-1000 ease-out"
                      />
                      {/* Bank only transactions */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - totalBankOnly / totalTransactions)}`}
                        className="text-orange-500 transition-all duration-1000 ease-out"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 40}`,
                          strokeDashoffset: `${2 * Math.PI * 40 * (1 - totalBankOnly / totalTransactions)}`,
                          transform: `rotate(${(totalMatched / totalTransactions) * 360}deg)`
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-slate-800">{matchRate}%</span>
                      <span className="text-sm text-slate-500">Match Rate</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-slate-800">Matched</p>
                    <p className="text-xs text-slate-500">{totalMatched}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-slate-800">Bank Only</p>
                    <p className="text-xs text-slate-500">{totalBankOnly}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-slate-800">Ledger Only</p>
                    <p className="text-xs text-slate-500">{totalLedgerOnly}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matched" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Perfect Matches
                </CardTitle>
                <CardDescription>
                  Transactions that appear in both ledger and bank statement with matching amounts and dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockComparisonData.matched.map((match, index) => (
                    <div key={index} className="p-6 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <h3 className="font-semibold text-slate-800">Perfect Match #{index + 1}</h3>
                        </div>
                        <Badge className="bg-green-500 text-white">Matched</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Ledger Entry */}
                        <div className="p-4 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Receipt className="h-4 w-4 text-blue-500" />
                            <h4 className="font-medium text-slate-800">Ledger Entry</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Vendor:</span>
                              <span className="font-medium text-slate-800">{match.ledger.vendor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Amount:</span>
                              <span className="font-bold text-green-600">${match.ledger.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Date:</span>
                              <span className="text-slate-800">{new Date(match.ledger.transactionDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Category:</span>
                              <Badge variant="outline" className="text-xs">{match.ledger.category}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Bank Transaction */}
                        <div className="p-4 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="h-4 w-4 text-green-500" />
                            <h4 className="font-medium text-slate-800">Bank Transaction</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Description:</span>
                              <span className="font-medium text-slate-800">{match.bank.description}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Amount:</span>
                              <span className="font-bold text-green-600">${match.bank.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Date:</span>
                              <span className="text-slate-800">{new Date(match.bank.transactionDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Type:</span>
                              <Badge variant={match.bank.type === 'CREDIT' ? 'default' : 'secondary'} className="text-xs">
                                {match.bank.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unmatched" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Unmatched Transactions
                </CardTitle>
                <CardDescription>
                  Transactions that appear in only one source and need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Bank Only Transactions */}
                  {mockComparisonData.bankOnly.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-orange-500" />
                        Bank-Only Transactions ({mockComparisonData.bankOnly.length})
                      </h3>
                      <div className="space-y-4">
                        {mockComparisonData.bankOnly.map((transaction) => (
                          <div key={transaction.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${transaction.type === 'CREDIT' ? 'bg-green-500' : 'bg-red-500'}`}>
                                  {transaction.type === 'CREDIT' ? (
                                    <TrendingUp className="h-4 w-4 text-white" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-slate-800">{transaction.description}</h4>
                                  <p className="text-sm text-slate-500">{new Date(transaction.transactionDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-lg font-bold ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.type === 'CREDIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </p>
                                <Badge variant={transaction.type === 'CREDIT' ? 'default' : 'secondary'} className="text-xs">
                                  {transaction.type}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleAddToLedger(transaction)}
                              >
                                <ArrowRight className="h-3 w-3 mr-1" />
                                Add to Ledger
                              </Button>
                              <Button size="sm" variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ledger Only Transactions */}
                  {mockComparisonData.ledgerOnly.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-red-500" />
                        Ledger-Only Transactions ({mockComparisonData.ledgerOnly.length})
                      </h3>
                      <div className="space-y-4">
                        {mockComparisonData.ledgerOnly.map((entry: any) => (
                          <div key={entry.id} className="p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-500">
                                  <Receipt className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-slate-800">{entry.vendor}</h4>
                                  <p className="text-sm text-slate-500">{new Date(entry.transactionDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-red-600">${entry.amount.toFixed(2)}</p>
                                <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleFindInBank(entry)}
                              >
                                <ArrowLeft className="h-3 w-3 mr-1" />
                                Find in Bank
                              </Button>
                              <Button size="sm" variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mockComparisonData.bankOnly.length === 0 && mockComparisonData.ledgerOnly.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">All transactions matched!</h3>
                      <p className="text-slate-500">Your ledger and bank statement are perfectly aligned.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 