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

// Import supabase client
import { supabase } from 'src/lib/supabase';

import { Form, Field, schemaHelper } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export const AudioSchema = zod.object({
  name: zod.string().min(1, { message: '请填写音频名称!' }),
  note: zod.string().optional(),
  file: schemaHelper.file({ message: '请上传音频文件!' }),
  avatarUrl: zod.any().optional(),
  status: zod.string().default('active'),
  isVerified: zod.boolean().default(true),
});

// ----------------------------------------------------------------------

export function AudioNewEditForm({currentUser}) { // Remove currentUser prop
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const defaultValues = {
    status: 'active',
    avatarUrl: null,
    isVerified: true,
    name: '',
    note: '',
  };

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(AudioSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = methods;

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const newFile = acceptedFiles[0];
    setFile(newFile);
    setValue('file', newFile);
    console.log('File dropped:', newFile);
  }, [setValue]);

  const onSubmit = handleSubmit(async (data) => {
    console.log('Form submitted with data:', data);
    console.log('currentUser:', currentUser);
    try {
      setUploading(true);
      // 1. Upload audio file to Supabase Storage
      const audioFileName = `audio_${Date.now()}_${file.name}`;
      console.log('Uploading audio file:', audioFileName);
      const { error: audioUploadError } = await supabase
        .storage
        .from('audio')
        .upload(audioFileName, file);
      
      if (audioUploadError) { 
        console.log('音频上传失败!', audioUploadError);
        return;
      }
      
      // Get audio URL
      const { data: audioUrlData } = supabase
        .storage
        .from('audio')
        .getPublicUrl(audioFileName);
      
      const audioUrl = audioUrlData.publicUrl;
      console.log('Audio URL:', audioUrl);
      
      // 2. Upload cover image if exists
      let coverUrl = null;
      if (data.avatarUrl) {
        const coverFile = data.avatarUrl;
        const coverFileName = `cover_${Date.now()}_${coverFile.name}`;
        console.log('Uploading cover file:', coverFileName);
        const { error: coverUploadError } = await supabase
          .storage
          .from('audio_cover')
          .upload(coverFileName, coverFile);
        
        if (coverUploadError) {
          console.log('封面上传失败，但音频已上传成功!', coverUploadError);
        } else {
          const { data: coverUrlData } = supabase
            .storage
            .from('audio_cover')
            .getPublicUrl(coverFileName);
          
          coverUrl = coverUrlData.publicUrl;
          console.log('Cover URL:', coverUrl);
        }
      }
      
      // 3. Save audio metadata to database
      console.log('Saving audio metadata to database');
      const { error: insertError } = await supabase
        .from('audio')
        .insert([
          { 
            id: Date.now(),
            name: data.name,
            note: data.note || '',
            file_url: audioUrl,
            cover_url: coverUrl,
          }
        ]);
      
      if (insertError) {
        console.log('保存音频信息失败!', insertError);
        return;
      }
      
      reset();
      setFile(null);
      console.log('创建成功!');
      router.push(paths.dashboard.textbook.audio.root);
      
    } catch (error) {
      console.log('上传过程中出错，请重试!', error);
    } finally {
      setUploading(false);
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
                  上传音频
            </Typography>
            <Field.Upload
                name="file"
                accept={{ 'audio/*': [] }} //只接受audio
                maxSize={50 * 1024 * 1024} // 50MB
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
              <Field.Text name="name" label="音频名称" required />
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
                创建并上传音频
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
