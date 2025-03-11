import { CONFIG } from 'src/global-config';

import { VideoListView } from 'src/sections/dashboard/textbook/video';

// ----------------------------------------------------------------------

export const metadata = { title: `视频管理 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <VideoListView />;
}
