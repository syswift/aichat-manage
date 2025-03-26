import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import CardContent from '@mui/material/CardContent';
import DialogContent from '@mui/material/DialogContent';

import { supabase } from 'src/lib/supabase';

import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

// Hotspot component with adjusted positioning
function Hotspot({ x, y, index, onClick, imagePosition, type }) {
  // Apply positioning based on the actual rendered image position and size
  const style = imagePosition ? {
    position: 'absolute',
    left: imagePosition.left + (imagePosition.width * x / 100),
    top: imagePosition.top + (imagePosition.height * y / 100),
    transform: 'translate(-50%, -50%)',
    width: 30,
    height: 30,
    bgcolor: getHotspotColor(type),
    color: 'white',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    transition: 'all 0.2s',
    zIndex: 2,
    '&:hover': {
      transform: 'translate(-50%, -50%) scale(1.1)',
      bgcolor: 'primary.dark',
    },
    fontSize: '14px',
    fontWeight: 'bold',
  } : {};

  return (
    <Tooltip title={`热点 ${index + 1} - ${getHotspotTypeText(type)}`} arrow>
      <IconButton
        onClick={(e) => {
          // Stop event from bubbling up to parent container
          e.stopPropagation();
          onClick(e, index);
        }}
        sx={style}
      >
        {index + 1}
      </IconButton>
    </Tooltip>
  );
}

// Helper functions for hotspot colors and descriptions
function getHotspotColor(type) {
  switch (type) {
    case 'text': return 'primary.main';
    case 'audio': return 'success.main';
    case 'video': return 'error.main';
    default: return 'primary.main';
  }
}

function getHotspotTypeText(type) {
  switch (type) {
    case 'text': return '文字';
    case 'audio': return '音频';
    case 'video': return '视频';
    default: return '未设置';
  }
}

export function PicbookEditPopup({ open, onClose, picsUrlList, folderName, picbookId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Hotspot related states
  const [hotspots, setHotspots] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [hotspotsMap, setHotspotsMap] = useState({});
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const imageRef = useRef(null);
  const [imagePosition, setImagePosition] = useState(null);
  const containerRef = useRef(null);
  const [isLoadingHotspots, setIsLoadingHotspots] = useState(false);
  
  // Media content states
  const [audioOptions, setAudioOptions] = useState([]);
  const [videoOptions, setVideoOptions] = useState([]);
  const [contentTab, setContentTab] = useState(0);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  
  // Edit states for active hotspot
  const [editText, setEditText] = useState('');
  const [selectedAudioId, setSelectedAudioId] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState('');
  
  useEffect(() => {
    // Parse the JSON string to get the image filenames
    if (picsUrlList) {
      try {
        console.log('Parsing image URLs from:', picsUrlList);
        const urls = JSON.parse(picsUrlList);
        console.log('Parsed image URLs:', urls);
        setImageUrls(urls);
      } catch (error) {
        console.error('Failed to parse image URLs:', error);
        setImageUrls([]);
      }
    } else {
      console.log('No picsUrlList provided');
    }
  }, [picsUrlList]);
  
  useEffect(() => {
    const updateCurrentImageUrl = async () => {
      if (imageUrls.length === 0 || !folderName) {
        console.log('Cannot load image: empty URLs or missing folderName', { 
          imageUrlsLength: imageUrls.length, 
          folderName 
        });
        setCurrentImageUrl('');
        return;
      }

      setLoading(true);
      try {
        const currentImage = imageUrls[currentIndex];
        console.log('Fetching image:', `${folderName}/${currentImage}`);
        const { data } = supabase
          .storage
          .from('picbook')
          .getPublicUrl(`${folderName}/${currentImage}`);
        
        console.log('Got public URL:', data?.publicUrl);
        setCurrentImageUrl(data?.publicUrl || '');
      } catch (error) {
        console.error('Error getting public URL:', error);
        setCurrentImageUrl('');
      } finally {
        setLoading(false);
      }
    };

    updateCurrentImageUrl();
  }, [currentIndex, imageUrls, folderName]);
  
  // Load hotspots for the current page from database
  useEffect(() => {
    if (!picbookId || currentIndex === null || !open) return;
    
    const loadHotspotsFromDB = async () => {
      setIsLoadingHotspots(true);
      try {
        console.log(`Loading hotspots for picbook ${picbookId}, page ${currentIndex}`);
        
        const { data, error } = await supabase
          .from('hotspots')
          .select('*')
          .eq('picbook_id', picbookId)
          .eq('page_index', currentIndex)
          .order('id');
        
        if (error) {
          console.error('Error loading hotspots:', error);
          throw error;
        }
        
        console.log('Hotspots loaded from DB:', data);
        
        if (data && data.length > 0) {
          // Map DB hotspots to component format
          const mappedHotspots = data.map(hotspot => ({
            id: hotspot.id,
            x: parseFloat(hotspot.x),
            y: parseFloat(hotspot.y),
            type: hotspot.type,
            content: hotspot.content || '',
            audioId: hotspot.audio_id || '',
            videoId: hotspot.video_id || ''
          }));
          
          setHotspots(mappedHotspots);
          
          // Update hotspots map
          setHotspotsMap(prev => ({
            ...prev,
            [currentIndex]: mappedHotspots
          }));
        } else {
          // No hotspots for this page
          setHotspots([]);
        }
      } catch (error) {
        console.error('Failed to load hotspots:', error);
        setHotspots([]);
      } finally {
        setIsLoadingHotspots(false);
      }
    };
    
    loadHotspotsFromDB();
  }, [picbookId, currentIndex, open]);
  
  // Fetch audio and video options from Supabase when popup opens
  useEffect(() => {
    if (open) {
      fetchAudioOptions();
      fetchVideoOptions();
    }
  }, [open]);
  
  // Set edit form values when active hotspot changes
  useEffect(() => {
    if (activeHotspot !== null && hotspots[activeHotspot]) {
      const hotspot = hotspots[activeHotspot];
      setEditText(hotspot.content || '');
      setSelectedAudioId(hotspot.audioId || '');
      setSelectedVideoId(hotspot.videoId || '');
      console.log('Active hotspot changed:', {
        index: activeHotspot,
        content: hotspot.content,
        type: hotspot.type,
        audioId: hotspot.audioId,
        videoId: hotspot.videoId
      });
      
      // Set active tab based on hotspot type
      switch(hotspot.type) {
        case 'text': setContentTab(0); break;
        case 'audio': setContentTab(1); break;
        case 'video': setContentTab(2); break;
        default: setContentTab(0);
      }
    }
  }, [activeHotspot, hotspots]);
  
  // Fetch audio options from Supabase
  const fetchAudioOptions = async () => {
    setIsMediaLoading(true);
    try {
      console.log('Fetching audio options from Supabase');
      const { data, error } = await supabase
        .from('audio')
        .select('id, name, file_url');
      
      if (error) {
        console.log('Error fetching audio data:', error);
        throw error;
      }
      
      console.log('Audio data fetched successfully:', data);
      setAudioOptions(data || []);
    } catch (error) {
      console.log('Exception fetching audio options:', error);
    } finally {
      setIsMediaLoading(false);
    }
  };
  
  // Fetch video options from Supabase
  const fetchVideoOptions = async () => {
    setIsMediaLoading(true);
    try {
      console.log('Fetching video options from Supabase');
      const { data, error } = await supabase
        .from('video')
        .select('id, name, video_url');
      
      if (error) {
        console.log('Error fetching video data:', error);
        throw error;
      }

      console.log('Video data fetched successfully:', data);
      setVideoOptions(data || []);
    } catch (error) {
      console.log('Exception fetching video options:', error);
    } finally {
      setIsMediaLoading(false);
    }
  };
  
  const handlePrevious = () => {
    // Clear current image immediately and show loading state
    setCurrentImageUrl('');
    setImagePosition(null);
    setLoading(true);
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    handleClosePopover();
  };
  
  const handleNext = () => {
    // Clear current image immediately and show loading state
    setCurrentImageUrl('');
    setImagePosition(null);
    setLoading(true);
    setCurrentIndex((prevIndex) => (prevIndex < imageUrls.length - 1 ? prevIndex + 1 : prevIndex));
    handleClosePopover();
  };
  
  // Handle adding a new hotspot on image click
  const handleImageClick = async (event) => {
    if (!imageRef.current || !imagePosition || !picbookId) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate position within the image, not the container
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Only add hotspot if click is within image bounds
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      try {
        setIsSaving(true);
        
        // Create new hotspot in database
        const { data, error } = await supabase
          .from('hotspots')
          .insert({
            picbook_id: picbookId,
            page_index: currentIndex,
            x,
            y,
            type: 'text',
            content: '',  // Empty content for now
            audio_id: null,
            video_id: null
          })
          .select();
        
        if (error) {
          console.error('Error creating hotspot:', error);
          throw error;
        }
        
        console.log('New hotspot created:', data);
        
        if (data && data.length > 0) {
          // Add new hotspot to state
          const newHotspot = {
            id: data[0].id,
            x,
            y,
            content: '',
            type: 'text'
          };
          
          const newHotspots = [...hotspots, newHotspot];
          setHotspots(newHotspots);
          
          // Save hotspots for current page in the map
          setHotspotsMap(prev => ({
            ...prev,
            [currentIndex]: newHotspots
          }));
        }
      } catch (error) {
        console.error('Failed to create hotspot:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  // Popover handling
  const handleHotspotClick = (event, index) => {
    // Ensure the event doesn't bubble up
    event.stopPropagation();
    setActiveHotspot(index);
    setAnchorEl(event.currentTarget);
  };
  
  const handleClosePopover = () => {
    setActiveHotspot(null);
    setAnchorEl(null);
  };
  
  // Delete the active hotspot
  const handleDeleteHotspot = async () => {
    if (activeHotspot === null || !picbookId) return;
    
    const hotspotToDelete = hotspots[activeHotspot];
    if (!hotspotToDelete || !hotspotToDelete.id) {
      console.error('Cannot delete hotspot: missing ID');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Delete hotspot from database
      const { error } = await supabase
        .from('hotspots')
        .delete()
        .eq('id', hotspotToDelete.id);
      
      if (error) {
        console.error('Error deleting hotspot:', error);
        throw error;
      }
      
      console.log('Hotspot deleted:', hotspotToDelete.id);
      
      // Remove hotspot from state
      const newHotspots = hotspots.filter((_, index) => index !== activeHotspot);
      setHotspots(newHotspots);
      
      // Update the hotspots map
      setHotspotsMap(prev => ({
        ...prev,
        [currentIndex]: newHotspots
      }));
      
      // Close the popover
      handleClosePopover();
    } catch (error) {
      console.error('Failed to delete hotspot:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle content tab change
  const handleContentTabChange = (event, newValue) => {
    setContentTab(newValue);
  };
  
  // Save hotspot content and type based on active tab
  const saveHotspotContent = async () => {
    if (activeHotspot === null || !picbookId) return;
    
    const hotspotToUpdate = hotspots[activeHotspot];
    if (!hotspotToUpdate || !hotspotToUpdate.id) {
      console.error('Cannot update hotspot: missing ID');
      return;
    }
    
    let type = 'text';
    let content = null;
    let audio_id = null;
    let video_id = null;
    
    switch(contentTab) {
      case 0: // Text tab
        type = 'text';
        content = editText;
        break;
      case 1: // Audio tab
        type = 'audio';
        audio_id = selectedAudioId || null;
        break;
      case 2: // Video tab
        type = 'video';
        video_id = selectedVideoId || null;
        break;
      default:
        type = 'text';
        content = editText;
    }
    
    console.log('Saving hotspot content:', {
      type,
      content,
      audio_id,
      video_id,
      tab: contentTab
    });
    
    try {
      setIsSaving(true);
      
      // Update hotspot in database
      const { error } = await supabase
        .from('hotspots')
        .update({
          type,
          content,
          audio_id,
          video_id
        })
        .eq('id', hotspotToUpdate.id);
      
      if (error) {
        console.error('Error updating hotspot:', error);
        throw error;
      }
      
      console.log('Hotspot updated:', hotspotToUpdate.id);
      
      // Update hotspot in state
      const newHotspots = hotspots.map((hotspot, index) => {
        if (index === activeHotspot) {
          return { 
            ...hotspot, 
            type,
            content: content || '', 
            audioId: audio_id || '', 
            videoId: video_id || '' 
          };
        }
        return hotspot;
      });
      
      setHotspots(newHotspots);
      console.log('Updated hotspots for page', currentIndex, newHotspots);
      
      // Update the hotspots map
      setHotspotsMap(prev => ({
        ...prev,
        [currentIndex]: newHotspots
      }));
      
      // Close the popover
      handleClosePopover();
    } catch (error) {
      console.error('Failed to update hotspot:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Update image position calculation when the image loads
  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    updateImagePosition();
  };
  
  // Calculate the actual position and dimensions of the image within the container
  const updateImagePosition = () => {
    if (imageRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const imageRect = imageRef.current.getBoundingClientRect();
      
      // Calculate position relative to container
      setImagePosition({
        left: imageRect.left - containerRect.left,
        top: imageRect.top - containerRect.top,
        width: imageRect.width,
        height: imageRect.height,
      });
      
      console.log('Image position updated:', {
        left: imageRect.left - containerRect.left,
        top: imageRect.top - containerRect.top,
        width: imageRect.width,
        height: imageRect.height,
      });
    }
  };

  // Update image position on resize
  useEffect(() => {
    const handleResize = () => {
      updateImagePosition();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  if (!open) return null;
  
  return (
    <Dialog 
      fullScreen 
      open={open} 
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'background.default',
        },
      }}
    >
      <Box sx={{ position: 'relative', p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            zIndex: 3,
          }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>

        <DialogTitle sx={{ mb: 2 }}>
          详细编辑绘本
          {!picbookId && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              警告: 未提供绘本ID，热点将无法保存
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ 
          flexGrow: 1, 
          height: 'calc(100vh - 120px)', 
          p: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <Paper
              ref={containerRef}
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.neutral',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 2,
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={handleImageClick}
            >
              {(loading || isLoadingHotspots || isSaving) && (
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    bgcolor: 'rgba(0,0,0,0.1)',
                  }}
                >
                  <LoadingScreen />
                </Box>
              )}
              
              {!loading && imageUrls.length > 0 && currentImageUrl ? (
                <Box
                  ref={imageRef}
                  component="img"
                  src={currentImageUrl}
                  alt={`Page ${currentIndex + 1}`}
                  sx={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    position: 'relative',
                  }}
                  onLoad={handleImageLoad}
                  onError={() => {
                    console.error('Failed to load image');
                    setLoading(false);
                  }}
                />
              ) : !loading && (
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                  {imageUrls.length === 0 ? '无可显示的图片' : '加载图片中...'}
                </Typography>
              )}
              
              {/* Render hotspots */}
              {!loading && !isLoadingHotspots && !isSaving && imageUrls.length > 0 && currentImageUrl && imagePosition && 
                hotspots.map((hotspot, index) => (
                  <Hotspot
                    key={hotspot.id || index}
                    x={hotspot.x}
                    y={hotspot.y}
                    index={index}
                    type={hotspot.type}
                    imagePosition={imagePosition}
                    onClick={handleHotspotClick}
                  />
                ))}
            </Paper>
            
            {/* Hotspot Popover */}
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleClosePopover}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    width: 350,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: -8,
                      left: 'calc(50% - 8px)',
                      width: 16,
                      height: 16,
                      bgcolor: 'background.paper',
                      transform: 'rotate(45deg)',
                      zIndex: 0,
                    },
                  }
                }
              }}
            >
              <Card sx={{ boxShadow: 'none', position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                  <IconButton 
                    color="error" 
                    onClick={handleDeleteHotspot}
                    disabled={isSaving}
                  >
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    热点内容
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    选择热点内容类型并添加内容
                  </Typography>
                  
                  <Tabs value={contentTab} onChange={handleContentTabChange}>
                    <Tab label="文字" />
                    <Tab label="音频" />
                    <Tab label="视频" />
                  </Tabs>
                  
                  <Box sx={{ mt: 2 }}>
                    {/* Text content tab */}
                    {contentTab === 0 && (
                      <TextField
                        fullWidth
                        label="文字内容"
                        multiline
                        rows={4}
                        variant="outlined"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        disabled={isSaving}
                      />
                    )}
                    
                    {/* Audio content tab */}
                    {contentTab === 1 && (
                      <FormControl fullWidth>
                        <InputLabel id="audio-select-label">选择音频</InputLabel>
                        <Select
                          labelId="audio-select-label"
                          value={selectedAudioId}
                          label="选择音频"
                          onChange={(e) => {
                            console.log('Audio selection changed:', e.target.value);
                            setSelectedAudioId(e.target.value);
                          }}
                          disabled={isMediaLoading}
                        >
                          <MenuItem value="">
                            <em>无选择</em>
                          </MenuItem>
                          {audioOptions.length === 0 && (
                            <MenuItem disabled value="">
                              <em>没有可用的音频</em>
                            </MenuItem>
                          )}
                          {audioOptions.map((audio) => (
                            <MenuItem key={audio.id} value={audio.id}>
                              {audio.name || '未命名音频'}
                            </MenuItem>
                          ))}
                        </Select>
                        {isMediaLoading && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <LoadingScreen />
                          </Box>
                        )}
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            可用音频: {audioOptions.length} 个
                          </Typography>
                        </Box>
                      </FormControl>
                    )}
                    
                    {/* Video content tab */}
                    {contentTab === 2 && (
                      <FormControl fullWidth>
                        <InputLabel id="video-select-label">选择视频</InputLabel>
                        <Select
                          labelId="video-select-label"
                          value={selectedVideoId}
                          label="选择视频"
                          onChange={(e) => {
                            console.log('Video selection changed:', e.target.value);
                            setSelectedVideoId(e.target.value);
                          }}
                          disabled={isMediaLoading}
                        >
                          <MenuItem value="">
                            <em>无选择</em>
                          </MenuItem>
                          {videoOptions.length === 0 && (
                            <MenuItem disabled value="">
                              <em>没有可用的视频</em>
                            </MenuItem>
                          )}
                          {videoOptions.map((video) => (
                            <MenuItem key={video.id} value={video.id}>
                              {video.name || '未命名视频'}
                            </MenuItem>
                          ))}
                        </Select>
                        {isMediaLoading && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <LoadingScreen />
                          </Box>
                        )}
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            可用视频: {videoOptions.length} 个
                          </Typography>
                        </Box>
                      </FormControl>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button 
                      variant="contained" 
                      onClick={saveHotspotContent}
                      disabled={isSaving}
                    >
                      {isSaving ? '保存中...' : '保存'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Popover>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 2 }}>
              {/* Navigation buttons */}
              <Button 
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={handlePrevious}
                disabled={currentIndex === 0 || imageUrls.length === 0 || loading}
                variant="contained"
              >
                上一页
              </Button>
              
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                {imageUrls.length > 0 ? `${currentIndex + 1} / ${imageUrls.length}` : '0 / 0'}
              </Typography>
              
              <Button 
                endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                onClick={handleNext}
                disabled={currentIndex === imageUrls.length - 1 || imageUrls.length === 0 || loading}
                variant="contained"
              >
                下一页
              </Button>
            </Box>
            
            {/* Info text about hotspots */}
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 1, 
                textAlign: 'center',
                fontStyle: 'italic',
                opacity: 0.7
              }}
            >
              提示: 点击图片添加交互点，点击交互点编辑内容
            </Typography>
            
            {/* Hotspot type legend */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />
                <Typography variant="caption">文字</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                <Typography variant="caption">音频</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                <Typography variant="caption">视频</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
}
