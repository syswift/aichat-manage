'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PicbookNewEditForm } from './picbook-new-edit-form';

// ----------------------------------------------------------------------

export function PicbookCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="新增绘本"
        backHref={paths.dashboard.textbook.picbook.root}
        links={[
          { name: '首页', href: paths.dashboard.root },
          { name: '教材管理', href: paths.dashboard.textbook.root },
          { name: '绘本', href: paths.dashboard.textbook.picbook.root },
          { name: '新绘本' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PicbookNewEditForm />
    </DashboardContent>
  );
} 