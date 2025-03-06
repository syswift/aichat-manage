import { CONFIG } from 'src/global-config';

import { AudioCreateView } from 'src/sections/dashboard/textbook/audio/audio-create-view';

// ----------------------------------------------------------------------

export const metadata = { title: `新建音频 - ${CONFIG.appName}` };

export default function Page() {
  return <AudioCreateView />;
}
