import { CONFIG } from 'src/global-config';

import { SupabaseSignUpView } from 'src/auth/view/supabase';

// ----------------------------------------------------------------------

export const metadata = { title: `Sign up | Supabase - ${CONFIG.appName}` };

export default function Page() {
  return <SupabaseSignUpView />;
}
