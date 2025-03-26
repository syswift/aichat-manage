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

export const PicbookSchema = zod.object({
  name: zod.string().min(1, { message: '请填写绘本名称!' }),
  note: zod.string().optional(),
  file: schemaHelper.file({ message: '请上传绘本文件!' }),
  avatarUrl: zod.any().optional(),
  status: zod.string().default('active'),
  isVerified: zod.boolean().default(true),
});

// ----------------------------------------------------------------------

export function PicbookNewEditForm({ currentPicbook }) {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    resolver: zodResolver(PicbookSchema),
    defaultValues: {
      name: currentPicbook?.name || '',
      note: currentPicbook?.note || '',
      status: currentPicbook?.status || 'active',
      isVerified: currentPicbook?.isVerified || true,
      multiUpload: [],
    },
  });

  const handleDropMultiFile = useCallback(
    (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
    },
    [files]
  );

  const handleRemoveFile = (inputFile) => {
    const filesFiltered = files.filter((fileFiltered) => fileFiltered !== inputFile);
    setFiles(filesFiltered);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  const { reset } = methods;

  const onSubmit = methods.handleSubmit(async (data) => {
    setUploading(true);
    setIsSubmitting(true);
    try {
      let picbookUrl = '';
      let coverUrl = '';

      const { error: insertError } = await supabase
        .from('picbook')
        .insert([
          {
            id: Date.now(),
            name: data.name,
            note: data.note || '',
            file_url: picbookUrl,
            cover_url: coverUrl,
          }
        ]);

      if (insertError) {
        console.log('保存绘本信息失败!', insertError);
        return;
      }

      reset();
      console.log('创建成功!');
      router.push(paths.dashboard.textbook.picbook.root);

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

        <Grid size={{ xs: 12, md: 12 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="name" label="绘本名称" required />
              <Field.Text name="note" label="备注" />
              <Box sx={{ mb: 5 }}>
                <Typography 
                  name="upload"
                  fontSize="24px"
                  fontWeight={600}
                  align="center">
                  上传绘本
                </Typography>
                <Field.Upload
                  multiple
                  thumbnail
                  name="multiUpload"
                  value={files}
                  accept={{ 'image/*': [] }}
                  maxSize={500 * 1024 * 1024}
                  onDrop={handleDropMultiFile}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  onUpload={() => console.info('ON UPLOAD')}
                />
              </Box>
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
                创建并上传绘本
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
} 