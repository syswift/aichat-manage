import { CONFIG } from 'src/global-config';

import { SupabaseVerifyView } from 'src/auth/view/supabase';

// ----------------------------------------------------------------------

export const metadata = { title: `Verify | Supabase - ${CONFIG.appName}` };

export default function Page() {
  return <SupabaseVerifyView />;
}
