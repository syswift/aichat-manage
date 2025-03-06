'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

//import { AudioNewEditForm } from '../audio-new-edit-form';

// ----------------------------------------------------------------------

export function AudioEditView({ user: currentUser }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.textbook.audio.root}
        links={[
            { name: '首页', href: paths.dashboard.root },
            { name: '教材管理', href: paths.dashboard.textbook.audio.root },
            { name: '音频', href: paths.dashboard.textbook.audio.root},
            { name: currentUser?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/*<AudioNewEditForm currentUser={currentUser} />*/}
    </DashboardContent>
  );
}
