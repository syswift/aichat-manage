import { CONFIG } from 'src/global-config';

import { VideoEditView } from 'src/sections/dashboard/textbook/video/video-edit-view';

export const metadata = { title: `编辑视频 | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;

  return <VideoEditView id={id} />;
} 