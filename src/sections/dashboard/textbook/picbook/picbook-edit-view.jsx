'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';

import { supabase } from 'src/lib/supabase';
import { DashboardContent } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PicbookNewEditForm } from './picbook-new-edit-form';

// ----------------------------------------------------------------------

export function PicbookEditView({ id }) {
  const [currentPicbook, setCurrentPicbook] = useState(null);

  useEffect(() => {
    async function fetchPicbook() {
      const { data, error } = await supabase.from('picbook').select('*').eq('id', id).single();
      if (error) {
        console.error(error);
      } else {
        setCurrentPicbook(data);
      }
    }
    fetchPicbook();
  }, [id]);

  if (!currentPicbook) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="编辑绘本"
        backHref={paths.dashboard.textbook.picbook.root}
        links={[
          { name: '首页', href: paths.dashboard.root },
          { name: '教材管理', href: paths.dashboard.textbook.root },
          { name: '绘本', href: paths.dashboard.textbook.picbook.root },
          { name: currentPicbook.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PicbookNewEditForm currentPicbook={currentPicbook} />
    </DashboardContent>
  );
} 