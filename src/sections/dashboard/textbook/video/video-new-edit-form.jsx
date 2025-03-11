'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { supabase } from 'src/lib/supabase';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const VideoSchema = zod.object({
  name: zod.string().min(1, { message: '请填写视频名称!' }),
  note: zod.string().optional(),
  file: schemaHelper.file({ message: '请上传视频文件!' }),
  avatarUrl: zod.any().optional(),
  status: zod.string().default('active'),
  isVerified: zod.boolean().default(true),
});

// ----------------------------------------------------------------------

export function VideoNewEditForm({ currentVideo }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    resolver: zodResolver(VideoSchema),
    defaultValues: {
      name: currentVideo?.name || '',
      note: currentVideo?.note || '',
      status: currentVideo?.status || 'active',
      isVerified: currentVideo?.isVerified || true,
    },
  });

  const { reset } = methods;

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const newFile = acceptedFiles[0];
    if (newFile) {
      setFile(newFile);
    }
  }, []);

  const onSubmit = methods.handleSubmit(async (data) => {
    setUploading(true);
    setIsSubmitting(true);
    try {
      let videoUrl = '';
      let coverUrl = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        videoUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('video')
        .insert([
          {
            id: Date.now(),
            name: data.name,
            note: data.note || '',
            file_url: videoUrl,
            cover_url: coverUrl,
          }
        ]);

      if (insertError) {
        console.log('保存视频信息失败!', insertError);
        return;
      }

      reset();
      setFile(null);
      console.log('创建成功!');
      router.push(paths.dashboard.textbook.video.root);

    } catch (error) {
      console.log('上传过程中出错，请重试!', error);
    } finally {
      setUploading(false);
      setIsSubmitting(false);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            <Box sx={{ mb: 5 }}>
              <Typography 
                name="file"
                fontSize="24px"
                fontWeight={600}
                align="center">
                上传视频
              </Typography>
              <Field.Upload
                name="file"
                accept={{ 'video/*': [] }}
                maxSize={500 * 1024 * 1024}
                value={file}
                onDrop={handleDropSingleFile}
                onDelete={() => setFile(null)}
                sx={{
                  py: 1,
                  width: 'auto',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="name" label="视频名称" required />
              <Field.Text name="note" label="备注" />
              <Box>
                <Typography 
                  fontSize="24px"
                  lineHeight={4}
                  fontWeight={600}
                  align="center">
                  上传封面
                </Typography>
                <Field.UploadAvatar
                  name="avatarUrl"
                />
              </Box>
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting || uploading}>
                创建并上传视频
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
} 