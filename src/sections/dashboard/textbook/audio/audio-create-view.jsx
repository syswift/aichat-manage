'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext  } from 'src/auth/hooks';

import { AudioNewEditForm } from './audio-new-edit-form';

// ----------------------------------------------------------------------

export function AudioCreateView() {

  const { user } = useAuthContext();
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="新增音频"
        backHref={paths.dashboard.textbook.audio.root}
        links={[
          { name: '首页', href: paths.dashboard.root },
          { name: '教材管理', href: paths.dashboard.textbook.root },
          { name: '音频', href: paths.dashboard.textbook.audio.root },
          { name: '新音频' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AudioNewEditForm currentUser={user}/>
    </DashboardContent>
  );
}
