'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';

import { supabase } from 'src/lib/supabase';
import { DashboardContent } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
//import { AudioNewEditForm } from '../audio-new-edit-form';

// ----------------------------------------------------------------------

export function AudioEditView({ id }) {
  const [currentAudio, setCurrentAudio] = useState(null);

  useEffect(() => {
    async function fetchAudio() {
      const { data, error } = await supabase.from('audio').select('*').eq('id', id).single();
      if (error) {
        console.error(error);
      } else {
        setCurrentAudio(data);
      }
    }
    fetchAudio();
  }, [id]);

  if (!currentAudio) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.textbook.audio.root}
        links={[
          { name: '首页', href: paths.dashboard.root },
          { name: '教材管理', href: paths.dashboard.textbook.root },
          { name: '音频', href: paths.dashboard.textbook.audio.root },
          { name: currentAudio.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/*<AudioNewEditForm currentUser={currentUser} />*/}
    </DashboardContent>
  );
}
