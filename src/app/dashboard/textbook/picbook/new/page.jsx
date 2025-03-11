import { CONFIG } from 'src/global-config';
import { PicbookCreateView } from 'src/sections/dashboard/textbook/picbook/picbook-create-view';

export const metadata = { title: `新建绘本 - ${CONFIG.appName}` };

export default function Page() {
  return <PicbookCreateView />;
} 