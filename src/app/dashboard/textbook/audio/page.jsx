import { CONFIG } from 'src/global-config';

import { AudioListView } from 'src/sections/dashboard/textbook/audio';

// ----------------------------------------------------------------------

export const metadata = { title: `Page audio | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <AudioListView />;
}
