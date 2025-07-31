'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Upload, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // Mock data for demonstration
  const mockData = {
    totalSpent: 2847.50,
    totalReceipts: 156,
    matchRate: 87.5,
    recentTransactions: [
      { vendor: 'Starbucks', amount: 12.50, date: '2024-01-15' },
      { vendor: 'Amazon', amount: 89.99, date: '2024-01-16' },
      { vendor: 'Shell Gas', amount: 45.67, date: '2024-01-17' },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Minerva Dashboard</h1>
          <p className="text-gray-600">AI-powered receipt processing and bank statement comparison</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${mockData.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Receipts Processed</CardTitle>
              <Receipt className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockData.totalReceipts}</div>
              <p className="text-xs text-gray-500">Total receipts</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Match Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockData.matchRate}%</div>
              <p className="text-xs text-gray-500">Bank statement matches</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Upload Status</CardTitle>
              <Upload className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">Ready</div>
              <p className="text-xs text-gray-500">System online</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/upload">
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Receipts
                </CardTitle>
                <CardDescription>Upload images or CSV files for processing</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/ledger">
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-green-600" />
                  View Ledger
                </CardTitle>
                <CardDescription>Browse all processed receipts and transactions</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/compare">
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Compare Data
                </CardTitle>
                <CardDescription>Match receipts with bank statements</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest processed receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.vendor}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${transaction.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
