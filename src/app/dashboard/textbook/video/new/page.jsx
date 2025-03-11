import { CONFIG } from 'src/global-config';

import { VideoCreateView } from 'src/sections/dashboard/textbook/video/video-create-view';

export const metadata = { title: `新建视频 - ${CONFIG.appName}` };

export default function Page() {
  return <VideoCreateView />;
} 