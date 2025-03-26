import { CONFIG } from 'src/global-config';

import { StatsDashboard } from 'src/sections/dashboard/stats-dashboard';

// ----------------------------------------------------------------------

export const metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
      <StatsDashboard />
  );
}
