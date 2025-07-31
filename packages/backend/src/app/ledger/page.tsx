'use client';

import { Navigation } from '@/components/navigation';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { Receipt, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LedgerPage() {
  const { data: ledgerEntries, isLoading, error } = trpc.ledger.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-600">Error: {error.message}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = ledgerEntries?.reduce((sum, entry) => sum + entry.amount.toNumber(), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ledger Entries</h1>
                <p className="mt-2 text-gray-600">
                  All processed receipts and transactions
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Link href="/upload">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Entry
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                Summary
              </CardTitle>
              <CardDescription>
                Overview of your ledger entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{ledgerEntries?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${ledgerEntries && ledgerEntries.length > 0 ? (totalAmount / ledgerEntries.length).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Entries</CardTitle>
              <CardDescription>
                Detailed view of all ledger entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of your ledger entries.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries && ledgerEntries.length > 0 ? (
                    ledgerEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.vendor}</TableCell>
                        <TableCell className="font-mono">${entry.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(entry.transactionDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {entry.category ? (
                            <Badge variant="secondary">{entry.category}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {entry.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Processed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No ledger entries found. Start by uploading a receipt or adding an entry.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 