import { createBrowserClient } from '@supabase/ssr';

// We use the 'ssr' package because it handles cookies and auth sessions 
// automatically for Next.js 14, even though we are mostly client-side here.
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
