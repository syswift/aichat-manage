'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { VideoNewEditForm } from './video-new-edit-form';

// ----------------------------------------------------------------------

export function VideoCreateView() {
  const { user } = useAuthContext();
  
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="新增视频"
        backHref={paths.dashboard.textbook.video.root}
        links={[
          { name: '首页', href: paths.dashboard.root },
          { name: '教材管理', href: paths.dashboard.textbook.root },
          { name: '视频', href: paths.dashboard.textbook.video.root },
          { name: '新视频' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VideoNewEditForm currentUser={user} />
    </DashboardContent>
  );
} 