'use client';

import { Navigation } from '@/components/navigation';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { BarChart3, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function ComparePage() {
  const { data: comparisonResults, isLoading, error } = trpc.comparison.compare.useQuery();

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

  const { matched = [], ledgerOnly = [], bankOnly = [] } = comparisonResults || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Transaction Comparison</h1>
            <p className="mt-2 text-gray-600">
              Compare your ledger entries with bank statement transactions
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Matched Transactions
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{matched.length}</div>
                <p className="text-xs text-gray-500 mt-1">Perfect matches found</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Ledger Only
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{ledgerOnly.length}</div>
                <p className="text-xs text-gray-500 mt-1">Not in bank statement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Bank Only
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{bankOnly.length}</div>
                <p className="text-xs text-gray-500 mt-1">Not in ledger</p>
              </CardContent>
            </Card>
          </div>

          {/* Matched Transactions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                Matched Transactions
              </CardTitle>
              <CardDescription>
                Transactions found in both ledger and bank statement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Transactions found in both ledger and bank statement.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ledger Vendor</TableHead>
                    <TableHead>Ledger Amount</TableHead>
                    <TableHead>Ledger Date</TableHead>
                    <TableHead>Bank Description</TableHead>
                    <TableHead>Bank Amount</TableHead>
                    <TableHead>Bank Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matched.length > 0 ? (
                    matched.map((match, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{match.ledger.vendor}</TableCell>
                        <TableCell className="font-mono">${match.ledger.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(match.ledger.transactionDate).toLocaleDateString()}</TableCell>
                        <TableCell>{match.bank.description}</TableCell>
                        <TableCell className="font-mono">${match.bank.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(match.bank.transactionDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Matched
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No matched transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Ledger Only Transactions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
                Transactions Only in Ledger
              </CardTitle>
              <CardDescription>
                Transactions present in the ledger but not found in the bank statement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Transactions present in the ledger but not found in the bank statement.</TableCaption>
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
                  {ledgerOnly.length > 0 ? (
                    ledgerOnly.map((entry) => (
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
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Ledger Only
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No ledger-only transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Bank Only Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="mr-2 h-5 w-5 text-red-600" />
                Transactions Only in Bank Statement
              </CardTitle>
              <CardDescription>
                Transactions present in the bank statement but not found in the ledger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Transactions present in the bank statement but not found in the ledger.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source File</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankOnly.length > 0 ? (
                    bankOnly.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell className="font-mono">${entry.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(entry.transactionDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {entry.type ? (
                            <Badge variant="secondary">{entry.type}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {entry.sourceFile || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Bank Only
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No bank-only transactions found.
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