import { CONFIG } from 'src/global-config';
import { PicbookEditView } from 'src/sections/dashboard/textbook/picbook/picbook-edit-view';

export const metadata = { title: `编辑绘本 | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  return <PicbookEditView id={id} />;
} 