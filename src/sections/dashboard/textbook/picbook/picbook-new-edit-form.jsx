'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { PicbookEditPopup } from './picbook-edit-popup';

// ----------------------------------------------------------------------

export const PicbookSchema = zod.object({
  name: zod.string().min(1, { message: '请填写绘本名称!' }),
  note: zod.string().optional(),
  avatarUrl: zod.any().optional(),
  status: zod.string().default('active'),
  isVerified: zod.boolean().default(true),
});

// ----------------------------------------------------------------------

export function PicbookNewEditForm({ currentPicbook }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const methods = useForm({
    resolver: zodResolver(PicbookSchema),
    defaultValues: {
      name: currentPicbook?.name || '',
      note: currentPicbook?.note || '',
      status: currentPicbook?.status || 'active',
      isVerified: currentPicbook?.isVerified || true,
      avatarUrl: currentPicbook?.cover_url || null,
    },
  });

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
    setUploading(true);
    setIsSubmitting(true);
    try {
      let coverUrl = currentPicbook?.cover_url || null;
      
      // Handle cover image update if a new one is provided
      if (data.avatarUrl && typeof data.avatarUrl !== 'string') {
        // Extract the existing cover filename from URL if it exists
        if (currentPicbook?.cover_url) {
          const currentCoverFileName = currentPicbook.cover_url.replace(
            'https://reecurbemkhjmectdkyp.supabase.co/storage/v1/object/public/picbookcover/', 
            ''
          );
          
          // Delete the old cover file
          const { error: deleteError } = await supabase
            .storage
            .from('picbookcover')
            .remove([currentCoverFileName]);
            
          if (deleteError) {
            console.log('删除旧封面失败，将继续上传新封面', deleteError);
          }
        }
        
        // Upload new cover image
        const coverFile = data.avatarUrl;
        const coverFileName = `cover_${Date.now()}_${sanitizeFileName(coverFile.name)}`;
        console.log('Uploading new cover file:', coverFileName);
        
        const { error: coverUploadError } = await supabase
          .storage
          .from('picbookcover')
          .upload(coverFileName, coverFile);
        
        if (coverUploadError) {
          console.log('新封面上传失败!', coverUploadError);
        } else {
          const { data: coverUrlData } = supabase
            .storage
            .from('picbookcover')
            .getPublicUrl(coverFileName);
          
          coverUrl = coverUrlData.publicUrl;
          console.log('New Cover URL:', coverUrl);
        }
      }

      // Update data in database
      const { error: updateError } = await supabase
        .from('picbook')
        .update({
          name: data.name,
          note: data.note || '',
          cover_url: coverUrl,
          status: 'pending',
        })
        .eq('id', currentPicbook.id);

      if (updateError) {
        console.log('更新绘本信息失败!', updateError);
        return;
      }

      reset();
      console.log('更新成功!');
      router.push(paths.dashboard.textbook.picbook.root);

    } catch (error) {
      console.log('更新过程中出错，请重试!', error);
    } finally {
      setUploading(false);
      setIsSubmitting(false);
    }
  });

  const handleOpenPopup = () => {
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
  };

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
              <Box sx={{ mb: 5, mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Box
                  onClick={handleOpenPopup}
                  sx={{ 
                    minHeight: '180px',
                    minWidth: '140px',
                    maxHeight: '350px',
                    maxWidth: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: 2,
                    boxShadow: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: '#f5f5f5', // Light background for when image is loading or missing
                    '&:hover': {
                      boxShadow: 6,
                      '& .overlay': {
                        opacity: 1,
                      }
                    }
                  }}
                >
                  {currentPicbook?.cover_url ? (
                    <Box
                      component="img"
                      src={currentPicbook.cover_url}
                      alt="绘本封面"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        maxHeight: '350px',
                      }}
                    />
                  ) : (
                    <Iconify 
                      icon="ph:book-open-duotone" 
                      width={80} 
                      height={80} 
                      sx={{ opacity: 0.6 }}
                    />
                  )}
                  
                  {/* Overlay with text that appears on hover */}
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="eva:edit-fill" sx={{ color: 'white' }} />
                      <Typography color="white" fontWeight={500}>
                        详细编辑绘本
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
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
                更新绘本
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      
      <PicbookEditPopup 
        open={popupOpen} 
        onClose={handleClosePopup} 
        picsUrlList={currentPicbook?.pics_url_list} 
        folderName={currentPicbook?.folder_name}
        picbookId={currentPicbook?.id}
      />
    </Form>
  );
}