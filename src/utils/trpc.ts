import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';

// Define a basic type for now - this will be properly typed when we fix the backend
export type AppRouter = any;
 
export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();

// Mock tRPC client for deployment
export const trpcClient = {
  ledger: {
    getAll: {
      useQuery: () => ({
        data: [],
        isLoading: false,
        error: null
      })
    }
  },
  bank: {
    getTransactions: {
      useQuery: () => ({
        data: [],
        isLoading: false,
        error: null
      })
    },
    uploadStatement: {
      useMutation: () => ({
        mutate: () => {},
        isLoading: false,
        error: null
      })
    }
  },
  receipt: {
    uploadImage: {
      useMutation: () => ({
        mutate: () => {},
        isLoading: false,
        error: null
      })
    }
  }
} as any; 