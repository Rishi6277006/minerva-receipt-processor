'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Coffee,
  Car,
  Home,
  Music,
  Utensils,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  RefreshCw,
  Settings,
  FileText,
  CreditCard
} from 'lucide-react';

// Mock data for demonstration
const mockLedgerData = [
  { id: '1', vendor: 'Starbucks Coffee', amount: 12.50, category: 'Food & Beverage', transactionDate: '2024-01-15', description: 'Venti Caramel Macchiato', currency: 'USD', status: 'verified' },
  { id: '2', vendor: 'Amazon.com', amount: 89.99, category: 'Shopping', transactionDate: '2024-01-16', description: 'Wireless headphones', currency: 'USD', status: 'verified' },
  { id: '3', vendor: 'Shell Gas Station', amount: 45.67, category: 'Transportation', transactionDate: '2024-01-17', description: 'Gas fill-up', currency: 'USD', status: 'pending' },
  { id: '4', vendor: 'Walmart', amount: 156.78, category: 'Groceries', transactionDate: '2024-01-18', description: 'Weekly shopping', currency: 'USD', status: 'verified' },
  { id: '5', vendor: 'Netflix', amount: 15.99, category: 'Entertainment', transactionDate: '2024-01-19', description: 'Monthly subscription', currency: 'USD', status: 'verified' },
  { id: '6', vendor: 'Home Depot', amount: 234.56, category: 'Home', transactionDate: '2024-01-20', description: 'Garden supplies', currency: 'USD', status: 'verified' },
  { id: '7', vendor: 'Uber', amount: 23.45, category: 'Transportation', transactionDate: '2024-01-21', description: 'Ride to airport', currency: 'USD', status: 'verified' },
  { id: '8', vendor: 'Spotify', amount: 9.99, category: 'Entertainment', transactionDate: '2024-01-22', description: 'Premium subscription', currency: 'USD', status: 'verified' },
  { id: '9', vendor: 'Target', amount: 67.89, category: 'Shopping', transactionDate: '2024-01-23', description: 'Household items', currency: 'USD', status: 'pending' },
  { id: '10', vendor: 'Chipotle', amount: 18.75, category: 'Food & Beverage', transactionDate: '2024-01-24', description: 'Lunch', currency: 'USD', status: 'verified' },
];

export default function LedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const categories = ['All', 'Food & Beverage', 'Shopping', 'Transportation', 'Groceries', 'Entertainment', 'Home'];
  const statuses = ['All', 'verified', 'pending', 'disputed'];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Food & Beverage': Coffee,
      'Transportation': Car,
      'Shopping': ShoppingCart,
      'Groceries': Utensils,
      'Entertainment': Music,
      'Home': Home
    };
    return icons[category] || Receipt;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Beverage': 'bg-orange-500',
      'Transportation': 'bg-blue-500',
      'Shopping': 'bg-purple-500',
      'Groceries': 'bg-green-500',
      'Entertainment': 'bg-pink-500',
      'Home': 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'verified': 'bg-green-500',
      'pending': 'bg-yellow-500',
      'disputed': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const filteredData = mockLedgerData
    .filter(entry => {
      const matchesSearch = entry.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || entry.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'vendor':
          comparison = a.vendor.localeCompare(b.vendor);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalAmount = filteredData.reduce((sum, entry) => sum + entry.amount, 0);
  const categoryBreakdown = filteredData.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map(item => item.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      alert(`Deleted ${selectedItems.length} items!`);
      setSelectedItems([]);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export
    setTimeout(() => {
      setIsExporting(false);
      alert('Ledger exported successfully! 📊');
    }, 2000);
  };

  const handleAddEntry = () => {
    alert('Add new entry form would open here! 📝');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Ledger Management</h1>
            <p className="text-slate-600">Track and manage your expense entries</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              variant="outline" 
              size="sm"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button onClick={handleAddEntry} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Entries</CardTitle>
              <Receipt className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{filteredData.length}</div>
              <p className="text-xs text-slate-500">From {mockLedgerData.length} total entries</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-slate-500">Filtered total</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{Object.keys(categoryBreakdown).length}</div>
              <p className="text-xs text-slate-500">Active categories</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {filteredData.filter(entry => entry.status === 'verified').length}
              </div>
              <p className="text-xs text-slate-500">Verified entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-500" />
              Filters and Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="vendor-asc">Vendor (A-Z)</option>
                <option value="category-asc">Category (A-Z)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Category Breakdown
            </CardTitle>
            <CardDescription>Spending distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryBreakdown).map(([category, amount]) => {
                const IconComponent = getCategoryIcon(category);
                const percentage = ((amount / totalAmount) * 100).toFixed(1);
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{category}</p>
                        <p className="text-sm text-slate-500">{percentage}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">${amount.toFixed(2)}</p>
                      <div className="w-20 bg-slate-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${getCategoryColor(category).replace('bg-', 'bg-')}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <Card className="bg-blue-50 border-blue-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-slate-800">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ledger Entries */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              Ledger Entries
            </CardTitle>
            <CardDescription>
              {filteredData.length} entries found
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {selectedStatus !== 'All' && ` with status ${selectedStatus}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredData.length > 0 ? (
              <div className="space-y-4">
                {/* Select All Header */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredData.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-600">Select All</span>
                </div>

                {filteredData.map((entry) => {
                  const IconComponent = getCategoryIcon(entry.category);
                  const isSelected = selectedItems.includes(entry.id);
                  
                  return (
                    <div 
                      key={entry.id} 
                      className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-md ${
                        isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(entry.id)}
                          className="rounded border-slate-300"
                        />
                        <div className={`p-3 rounded-lg ${getCategoryColor(entry.category)}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-slate-800">{entry.vendor}</h3>
                            <Badge variant="outline" className="text-xs">
                              {entry.category}
                            </Badge>
                            <Badge 
                              className={`text-xs text-white ${getStatusColor(entry.status)}`}
                            >
                              {entry.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{entry.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(entry.transactionDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {entry.currency}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-800">${entry.amount.toFixed(2)}</p>
                          {entry.status === 'verified' && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">No entries found</h3>
                <p className="text-slate-500">
                  {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start by adding your first receipt entry'
                  }
                </p>
                {!searchTerm && selectedCategory === 'All' && selectedStatus === 'All' && (
                  <Button onClick={handleAddEntry} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Entry
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 