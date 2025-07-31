'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Trash2, Receipt } from 'lucide-react';
import { useState } from 'react';

export default function LedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const mockLedgerData = [
    { id: '1', vendor: 'Starbucks Coffee', amount: 12.50, category: 'Food & Beverage', transactionDate: '2024-01-15', description: 'Venti Caramel Macchiato', status: 'matched' },
    { id: '2', vendor: 'Amazon.com', amount: 89.99, category: 'Shopping', transactionDate: '2024-01-16', description: 'Wireless headphones', status: 'matched' },
    { id: '3', vendor: 'Shell Gas Station', amount: 45.67, category: 'Transportation', transactionDate: '2024-01-17', description: 'Gas fill-up', status: 'unmatched' },
    { id: '4', vendor: 'Walmart', amount: 156.78, category: 'Groceries', transactionDate: '2024-01-18', description: 'Weekly shopping', status: 'matched' },
    { id: '5', vendor: 'Netflix', amount: 15.99, category: 'Entertainment', transactionDate: '2024-01-19', description: 'Monthly subscription', status: 'matched' },
    { id: '6', vendor: 'Home Depot', amount: 234.56, category: 'Home', transactionDate: '2024-01-20', description: 'Garden supplies', status: 'unmatched' },
  ];

  const categories = ['all', 'Food & Beverage', 'Shopping', 'Transportation', 'Groceries', 'Entertainment', 'Home'];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Food & Beverage': '🍔',
      'Transportation': '🚗',
      'Shopping': '🛒',
      'Groceries': '🥬',
      'Entertainment': '🎬',
      'Home': '🏠'
    };
    return icons[category] || '📄';
  };

  const getStatusColor = (status: string) => {
    return status === 'matched' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const filteredData = mockLedgerData.filter(item => {
    const matchesSearch = item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const matchedCount = filteredData.filter(item => item.status === 'matched').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ledger</h1>
          <p className="text-gray-600">View and manage all your processed receipts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Entries</CardTitle>
              <Receipt className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{filteredData.length}</div>
              <p className="text-xs text-gray-500">Receipts processed</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
              <span className="text-green-600">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-gray-500">Total spent</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Matched</CardTitle>
              <span className="text-green-600">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{matchedCount}</div>
              <p className="text-xs text-gray-500">With bank statements</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unmatched</CardTitle>
              <span className="text-yellow-600">⚠️</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{filteredData.length - matchedCount}</div>
              <p className="text-xs text-gray-500">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search receipts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ledger Table */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Receipt Entries</CardTitle>
            <CardDescription>All processed receipts and their details</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.vendor}</TableCell>
                    <TableCell>${entry.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getCategoryIcon(entry.category)}</span>
                        {entry.category}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(entry.transactionDate).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(entry.status)}>
                        {entry.status === 'matched' ? 'Matched' : 'Unmatched'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 