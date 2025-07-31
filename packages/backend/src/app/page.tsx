'use client';

import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { Receipt, Upload, BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: ledgerEntries } = trpc.ledger.getAll.useQuery();
  const { data: bankTransactions } = trpc.bank.getTransactions.useQuery();
  const { data: comparisonResults } = trpc.comparison.compare.useQuery();

  const totalLedgerAmount = ledgerEntries?.reduce((sum, entry) => sum + entry.amount.toNumber(), 0) || 0;
  const totalBankAmount = bankTransactions?.reduce((sum, tx) => sum + tx.amount.toNumber(), 0) || 0;
  const matchedCount = comparisonResults?.matched.length || 0;
  const unmatchedLedger = comparisonResults?.ledgerOnly.length || 0;
  const unmatchedBank = comparisonResults?.bankOnly.length || 0;

  const stats = [
    {
      title: 'Total Ledger Entries',
      value: ledgerEntries?.length || 0,
      description: `$${totalLedgerAmount.toFixed(2)} total`,
      icon: Receipt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Bank Transactions',
      value: bankTransactions?.length || 0,
      description: `$${totalBankAmount.toFixed(2)} total`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Matched Transactions',
      value: matchedCount,
      description: 'Perfect matches found',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Unmatched Items',
      value: unmatchedLedger + unmatchedBank,
      description: 'Requires attention',
      icon: Upload,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome to your receipt processing and bank statement comparison system.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to get you started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/upload">
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Bank Statement
                  </Button>
                </Link>
                <Link href="/ledger">
                  <Button className="w-full justify-start" variant="outline">
                    <Receipt className="mr-2 h-4 w-4" />
                    View Ledger Entries
                  </Button>
                </Link>
                <Link href="/compare">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Compare Transactions
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest ledger entries and transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ledgerEntries && ledgerEntries.length > 0 ? (
                  <div className="space-y-3">
                    {ledgerEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{entry.vendor}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(entry.transactionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ${entry.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No ledger entries yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 