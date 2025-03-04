import { CONFIG } from 'src/global-config';

import { UserProfile } from 'src/sections/dashboard/user-profile';

// ----------------------------------------------------------------------

export const metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
      <UserProfile />
  );
}
