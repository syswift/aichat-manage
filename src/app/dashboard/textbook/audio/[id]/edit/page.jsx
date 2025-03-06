import { CONFIG } from 'src/global-config';

import { AudioEditView } from 'src/sections/dashboard/textbook/audio/audio-edit-view';

// ----------------------------------------------------------------------

export const metadata = { title: `User edit | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;

  return <AudioEditView id={id} />;
}

// ----------------------------------------------------------------------