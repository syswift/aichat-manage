'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';

import { supabase } from 'src/lib/supabase';
import { DashboardContent } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { VideoEditForm } from './video-edit-form';

// ----------------------------------------------------------------------

export function VideoEditView({ id }) {
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    async function fetchVideo() {
      const { data, error } = await supabase.from('video').select('*').eq('id', id).single();
      if (error) {
        console.error(error);
      } else {
        setCurrentVideo(data);
      }
    }
    fetchVideo();
  }, [id]);

  if (!currentVideo) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="编辑视频"
        backHref={paths.dashboard.textbook.video.root}
        links={[
          { name: '首页', href: paths.dashboard.root },
          { name: '教材管理', href: paths.dashboard.textbook.root },
          { name: '视频', href: paths.dashboard.textbook.video.root },
          { name: currentVideo.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VideoEditForm currentVideo={currentVideo} />
    </DashboardContent>
  );
} 