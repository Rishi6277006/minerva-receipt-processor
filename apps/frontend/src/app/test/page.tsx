'use client';

import { trpc } from '@/utils/trpc';

export default function TestPage() {
  const { data, isLoading, error } = trpc.ledger.getAll.useQuery();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">tRPC Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Error:</strong> {error ? error.message : 'None'}
        </div>
        
        <div>
          <strong>Data:</strong> {data ? JSON.stringify(data, null, 2) : 'No data'}
        </div>
        
        <div>
          <strong>Data Length:</strong> {data ? data.length : 0}
        </div>
      </div>
    </div>
  );
} 