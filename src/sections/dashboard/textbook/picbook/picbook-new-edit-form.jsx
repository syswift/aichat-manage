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

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const PicbookSchema = zod.object({
  name: zod.string().min(1, { message: '请填写绘本名称!' }),
  note: zod.string().optional(),
  multiUpload: zod
    .array(zod.any())
    .refine((files) => files && files.length > 0, { message: '请上传绘本图片!' }),
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

  const { setValue } = methods;

  const handleDropMultiFile = useCallback(
    (acceptedFiles) => {
      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);
      setValue('multiUpload', newFiles, { shouldValidate: true });
    },
    [files, setValue]
  );

  const handleRemoveFile = (inputFile) => {
    const filesFiltered = files.filter((fileFiltered) => fileFiltered !== inputFile);
    setFiles(filesFiltered);
    setValue('multiUpload', filesFiltered, { shouldValidate: true });
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
    setValue('multiUpload', [], { shouldValidate: true });
  };

  const sanitizeFileName = (name) => {
    // Add unique identifier - timestamp + random number
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Replace Chinese characters and special characters with underscores
    return `${uniqueId}_${name
      .replace(/[\u4e00-\u9fa5]/g, '_') // Replace Chinese characters
      .replace(/[^a-zA-Z0-9_.-]/g, '_') // Replace other special characters
      .toLowerCase()}`;
  };

  const { reset } = methods;

  const onSubmit = methods.handleSubmit(async (data) => {
    if (files.length === 0) {
      console.error('请上传绘本图片!');
      return;
    }

    setUploading(true);
    setIsSubmitting(true);
    try {
      // 1. Create sanitized folder name based on picbook name
      const folderName = sanitizeFileName(data.name);
      
      // 2. Upload all picbook images to the folder
      const uploadedFileNames = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create sanitized file name with index to maintain order
        const sanitizedFileName = `${i + 1}_${sanitizeFileName(file.name)}`;
        const filePath = `${folderName}/${sanitizedFileName}`;
        
        console.log(`Uploading file ${i+1}/${files.length}: ${filePath}`);
        
        const { error: uploadError } = await supabase
          .storage
          .from('picbook')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error(`图片 ${sanitizedFileName} 上传失败:`, uploadError);
          continue;
        }
        
        // Add successfully uploaded filename to our list
        uploadedFileNames.push(sanitizedFileName);
      }

      // 3. Upload cover image if exists
      let coverUrl = null;
      if (data.avatarUrl) {
        const coverFile = data.avatarUrl;
        const coverFileName = `cover_${Date.now()}_${sanitizeFileName(coverFile.name)}`;
        console.log('Uploading cover file:', coverFileName);
        const { error: coverUploadError } = await supabase
          .storage
          .from('picbookcover')
          .upload(coverFileName, coverFile);
        
        if (coverUploadError) {
          console.log('封面上传失败，但图片已上传成功!', coverUploadError);
        } else {
          const { data: coverUrlData } = supabase
            .storage
            .from('picbookcover')
            .getPublicUrl(coverFileName);
          
          coverUrl = coverUrlData.publicUrl;
          console.log('Cover URL:', coverUrl);
        }
      }

      // 4. Store data in database with JSON array of file names
      const { error: insertError } = await supabase
        .from('picbook')
        .insert([
          {
            name: data.name,
            note: data.note || '',
            cover_url: coverUrl,
            pics_url_list: JSON.stringify(uploadedFileNames), // Store as JSON string
            folder_name: folderName, // Store folder name as bucket_name
            status: 'pending',
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
                  helperText="支持多文件上传，最大500MB"
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