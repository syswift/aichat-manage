import { CONFIG } from 'src/global-config';
import { PicbookListView } from 'src/sections/dashboard/textbook/picbook';

// ----------------------------------------------------------------------

export const metadata = { title: `绘本管理 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PicbookListView />;
}
