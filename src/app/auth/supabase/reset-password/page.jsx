import { CONFIG } from 'src/global-config';

import { SupabaseResetPasswordView } from 'src/auth/view/supabase';

// ----------------------------------------------------------------------

export const metadata = { title: `Reset password | Supabase - ${CONFIG.appName}` };

export default function Page() {
  return <SupabaseResetPasswordView />;
}
