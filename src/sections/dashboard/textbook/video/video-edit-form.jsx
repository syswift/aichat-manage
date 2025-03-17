'use client';

import { z as zod } from 'zod';
import Video from 'next-video';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
// eslint-disable-next-line import/no-unresolved
import demovideo from 'https://reecurbemkhjmectdkyp.supabase.co/storage/v1/object/public/video//file_example_MP4_1920_18MG.mp4'

import Box from '@mui/material/Box';
import { List } from '@mui/material';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------
export const VideoSchema = zod.object({
  name: zod.string().min(1, { message: '请填写视频名称!' }),
  note: zod.string().optional(),
  avatarUrl: zod.any().optional(),
  status: zod.string().default('active'),
  isVerified: zod.boolean().default(true),
});
// ----------------------------------------------------------------------

export function VideoEditForm({ currentVideo }) {
    const [uploading, setUploading] = useState(false);
    const [quizOpen, setquizOpen] = useState(false);
    const [picbookOpen, setpicbookOpen] = useState(false);
    const [audioOpen, setaudioOpen] = useState(false);

    const handleQuizClick = useCallback(() => {
        setquizOpen((prev) => !prev);
    }, []);

    const handlePicbookClick = useCallback(() => {
        setpicbookOpen((prev) => !prev);
    }, []);

    const handleAudioClick = useCallback(() => {
        setaudioOpen((prev) => !prev);
    }, []);

    const defaultValues = {
        name: currentVideo?.name || '',
        note: currentVideo?.note || '',
        avatarUrl: currentVideo?.cover_url || null,
        status: currentVideo?.status || 'active',
        isVerified: currentVideo?.isVerified || true,
    };

    const methods = useForm({
        mode: 'onSubmit',
        resolver: zodResolver(VideoSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: { isSubmitting },
        setValue,
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
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
                <Field.Text name="name" label="视频名称" required />
                <Field.Text name="note" label="备注" />        

                <Video src={demovideo}/>
                <Box>
                    <Typography 
                    fontSize="24px"
                    lineHeight={4}
                    fontWeight={600}
                    align="center">
                    更改封面
                    </Typography>
                    <Field.UploadAvatar
                    name="avatarUrl"
                    value={currentVideo?.cover_url || null}
                    />
                </Box>

                <List
                    sx={{ bgcolor: 'background.paper' }}
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                    subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                        在视频中插入元素
                    </ListSubheader>
                    }
                >
                    <ListItemButton onClick={handleAudioClick}>
                        <ListItemIcon>
                            <Iconify icon="fad:logo-audacity" width={24} />
                        </ListItemIcon>
                        <ListItemText primary="音频" />

                        <Iconify icon={audioOpen ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} />

                    </ListItemButton>

                    <Collapse in={audioOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemIcon>
                                    <Iconify icon="ic:round-star-border" width={24} />
                                </ListItemIcon>
                                <ListItemText primary="Starred" />
                            </ListItemButton>
                        </List>
                    </Collapse>

                    <ListItemButton onClick={handlePicbookClick}>
                        <ListItemIcon>
                            <Iconify icon="uil:file-contract" width={24} />
                        </ListItemIcon>
                        <ListItemText primary="绘本" />
                        <Iconify icon={picbookOpen ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} />
                    </ListItemButton>

                    <Collapse in={picbookOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemIcon>
                                    <Iconify icon="ic:round-star-border" width={24} />
                                </ListItemIcon>
                                <ListItemText primary="占位" />
                            </ListItemButton>
                        </List>
                    </Collapse>

                    <ListItemButton onClick={handleQuizClick}>
                        <ListItemIcon>
                            <Iconify icon="uil:edit" width={24} />
                        </ListItemIcon>
                        
                        <ListItemText primary="习题" />
                        <Iconify icon={quizOpen ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} />
                    </ListItemButton>

                    <Collapse in={quizOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemIcon>
                                    <Iconify icon="ic:round-star-border" width={24} />
                                </ListItemIcon>
                                <ListItemText primary="占位" />
                            </ListItemButton>
                        </List>
                    </Collapse>
                </List>
            </Box>
              
          
            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting || uploading}>
                保存编辑视频
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
    );
}
