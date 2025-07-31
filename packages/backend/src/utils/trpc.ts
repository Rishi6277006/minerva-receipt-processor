import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../packages/backend/src/router';

export const trpc = createTRPCReact<AppRouter>(); 