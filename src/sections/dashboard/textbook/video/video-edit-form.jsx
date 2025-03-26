'use client';

import { z as zod } from 'zod';
import Video from 'next-video';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef , useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import { List } from '@mui/material';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';

import { supabase } from 'src/lib/supabase';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------
export const VideoSchema = zod.object({
  name: zod.string().min(1, { message: '请填写视频名称!' }),
  note: zod.string().optional(),
  avatarUrl: zod.any().optional(),
  status: zod.string().default('active'),
  updated_at: zod.string().optional(),
  isVerified: zod.boolean().default(true),
});
// ----------------------------------------------------------------------

export function VideoEditForm({ currentVideo }) {
    const [uploading, setUploading] = useState(false);
    const [quizOpen, setquizOpen] = useState(false);
    const [videoOpen, setvideoOpen] = useState(false);
    const [picbookOpen, setpicbookOpen] = useState(false);
    const [audioOpen, setaudioOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    //const [duration, setDuration] = useState(0);
    const videoRef = useRef(null);
    const [audioItems, setAudioItems] = useState([]);
    const [audioOptions, setAudioOptions] = useState([]);
    const [picbookItems, setPicbookItems] = useState([]);
    const [picbookOptions, setPicbookOptions] = useState([]);
    const [videoItems, setVideoItems] = useState([]);
    const [videoOptions, setVideoOptions] = useState([]);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    // currentTime: Current playback position in seconds
    // duration: Total video duration in seconds
    // Progress percentage: (currentTime / duration) * 100

    const fetchExistingAudioItems = useCallback(async () => {
        try {
          if (!currentVideo?.id) return;
          
          const { data, error } = await supabase
            .from('video_audio_links')
            .select(`
              id,
              timestamp,
              audio_id,
              audio:audio_id (
                id,
                name
              )
            `)
            .eq('video_id', currentVideo.id);
          
          if (error) {
            console.error('Error fetching audio links:', error);
            return;
          }
          
          if (data && data.length > 0) {
            // Transform data into the format expected by audioItems
            const formattedItems = data.map(link => ({
              id: `audio-${link.id}`,
              name: link.audio?.name || `音频 ${link.id}`,
              timestamp: link.timestamp,
              audioId: link.audio_id
            }));
            
            setAudioItems(formattedItems);
          }
        } catch (error) {
          console.error('Failed to fetch audio links:', error.message);
        }
    }, [currentVideo]);

    const fetchExistingPicbookItems = useCallback(async () => {
        try {
          if (!currentVideo?.id) return;
          
          const { data, error } = await supabase
            .from('video_picbook_links')
            .select(`
              id,
              timestamp,
              picbook_id,
              picbook:picbook_id (
                id,
                name
              )
            `)
            .eq('video_id', currentVideo.id);
          
          if (error) {
            console.error('Error fetching picbook links:', error);
            return;
          }
          
          if (data && data.length > 0) {
            const formattedItems = data.map(link => ({
              id: `picbook-${link.id}`,
              name: link.picbook?.name || `绘本 ${link.id}`,
              timestamp: link.timestamp,
              picbookId: link.picbook_id
            }));
            
            setPicbookItems(formattedItems);
          }
        } catch (error) {
          console.error('Failed to fetch picbook links:', error.message);
        }
    }, [currentVideo]);

    const fetchExistingVideoItems = useCallback(async () => {
        try {
          if (!currentVideo?.id) return;
          
          const { data, error } = await supabase
            .from('video_video_links')
            .select(`
              id,
              timestamp,
              sub_video_id,
              sub_video:sub_video_id (
                id,
                name
              )
            `)
            .eq('video_id', currentVideo.id);
          
          if (error) {
            console.error('Error fetching video links:', error);
            return;
          }
          
          if (data && data.length > 0) {
            const formattedItems = data.map(link => ({
              id: `video-${link.id}`,
              name: link.sub_video?.name || `视频 ${link.id}`,
              timestamp: link.timestamp,
              videoId: link.sub_video_id
            }));
            
            setVideoItems(formattedItems);
          }
        } catch (error) {
          console.error('Failed to fetch video links:', error.message);
        }
    }, [currentVideo]);

    const fetchAudioOptions = useCallback(async () => {
        try {
          const { data, error } = await supabase
            .from('audio')
            .select('id, name, file_url');
          
          if (error) {
            console.error('Error fetching audio options:', error);
            return;
          }
          
          setAudioOptions(data || []);
        } catch (error) {
          console.error('Failed to fetch audio options:', error.message);
        }
    }, []);

    const fetchPicbookOptions = useCallback(async () => {
        try {
          const { data, error } = await supabase
            .from('picbook')
            .select('id, name');
          
          if (error) {
            console.error('Error fetching picbook options:', error);
            return;
          }
          
          setPicbookOptions(data || []);
        } catch (error) {
          console.error('Failed to fetch picbook options:', error.message);
        }
    }, []);

    const fetchVideoOptions = useCallback(async () => {
        try {
          const { data, error } = await supabase
            .from('video')
            .select('id, name')
            .neq('id', currentVideo?.id || ''); // Exclude current video
          
          if (error) {
            console.error('Error fetching video options:', error);
            return;
          }
          
          setVideoOptions(data || []);
        } catch (error) {
          console.error('Failed to fetch video options:', error.message);
        }
    }, [currentVideo?.id]);

    useEffect(() => {
        fetchAudioOptions();
        fetchExistingAudioItems();
        fetchPicbookOptions();
        fetchExistingPicbookItems();
        fetchVideoOptions();
        fetchExistingVideoItems();
    }, [fetchAudioOptions, fetchExistingAudioItems, fetchPicbookOptions, fetchExistingPicbookItems, 
        fetchVideoOptions, fetchExistingVideoItems]);

    const handleAudioSelection = (id, audioId) => {
        setAudioItems(audioItems.map(item => 
          item.id === id ? { 
            ...item, 
            audioId,
            // Find the selected audio name from options
            name: audioOptions.find(audio => audio.id === audioId)?.name || item.name
          } : item
        ));
    };

    const handlePicbookSelection = (id, picbookId) => {
        setPicbookItems(picbookItems.map(item => 
          item.id === id ? { 
            ...item, 
            picbookId,
            name: picbookOptions.find(picbook => picbook.id === picbookId)?.name || item.name
          } : item
        ));
    };

    const handleVideoSelection = (id, videoId) => {
        setVideoItems(videoItems.map(item => 
          item.id === id ? { 
            ...item, 
            videoId,
            name: videoOptions.find(video => video.id === videoId)?.name || item.name
          } : item
        ));
    };

    const handleAddAudioItem = () => {
        const currentTimestamp = Math.floor(currentTime);
        
        // Check if this timestamp already exists in any audio item
        const timestampExists = audioItems.some(item => Math.floor(item.timestamp) === currentTimestamp) ||
                                picbookItems.some(item => Math.floor(item.timestamp) === currentTimestamp) ||
                                videoItems.some(item => Math.floor(item.timestamp) === currentTimestamp);
        
        if (timestampExists) {
            setNotification({
            open: true,
            message: `时间戳 ${Math.floor(currentTimestamp / 60)}:${(currentTimestamp % 60).toString().padStart(2, '0')} 已存在！`,
            severity: 'warning'
            });
            return; // Don't add a duplicate timestamp
        }
        
        setAudioItems([...audioItems, { 
            id: `audio-${Date.now()}`, 
            name: `音频 ${audioItems.length + 1}`,
            timestamp: currentTimestamp,
            audioId: ''
        }]);
    };
    
    const handleAddPicbookItem = () => {
        const currentTimestamp = Math.floor(currentTime);
        
        // Check if this timestamp already exists in any audio item
        const timestampExists = audioItems.some(item => Math.floor(item.timestamp) === currentTimestamp) ||
                                picbookItems.some(item => Math.floor(item.timestamp) === currentTimestamp) ||
                                videoItems.some(item => Math.floor(item.timestamp) === currentTimestamp);
        
        if (timestampExists) {
            setNotification({
            open: true,
            message: `时间戳 ${Math.floor(currentTimestamp / 60)}:${(currentTimestamp % 60).toString().padStart(2, '0')} 已存在！`,
            severity: 'warning'
            });
            return; // Don't add a duplicate timestamp
        }
        
        setPicbookItems([...picbookItems, { 
            id: `picbook-${Date.now()}`, 
            name: `绘本 ${picbookItems.length + 1}`,
            timestamp: currentTimestamp,
            picbookId: ''
        }]);
    };
    
    const handleAddVideoItem = () => {
        const currentTimestamp = Math.floor(currentTime);
        
        // Check if this timestamp already exists in any audio item
        const timestampExists = audioItems.some(item => Math.floor(item.timestamp) === currentTimestamp) ||
                                picbookItems.some(item => Math.floor(item.timestamp) === currentTimestamp) ||
                                videoItems.some(item => Math.floor(item.timestamp) === currentTimestamp);
        
        if (timestampExists) {
            setNotification({
            open: true,
            message: `时间戳 ${Math.floor(currentTimestamp / 60)}:${(currentTimestamp % 60).toString().padStart(2, '0')} 已存在！`,
            severity: 'warning'
            });
            return; // Don't add a duplicate timestamp
        }
        
        setVideoItems([...videoItems, { 
            id: `video-${Date.now()}`, 
            name: `视频 ${videoItems.length + 1}`,
            timestamp: currentTimestamp,
            videoId: ''
        }]);
    };
    
    // Add a function to close the notification
    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const handleRemoveAudioItem = (id) => {
        setAudioItems(audioItems.filter(item => item.id !== id));
    };

    const handleRemovePicbookItem = (id) => {
        setPicbookItems(picbookItems.filter(item => item.id !== id));
    };

    const handleRemoveVideoItem = (id) => {
        setVideoItems(videoItems.filter(item => item.id !== id));
    };

    const handleQuizClick = useCallback(() => {
        setquizOpen((prev) => !prev);
    }, []);

    const handleVideoClick = useCallback(() => {
      setvideoOpen((prev) => !prev);
  }, []);

    const handlePicbookClick = useCallback(() => {
        setpicbookOpen((prev) => !prev);
    }, []);

    const handleAudioClick = useCallback(() => {
        setaudioOpen((prev) => !prev);
    }, []);

    const handleTimeUpdate = (event) => {
    setCurrentTime(event.target.currentTime);
    };
/*
    const handleLoadedMetadata = (event) => {
    setDuration(event.target.duration);
    };
*/    
    // To manually seek to a specific time:
    //const seekToTime = (timeInSeconds) => {
    //    if (videoRef.current) {
    //    videoRef.current.currentTime = timeInSeconds;
    //    }
    //};

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
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
          setUploading(true);
          
          // 1. Update the video information
          const { error: videoUpdateError } = await supabase
            .from('video') // Adjust table name if different
            .update({
              name: data.name,
              note: data.note,
              cover_url: data.avatarUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentVideo.id);
            
          if (videoUpdateError) {
            throw new Error(`更新视频信息失败: ${videoUpdateError.message}`);
          }
          
          // 2. Handle audio items - first delete existing associations
          const { error: deleteAudioError } = await supabase
            .from('video_audio_links') // Adjust table name if different
            .delete()
            .eq('video_id', currentVideo.id);
            
          if (deleteAudioError) {
            throw new Error(`删除原有音频关联失败: ${deleteAudioError.message}`);
          }
          
          // 3. Handle picbook items - first delete existing associations
          const { error: deletePicbookError } = await supabase
            .from('video_picbook_links') // Adjust table name if different
            .delete()
            .eq('video_id', currentVideo.id);
            
          if (deletePicbookError) {
            throw new Error(`删除原有绘本关联失败: ${deletePicbookError.message}`);
          }
          
          // 4. Handle video items - first delete existing associations
          const { error: deleteVideoError } = await supabase
            .from('video_video_links') // Adjust table name if different
            .delete()
            .eq('video_id', currentVideo.id);
            
          if (deleteVideoError) {
            throw new Error(`删除原有视频关联失败: ${deleteVideoError.message}`);
          }
          
          // 5. Insert new audio associations
          if (audioItems.length > 0) {
            const audioLinks = audioItems
              .filter(item => item.audioId) // Only include items with selected audio
              .map(item => ({
                type: 'audio',
                video_id: currentVideo.id,
                audio_id: item.audioId,
                timestamp: item.timestamp,
                created_at: new Date().toISOString()
              }));
              
            if (audioLinks.length > 0) {
              const { error: insertError } = await supabase
                .from('video_audio_links')
                .insert(audioLinks);
                
              if (insertError) {
                throw new Error(`添加新音频关联失败: ${insertError.message}`);
              }
            }
          }
          
          // 6. Insert new picbook associations
          if (picbookItems.length > 0) {
            const picbookLinks = picbookItems
              .filter(item => item.picbookId) // Only include items with selected picbooks
              .map(item => ({
                type: 'picbook',
                video_id: currentVideo.id,
                picbook_id: item.picbookId,
                timestamp: item.timestamp,
                created_at: new Date().toISOString()
              }));
              
            if (picbookLinks.length > 0) {
              const { error: insertError } = await supabase
                .from('video_picbook_links')
                .insert(picbookLinks);
                
              if (insertError) {
                throw new Error(`添加新绘本关联失败: ${insertError.message}`);
              }
            }
          }
          
          // 7. Insert new video associations
          if (videoItems.length > 0) {
            const videoLinks = videoItems
              .filter(item => item.videoId) // Only include items with selected videos
              .map(item => ({
                type: 'video',
                video_id: currentVideo.id,
                sub_video_id: item.videoId,
                timestamp: item.timestamp,
                created_at: new Date().toISOString()
              }));
              
            if (videoLinks.length > 0) {
              const { error: insertError } = await supabase
                .from('video_video_links')
                .insert(videoLinks);
                
              if (insertError) {
                throw new Error(`添加新视频关联失败: ${insertError.message}`);
              }
            }
          }
          
          // Show success notification
          setNotification({
            open: true,
            message: '视频已成功更新！',
            severity: 'success'
          });
          
        } catch (error) {
          console.error('Error updating video:', error);
          
          // Show error notification
          setNotification({
            open: true,
            message: `更新失败: ${error.message}`,
            severity: 'error'
          });
        } finally {
          setUploading(false);
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
                <Field.Text name="name" label="视频名称" required />
                <Field.Text name="note" label="备注" />        

                <Video 
                    ref={videoRef}
                    src={currentVideo?.video_url}
                    //poster={currentVideo?.cover_url || "asset/goose.png"}
                    onTimeUpdate={handleTimeUpdate}
                    //onLoadedMetadata={handleLoadedMetadata}
                />
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
                            {audioItems.map((item) => (
                            <ListItemButton key={item.id} sx={{ pl: 4, pr: 1, display: 'flex', alignItems: 'center' }}>
                                <ListItemIcon>
                                <Iconify icon="mdi:music-note" width={20} />
                                </ListItemIcon>
                                <FormControl fullWidth size="small" sx={{ mr: 2 }}>
                                <InputLabel id={`audio-select-${item.id}-label`}>选择音频</InputLabel>
                                <Select
                                    labelId={`audio-select-${item.id}-label`}
                                    id={`audio-select-${item.id}`}
                                    value={item.audioId || ''}
                                    label="选择音频"
                                    onChange={(e) => handleAudioSelection(item.id, e.target.value)}
                                >
                                    {audioOptions.map((audio) => (
                                    <MenuItem key={audio.id} value={audio.id}>
                                        {audio.name}
                                    </MenuItem>
                                    ))}
                                </Select>
                                </FormControl>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                {`${Math.floor(item.timestamp / 60)}:${(item.timestamp % 60).toString().padStart(2, '0')}`}
                                </Typography>
                                <IconButton edge="end" onClick={() => handleRemoveAudioItem(item.id)}>
                                <Iconify icon="eva:trash-2-outline" width={20} />
                                </IconButton>
                            </ListItemButton>
                            ))}
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                            <Button 
                                startIcon={<Iconify icon="eva:plus-fill" />}
                                onClick={handleAddAudioItem}
                                variant="outlined"
                                size="small"
                            >
                                添加音频
                            </Button>
                            </Box>
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
                            {picbookItems.map((item) => (
                            <ListItemButton key={item.id} sx={{ pl: 4, pr: 1, display: 'flex', alignItems: 'center' }}>
                                <ListItemIcon>
                                <Iconify icon="mdi:book-open-page-variant" width={20} />
                                </ListItemIcon>
                                <FormControl fullWidth size="small" sx={{ mr: 2 }}>
                                <InputLabel id={`picbook-select-${item.id}-label`}>选择绘本</InputLabel>
                                <Select
                                    labelId={`picbook-select-${item.id}-label`}
                                    id={`picbook-select-${item.id}`}
                                    value={item.picbookId || ''}
                                    label="选择绘本"
                                    onChange={(e) => handlePicbookSelection(item.id, e.target.value)}
                                >
                                    {picbookOptions.map((picbook) => (
                                    <MenuItem key={picbook.id} value={picbook.id}>
                                        {picbook.name}
                                    </MenuItem>
                                    ))}
                                </Select>
                                </FormControl>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                {`${Math.floor(item.timestamp / 60)}:${(item.timestamp % 60).toString().padStart(2, '0')}`}
                                </Typography>
                                <IconButton edge="end" onClick={() => handleRemovePicbookItem(item.id)}>
                                <Iconify icon="eva:trash-2-outline" width={20} />
                                </IconButton>
                            </ListItemButton>
                            ))}
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                            <Button 
                                startIcon={<Iconify icon="eva:plus-fill" />}
                                onClick={handleAddPicbookItem}
                                variant="outlined"
                                size="small"
                            >
                                添加绘本
                            </Button>
                            </Box>
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

                    <ListItemButton onClick={handleVideoClick}>
                        <ListItemIcon>
                            <Iconify icon="si:actions-duotone" width={24} />
                        </ListItemIcon>
                        
                        <ListItemText primary="视频" />
                        <Iconify icon={videoOpen ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} />
                    </ListItemButton>

                    <Collapse in={videoOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {videoItems.map((item) => (
                            <ListItemButton key={item.id} sx={{ pl: 4, pr: 1, display: 'flex', alignItems: 'center' }}>
                                <ListItemIcon>
                                <Iconify icon="mdi:video" width={20} />
                                </ListItemIcon>
                                <FormControl fullWidth size="small" sx={{ mr: 2 }}>
                                <InputLabel id={`video-select-${item.id}-label`}>选择视频</InputLabel>
                                <Select
                                    labelId={`video-select-${item.id}-label`}
                                    id={`video-select-${item.id}`}
                                    value={item.videoId || ''}
                                    label="选择视频"
                                    onChange={(e) => handleVideoSelection(item.id, e.target.value)}
                                >
                                    {videoOptions.map((video) => (
                                    <MenuItem key={video.id} value={video.id}>
                                        {video.name}
                                    </MenuItem>
                                    ))}
                                </Select>
                                </FormControl>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                {`${Math.floor(item.timestamp / 60)}:${(item.timestamp % 60).toString().padStart(2, '0')}`}
                                </Typography>
                                <IconButton edge="end" onClick={() => handleRemoveVideoItem(item.id)}>
                                <Iconify icon="eva:trash-2-outline" width={20} />
                                </IconButton>
                            </ListItemButton>
                            ))}
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                            <Button 
                                startIcon={<Iconify icon="eva:plus-fill" />}
                                onClick={handleAddVideoItem}
                                variant="outlined"
                                size="small"
                            >
                                添加视频
                            </Button>
                            </Box>
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
      <Snackbar 
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
        </Alert>
       </Snackbar>
    </Form>
    );
}
